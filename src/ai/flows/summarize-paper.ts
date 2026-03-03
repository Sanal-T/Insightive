
import { GoogleGenerativeAI } from '@google/generative-ai';



export interface SummarizePaperOutput {
    title: string;
    shortSummary: string;
    detailedSummary: string;
    majorFindings: string[];
    methods: string[];
    contributions: string[];
}

export async function summarizePaperFlow(text: string): Promise<SummarizePaperOutput> {
    const prompt = `
    You are an expert academic researcher.
    Analyze the following research paper text (extracted from title, abstract, intro, and conclusion).
    
    Produce a comprehensive summary in the following JSON format:
    {
      "title": "Exact title of the paper",
      "shortSummary": "A concise 2-3 sentence summary/abstract of the paper.",
      "detailedSummary": "A detailed 2-3 paragraph summary covering the problem, approach, and results.",
      "majorFindings": ["Finding 1", "Finding 2", ...],
      "methods": ["Method/Technique 1", "Dataset used", ...],
      "contributions": ["Key contribution 1", "Key contribution 2", ...]
    }

    Strictly rely on the provided text. If info is missing, state extracting failed.

    Paper Text:
    ${text}
    `;

    const keys = [
        process.env.GOOGLE_GENAI_API_KEY,
        process.env.GOOGLE_GENAI_API_KEY_ALT,
        process.env.GOOGLE_GENAI_API_KEY_BACKUP,
        process.env.GEMINI_API_KEY,
        process.env.NEXT_PUBLIC_GEMINI_API_KEY
    ].filter((k, i, self) => Boolean(k) && self.indexOf(k) === i) as string[];

    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        try {
            const key = keys[attempts % keys.length];

            // Reverting to single model strategy (2.0-flash) with KEY ROTATION only
            // because 1.5-flash returned 404 in verification.
            const modelName = 'gemini-2.0-flash';

            if (!key) throw new Error("No API Key found");

            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { responseMimeType: "application/json" }
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const jsonText = response.text();
            return JSON.parse(jsonText) as SummarizePaperOutput;

        } catch (error: any) {
            if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
                // Extract wait time from error: "Please retry in 50.5s"
                const match = error.message?.match(/retry in (\d+(\.\d+)?)s/);
                let waitTime = 5000;
                if (match && match[1]) {
                    waitTime = Math.ceil(parseFloat(match[1]) * 1000) + 1000; // Suggested time + 1s buffer
                }

                console.warn(`[Summarizer] Rate limit. Waiting ${waitTime / 1000}s before next key/retry...`);
                attempts++;
                if (attempts >= maxAttempts) throw error;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            throw error;
        }
    }

    throw new Error("Summarization failed after retries.");
}
