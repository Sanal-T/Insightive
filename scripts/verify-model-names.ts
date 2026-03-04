
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

    if (keys.length === 0) {
        console.error("No keys found.");
        return;
    }

    for (const key of keys) {
        console.log(`\n--- Checking Key: ...${key.substring(key.length - 4)} ---`);
        const genAI = new GoogleGenerativeAI(key);

        for (const modelName of models) {
            process.stdout.write(`Testing ${modelName}... `);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.countTokens("Hello world");
                console.log(`✅ OK`);
            } catch (error: any) {
                if (error.status === 404 || error.message?.includes('404')) {
                    console.log(`❌ 404 Not Found`);
                } else if (error.status === 429 || error.message?.includes('429')) {
                    console.log(`⚠️ 429 Rate Limited`);
                } else {
                    console.log(`❌ Error: ${error.status} - ${error.message}`);
                }
            }
        }
    }
}

checkModels();
