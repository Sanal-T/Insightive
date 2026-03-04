
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import tempfile
from rag_agent import ingest_pdf, process_query

app = FastAPI()

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReviewRequest(BaseModel):
    doc_id: str
    question: str

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Literature Review Backend"}

@app.post("/ingest")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
        
        # Process
        doc_id = ingest_pdf(tmp_path)
        
        # Cleanup
        os.remove(tmp_path)
        
        return {"doc_id": doc_id, "message": "PDF ingested successfully."}
    except Exception as e:
        print(f"Error during ingestion: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/review")
async def generate_review(request: ReviewRequest):
    try:
        print(f"Received review request for doc_id: {request.doc_id}")
        response = process_query(request.doc_id, request.question)
        return {"response": response}
    except Exception as e:
        print(f"Error during generation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Backend Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
