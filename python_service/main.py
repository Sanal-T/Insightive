import os
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from google import genai
from google.genai import types
from io import BytesIO
from dotenv import load_dotenv
from pydantic import BaseModel
import json

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
api_key = os.getenv("GOOGLE_GENAI_API_KEY")
if not api_key:
    # Try getting it from parent directory .env if not found (dev convenience)
    load_dotenv("../.env")
    api_key = os.getenv("GOOGLE_GENAI_API_KEY")

class AnalysisResponse(BaseModel):
    title: str
    detailed_summary: str
    gap: str
    future_scope: str

@app.get("/")
def read_root():
    return {"message": "Literature Review Backend is running. Use POST /analyze to analyze papers."}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_paper(file: UploadFile = File(...)):
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_GENAI_API_KEY not found in environment variables.")

    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        # Read PDF content
        contents = await file.read()
        pdf_file = BytesIO(contents)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        # Initialize Client
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
        Analyze the following research paper text and provide a structured review.
        Return the response in JSON format with exactly the following keys:
        
        1. "title": The title of the paper.
        2. "detailed_summary": A clear, concise summary of the paper's core contributions and approach (1-2 paragraphs).
        3. "gap": Specific limitations or gaps identified in the current work or the field it addresses (bullet points).
        4. "future_scope": Potential directions for future research or improvements (bullet points).

        Use well-formatted markdown for the string values where appropriate (e.g. using bullet points).
        
        Paper Text:
        {text}
        """

        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json'
            )
        )
        
        # Parse JSON response
        try:
            result = json.loads(response.text)
        except json.JSONDecodeError:
             # Fallback if strict JSON fails
             clean_text = response.text.strip()
             if clean_text.startswith("```json"):
                 clean_text = clean_text[7:-3]
             result = json.loads(clean_text)

        return result

    except Exception as e:
        print(f"Error analyzing paper: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
