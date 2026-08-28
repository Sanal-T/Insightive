import os
import fitz  # PyMuPDF
import uuid
import json
from typing import Dict, List, Any

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaLLM
from langchain_core.documents import Document

# -------------------------------------------------
# Global in-memory store
# -------------------------------------------------
data_store: Dict[str, Any] = {}

# -------------------------------------------------
# LLM — gemma3:12b via Ollama (local, no API limits)
# -------------------------------------------------
def get_llm(model: str = "gemma3:1b"):
    return OllamaLLM(model=model, temperature=0.1)

# -------------------------------------------------
# PDF Processing
# -------------------------------------------------
def extract_title(text: str) -> str:
    """Try to extract paper title from first non-empty lines."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    # Title is usually one of the first 5 non-empty lines, longest short line
    candidates = [l for l in lines[:10] if 10 < len(l) < 150]
    return candidates[0] if candidates else "Untitled Paper"


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
        elif "limitation" in lower and len(lower) < 20:
            current = "limitations"
        elif "future" in lower and len(lower) < 20:
            current = "future_work"
        sections.setdefault(current, []).append(line)
    return {k: "\n".join(v) for k, v in sections.items()}


def ingest_pdf(file_path: str, filename: str = "") -> str:
    doc = fitz.open(file_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()

    sections = split_sections(full_text)
    title = extract_title(full_text)
    if filename:
        # Use filename (minus .pdf) as a readable title fallback
        base = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ")
        if base and base != "Untitled Paper":
            title = base

    documents = [Document(page_content=full_text, metadata={"source": "pdf"})]
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vector_store = FAISS.from_documents(documents, embeddings)

    doc_id = str(uuid.uuid4())
    data_store[doc_id] = {
        "vector_store": vector_store,
        "sections": sections,
        "full_text": full_text,
        "title": title,
    }
    return doc_id


# -------------------------------------------------
# Single-paper structured analysis (Ollama)
# -------------------------------------------------
ANALYSIS_PROMPT = """\
You are an expert academic research analyst. Analyze the following research paper text and return a JSON object with exactly these keys:
- "methodology": 2-3 sentence description of the research method/approach used
- "key_findings": 2-3 most important results or contributions
- "limitations": 2-3 specific limitations mentioned or implied
- "research_gaps": 2-3 gaps in knowledge this paper leaves unaddressed
- "future_work": 2-3 concrete future research directions

Return ONLY valid JSON. No markdown, no extra text.

Paper text:
{text}
"""

def analyze_single_paper(text: str, title: str) -> Dict[str, str]:
    llm = get_llm()
    excerpt = text[:5000]
    prompt = ANALYSIS_PROMPT.format(text=excerpt)
    try:
        raw = llm.invoke(prompt)
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw)
        result["title"] = title
        return result
    except Exception as e:
        err_str = str(e).lower()
        print(f"[analyze_single_paper] Error for '{title}': {e}")
        # Friendly message for out-of-memory errors
        if "memory" in err_str or "oom" in err_str or "gib" in err_str:
            msg = "⚠️ Not enough RAM for this model. Close other apps and retry, or use a smaller model."
        elif "connection" in err_str or "refused" in err_str:
            msg = "⚠️ Cannot connect to Ollama. Make sure Ollama is running (ollama serve)."
        elif "not found" in err_str or "does not exist" in err_str:
            msg = "⚠️ Model not found. Run: ollama pull gemma3:4b"
        else:
            msg = f"Analysis error: {str(e)[:200]}"
        return {
            "title": title,
            "methodology": msg,
            "key_findings": "—",
            "limitations": "—",
            "research_gaps": "—",
            "future_work": "—",
        }


def analyze_papers_by_ids(doc_ids: List[str]) -> List[Dict[str, str]]:
    """Analyze one or more indexed PDFs and return structured comparison data."""
    results = []
    for doc_id in doc_ids:
        if doc_id not in data_store:
            results.append({"title": f"[Unknown doc: {doc_id}]", "error": "Not found"})
            continue
        entry = data_store[doc_id]
        text = entry.get("full_text", "")
        title = entry.get("title", "Untitled")
        result = analyze_single_paper(text, title)
        results.append(result)
    return results


def analyze_papers_from_abstracts(papers: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """
    Analyze papers provided as {title, abstract} dicts (from online search).
    Uses the abstract as the paper text.
    """
    results = []
    for paper in papers:
        title = paper.get("title", "Untitled")
        abstract = paper.get("abstract", "") or paper.get("description", "")
        authors = paper.get("authors", "")
        source = paper.get("source", "")

        text = f"Title: {title}\nAuthors: {authors}\nSource: {source}\n\nAbstract:\n{abstract}"
        result = analyze_single_paper(text, title)
        results.append(result)
    return results


# -------------------------------------------------
# Legacy single-doc review (keep backward compat)
# -------------------------------------------------
def process_query(doc_id: str, query: str) -> str:
    results = analyze_papers_by_ids([doc_id])
    if not results:
        return "Document not found."
    r = results[0]
    return f"""# Literature Review\n\n## Methodology\n{r.get('methodology','')}\n\n## Key Findings\n{r.get('key_findings','')}\n\n## Limitations\n{r.get('limitations','')}\n\n## Research Gaps\n{r.get('research_gaps','')}\n\n## Future Research Directions\n{r.get('future_work','')}"""


