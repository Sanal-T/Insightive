import 'dotenv/config';
import { ai } from '../src/ai/genkit';
import * as fs from 'fs';

const logFile = 'genkit-log.txt';
function log(msg: string) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function main() {
    fs.writeFileSync(logFile, ''); // Clear file
    log("Starting Diagnostics...");
    log(`CWD: ${process.cwd()}`);

    if (process.env.GOOGLE_GENAI_API_KEY) {
        log("GOOGLE_GENAI_API_KEY is set (length: " + process.env.GOOGLE_GENAI_API_KEY.length + ")");
    } else {
        log("GOOGLE_GENAI_API_KEY is MISSING!");
    }

    log("Creating prompt...");
    try {
        const simplePrompt = ai.definePrompt({
            name: 'testPrompt',
            input: { schema: undefined },
            prompt: 'Say hello',
        });

        log("Running prompt...");
        const result = await simplePrompt();
        log("Result: " + result.text);
    } catch (error: any) {
        log("Genkit Error Stack: " + error.stack);
        log("Genkit Error Message: " + error.message);
    }
}

main().catch(err => log("Main Error: " + err));
