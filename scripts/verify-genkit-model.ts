
import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import path from 'path';
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

async function testModel(modelName) {
    console.log(`\nTesting Genkit Model: "${modelName}"...`);
    try {
        const ai = genkit({
            plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
            model: modelName,
        });

        const { output } = await ai.generate({
            prompt: 'Hi',
        });

        console.log(`✅ [${modelName}] Success! Output: ${output.text.substring(0, 50)}...`);
        return true;
    } catch (e: any) {
        // Genkit errors often wrapped
        console.log(`❌ [${modelName}] Failed: ${e.message.split('\n')[0]}`);
        return false;
    }
}

async function run() {
    const candidates = [
        'googleai/gemini-flash-latest',
        'googleai/gemini-2.0-flash',
        'gemini-2.0-flash',
        'googleai/gemini-2.0-flash-001',
        'googleai/gemini-1.5-flash-latest' // Just in case
    ];

    for (const model of candidates) {
        if (await testModel(model)) {
            console.log(`\n🎉 Found working model: ${model}`);
            break;
        }
    }
}

run();
