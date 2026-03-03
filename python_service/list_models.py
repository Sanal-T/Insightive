import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_GENAI_API_KEY")
if not api_key:
    load_dotenv("../.env")
    api_key = os.getenv("GOOGLE_GENAI_API_KEY")

client = genai.Client(api_key=api_key)
print("Listing models...")
for model in client.models.list(config={"page_size": 100}):
    print(model.name)
