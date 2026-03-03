
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

async function run() {
    console.log("Testing Direct Gemini Client (1.5 Flash)...");
    const key = process.env.GOOGLE_GENAI_API_KEY;
    if (!key) {
        console.error("❌ API Key missing");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
        You are an expert academic researcher. 
        Output must be a valid JSON object.
        {
          "title": "Title",
          "authors": "Authors",
          "methodology": "Methodology",
          "limitations": ["Limitations"],
          "futureWork": ["Future Work"]
        }
        Paper Text: Title: AI. Authors: Me. Methodology: Test. Limitations: None. Future Work: None.
        `;

        console.log("Sending prompt...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log("Success:", response.text());

    } catch (error: any) {
        console.error("❌ Error:", error.message || error);
        if (error.response) {
            console.error("API Response:", error.response);
        }
    }
}

run();