# -------------------------------------------------
# RAG-based Summarization (gemma3:1b, offline)
# -------------------------------------------------
SUMMARY_PROMPT = """\
You are a research paper summarization expert.
Using the following extracted sections from a research paper, produce a structured summary.

Return ONLY valid JSON with exactly these keys:
- "title": paper title (string)
- "objective": 2-3 sentences on what the paper aims to do
- "methodology": 2-3 sentences on how it was done
- "key_findings": 3-4 bullet points of the most important results (as a single string with newlines)
- "contributions": 2-3 main contributions
- "limitations": 2-3 key limitations
- "conclusion": 1-2 sentence takeaway

Return ONLY valid JSON. No markdown fences, no extra text.

Extracted paper sections:
{context}
"""

RAG_QUERIES = [
    "abstract objective purpose goal",
    "methodology method approach technique",
    "results findings experiments performance",
    "conclusion discussion future work",
    "limitation weakness constraint",
    "contribution novelty innovation",
]

def summarize_paper_rag(doc_id: str) -> Dict[str, str]:
    """
    RAG-based summarization:
    1. Queries FAISS with multiple research-focused queries
    2. Retrieves only the most relevant chunks (not full doc)
    3. Feeds those chunks to gemma3:1b for summarization
    """
    if doc_id not in data_store:
        return {"error": "Document not found."}

    entry = data_store[doc_id]
    vector_store = entry["vector_store"]
    title = entry.get("title", "Untitled Paper")

    seen_chunks: set = set()
    relevant_chunks = []

    for query in RAG_QUERIES:
        try:
            docs = vector_store.similarity_search(query, k=2)
            for doc in docs:
                chunk = doc.page_content.strip()
                key = chunk[:100]
                if key not in seen_chunks and len(chunk) > 50:
                    seen_chunks.add(key)
                    relevant_chunks.append(chunk)
        except Exception:
            pass

    if not relevant_chunks:
        relevant_chunks = [entry.get("full_text", "")[:3000]]

    context = "\n\n---\n\n".join(relevant_chunks)
    if len(context) > 4000:
        context = context[:4000]

    llm = get_llm()
    prompt = SUMMARY_PROMPT.format(context=context)

    try:
        raw = llm.invoke(prompt)
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw)
        result["title"] = result.get("title") or title
        return result
    except Exception as e:
        err_str = str(e).lower()
        print(f"[summarize_paper_rag] Error: {e}")
        if "memory" in err_str or "gib" in err_str or "oom" in err_str:
            msg = "⚠️ Not enough RAM. Close other apps and try again."
        elif "connection" in err_str or "refused" in err_str:
            msg = "⚠️ Cannot connect to Ollama. Make sure it is running."
        else:
            msg = f"Summarization failed: {str(e)[:200]}"
        return {
            "title": title,
            "objective": msg,
            "methodology": "—",
            "key_findings": "—",
            "contributions": "—",
            "limitations": "—",
            "conclusion": "—",
        }
