
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-001',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-1.5-pro-001',
    'gemini-1.5-pro-002',
    'gemini-pro',
    'gemini-1.0-pro',
    'gemini-1.0-pro-001'
];

async function checkModels() {
    const keys = [
        process.env.GEMINI_API_KEY,
        process.env.GOOGLE_GENAI_API_KEY
    ].filter(k => !!k);

    console.log(`Checking ${keys.length} keys against ${models.length} models...`);

    for (const key of keys) {
        console.log(`\n--- KEY ENDING ...${key.slice(-4)} ---`);
        const genAI = new GoogleGenerativeAI(key);

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                // A token count is cheap and proves existence
                await model.countTokens("test");
                console.log(`[SUCCESS] ${modelName} EXIST!`);
            } catch (error: any) {
                if (error.status === 429 || error.message?.includes('429')) {
                    console.log(`[RATE LIMIT] ${modelName} EXISTS but busy.`);
                }
                // We explicitly IGNORE 404s to keep output clean
            }
        }
    }
    console.log("\nDone.");
}

checkModels();
