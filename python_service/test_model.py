import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_GENAI_API_KEY")
if not api_key:
    load_dotenv("../.env")
    api_key = os.getenv("GOOGLE_GENAI_API_KEY")

client = genai.Client(api_key=api_key)

try:
    print("Testing gemini-2.5-flash...")
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents='Hello, can you hear me?',
    )
    print("Response received:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
