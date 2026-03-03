
import { ai } from '../src/ai/genkit';
import path from 'path';
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

async function run() {
    console.log("Checking available models...");
    try {
        // Genkit doesn't have a direct 'listModels' on the instance in all versions, 
        // but let's try to infer or run a dummy generation to see the error or success
        // actually, keeping it simple: just try to generate content with the configured model.

        console.log("Attempting generation with configured default model...");
        const response = await ai.generate({
            prompt: 'Hello, are you working?'
        });
        console.log("Success! Response:", response.text);
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
