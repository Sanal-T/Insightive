
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

console.log("Environment loaded.");
console.log("GOOGLE_GENAI_API_KEY:", process.env.GOOGLE_GENAI_API_KEY ? "EXISTS (" + process.env.GOOGLE_GENAI_API_KEY.substring(0, 5) + "...)" : "MISSING");

async function run() {
    try {
        console.log("Importing AI flow...");
        // Dynamic import to execute AFTER env is loaded
        const { analyzePaperFlow } = await import('../src/ai/flows/analyze-paper');

        console.log("1. Testing AI Flow...");
        const result = await analyzePaperFlow("Title: Test. Limitations: None. Future Work: More testing.");
        console.log("AI Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("AI Flow Error:", e);
    }

    /*
    try {
        console.log("2. Testing PDF Parse...");
        // PDF test removed to focus on AI
    } catch (e) {
    }
    */
}

run();
