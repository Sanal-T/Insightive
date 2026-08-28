from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import shutil
import os
import tempfile
from rag_agent import ingest_pdf, analyze_papers_by_ids, analyze_papers_from_abstracts, process_query, summarize_paper_rag

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ───────────────────────────────────────────
class ReviewRequest(BaseModel):
    doc_id: str
    question: str

class AnalyzeRequest(BaseModel):
    doc_ids: List[str]

class AbstractPaper(BaseModel):
    title: str
    abstract: Optional[str] = ""
    description: Optional[str] = ""
    authors: Optional[str] = ""
    source: Optional[str] = ""

class AbstractsRequest(BaseModel):
    papers: List[AbstractPaper]

# ─── Health ───────────────────────────────────────────
@app.get("/")
def health_check():
    return {"status": "ok", "service": "Literature Review Backend (Ollama)"}

# ─── PDF Ingest ───────────────────────────────────────
@app.post("/ingest")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
        doc_id = ingest_pdf(tmp_path, filename=file.filename)
        os.remove(tmp_path)
        return {"doc_id": doc_id, "filename": file.filename, "message": "PDF ingested successfully."}
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ─── Legacy single-doc review ─────────────────────────
@app.post("/review")
async def generate_review(request: ReviewRequest):
    try:
        response = process_query(request.doc_id, request.question)
        return {"response": response}
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Backend Error: {str(e)}")

# ─── NEW: Compare multiple uploaded PDFs ──────────────
@app.post("/analyze")
async def analyze_docs(request: AnalyzeRequest):
    """Analyze one or more indexed doc_ids and return comparison table data."""
    try:
        if not request.doc_ids:
            raise HTTPException(status_code=400, detail="Provide at least one doc_id.")
        results = analyze_papers_by_ids(request.doc_ids)
        return {"papers": results}
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ─── NEW: Compare papers from search (abstract only) ──
@app.post("/analyze_abstracts")
async def analyze_abstracts(request: AbstractsRequest):
    """Analyze papers provided as title+abstract (from online search results)."""
    try:
        if not request.papers:
            raise HTTPException(status_code=400, detail="Provide at least one paper.")
        papers_dicts = [p.model_dump() for p in request.papers]
        results = analyze_papers_from_abstracts(papers_dicts)
        return {"papers": results}
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ─── NEW: RAG Summarization ────────────────────────────
class SummarizeRequest(BaseModel):
    doc_id: str

@app.post("/summarize")
async def summarize_doc(request: SummarizeRequest):
    """RAG-based summarization of an uploaded PDF via gemma3:1b."""
    try:
        result = summarize_paper_rag(request.doc_id)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
