import os
import fitz  # PyMuPDF
import uuid
import time
from typing import Dict, TypedDict, Any

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.llms import Ollama
from langchain_core.documents import Document
from langgraph.graph import StateGraph, END

# -------------------------------------------------
# Global in-memory store
# -------------------------------------------------
data_store: Dict[str, Any] = {}

# -------------------------------------------------
# LangGraph State
# -------------------------------------------------
class LiteratureState(TypedDict):
    doc_id: str
    query: str
    section_summaries: Dict[str, str]
    gaps: str
    future_work: str
    final_output: str

# -------------------------------------------------
# 1. PDF Processing
# -------------------------------------------------
def split_sections(text: str) -> Dict[str, str]:
    sections = {}
    current = "general"

    for line in text.split("\n"):
        lower = line.lower().strip()

        if "abstract" in lower and len(lower) < 20:
            current = "abstract"
        elif "introduction" in lower and len(lower) < 20:
            current = "introduction"
        elif ("method" in lower or "methodology" in lower) and len(lower) < 20:
            current = "methodology"
        elif "result" in lower and len(lower) < 20:
            current = "results"
        elif "discussion" in lower and len(lower) < 20:
            current = "discussion"
        elif "conclusion" in lower and len(lower) < 20:
            current = "conclusion"

        sections.setdefault(current, []).append(line)

    return {k: "\n".join(v) for k, v in sections.items()}


def ingest_pdf(file_path: str) -> str:
    doc = fitz.open(file_path)
    full_text = ""

    for page in doc:
        full_text += page.get_text()

    sections = split_sections(full_text)

    # Vector store (optional future use)
    documents = [Document(page_content=full_text, metadata={"source": "pdf"})]
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vector_store = FAISS.from_documents(documents, embeddings)

    doc_id = str(uuid.uuid4())
    data_store[doc_id] = {
        "vector_store": vector_store,
        "sections": sections,
        "full_text": full_text,
    }

    return doc_id

# -------------------------------------------------
# LLM (Ollama – FREE)
# -------------------------------------------------
def get_llm():
    return Ollama(
        model="llama3",
        temperature=0.1
    )

# -------------------------------------------------
# 2. Summarization Agent
# -------------------------------------------------
def summarize_agent(state: LiteratureState):
    doc_id = state["doc_id"]
    sections = data_store[doc_id]["sections"]
    llm = get_llm()

    combined_text = ""
    for sec in ["abstract", "methodology", "results", "conclusion"]:
        content = sections.get(sec, "")
        if len(content) > 100:
            combined_text += f"\n\n--- SECTION: {sec.upper()} ---\n{content[:5000]}"

    if not combined_text:
        combined_text = data_store[doc_id]["full_text"][:8000]

    prompt = f"""
You are a research assistant.

Summarize the following paper sections.
Focus on:
- Problem
- Method
- Results
- Limitations

Text:
{combined_text}
"""

    try:
        time.sleep(1)
        result = llm.invoke(prompt)
        summaries = {"main": result}
    except Exception as e:
        summaries = {"main": f"Summarization failed: {e}"}

    return {"section_summaries": summaries}

# -------------------------------------------------
# 3. Research Gap Agent
# -------------------------------------------------
def gap_agent(state: LiteratureState):
    summaries = state["section_summaries"]
    llm = get_llm()

    text = "\n\n".join(summaries.values())

    prompt = f"""
You are an expert academic researcher.

From the following summaries, identify:
1. Key limitations
2. Missing evaluations or datasets
3. Unexplored research directions

Summaries:
{text}

Return bullet points.
"""

    result = llm.invoke(prompt)
    return {"gaps": result}

# -------------------------------------------------
# 4. Future Work Agent
# -------------------------------------------------
def future_agent(state: LiteratureState):
    llm = get_llm()
    gaps = state["gaps"]

    prompt = f"""
Based on the research gaps below,
suggest 3–5 strong future research directions.
Make them suitable for MSc/PhD work.

Research Gaps:
{gaps}
"""

    result = llm.invoke(prompt)
    return {"future_work": result}

# -------------------------------------------------
# 5. Compiler (UI Output)
# -------------------------------------------------
def compiler_node(state: LiteratureState):
    summary = list(state["section_summaries"].values())[0]

    final_output = f"""
# Literature Review

## Summary
{summary}

## Research Gaps
{state['gaps']}

## Future Research Directions
{state['future_work']}
"""
    return {"final_output": final_output}

# -------------------------------------------------
# 6. LangGraph Pipeline
# -------------------------------------------------
def build_graph():
    graph = StateGraph(LiteratureState)

    graph.add_node("summarize", summarize_agent)
    graph.add_node("gap", gap_agent)
    graph.add_node("future", future_agent)
    graph.add_node("compile", compiler_node)

    graph.set_entry_point("summarize")
    graph.add_edge("summarize", "gap")
    graph.add_edge("gap", "future")
    graph.add_edge("future", "compile")
    graph.add_edge("compile", END)

    return graph.compile()

app_graph = build_graph()

# -------------------------------------------------
# 7. API Entry Function
# -------------------------------------------------
def process_query(doc_id: str, query: str):
    if doc_id not in data_store:
        return "Document not found."

    inputs = {
        "doc_id": doc_id,
        "query": query,
        "section_summaries": {},
        "gaps": "",
        "future_work": "",
        "final_output": "",
    }

    result = app_graph.invoke(inputs)
    return result["final_output"]
