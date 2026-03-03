
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

async function run() {
    const key = process.env.GOOGLE_GENAI_API_KEY;
    if (!key) {
        console.error("No API KEY found!");
        return;
    }
    console.log(`Checking models for key: ${key.slice(0, 8)}...`);

    // Test all keys
    const keys = [
        process.env.GOOGLE_GENAI_API_KEY,
        process.env.GOOGLE_GENAI_API_KEY_ALT,
        process.env.GOOGLE_GENAI_API_KEY_BACKUP
    ].filter(Boolean) as string[];

    for (const k of keys) {
        try {
            console.log(`\n--- Key: ${k.slice(0, 5)}... ---`);
            // We use the raw fetch/REST because the SDK listModels might be tricky or same as 404
            // But let's try a simple generation with known candidates to see what throws 404 vs 429

            const genAI = new GoogleGenerativeAI(k);

            // Try to use the model management API if available, 
            // otherwise just try a simple prompt on candidate models to see which one lives.

            const candidates = [
                'gemini-2.0-flash',
                'gemini-2.0-flash-exp',
                'gemini-1.5-flash',
                'gemini-1.5-flash-latest',
                'gemini-1.5-pro',
                'gemini-1.0-pro',
                'gemini-pro'
            ];

            for (const modelName of candidates) {
                try {
                    // process.stdout.write(`Testing ${modelName}: `);
                    const model = genAI.getGenerativeModel({ model: modelName });
                    const result = await model.generateContent("Hi");
                    await result.response;
                    console.log(`${modelName}: OK`);
                } catch (e: any) {
                    if (e.status === 404 || e.message?.includes('not found')) {
                        console.log(`${modelName}: 404`);
                    } else if (e.status === 429 || e.message?.includes('429')) {
                        console.log(`${modelName}: 429`);
                    } else {
                        console.log(`${modelName}: ERR ${e.status}`);
                    }
                }
            }

        } catch (err: any) {
            console.error("Global Error:", err);
        }
    }
}

run();
