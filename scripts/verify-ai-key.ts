
import dotenv from 'dotenv';
import path from 'path';

// Load env vars BEFORE importing any app code
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testSemanticSearch() {
    // Dynamic import to ensure env vars are set first
    const { suggestRepositories } = await import('@/ai/flows/suggest-repositories');

    const query = "flappy bird clone";
    console.log(`Testing Semantic Search for: "${query}"`);

    try {
        const results = await suggestRepositories(query);
        console.log(`Found ${results.length} repositories.`);

        if (results.length > 0) {
            console.log("Top Result:", results[0].full_name);
        } else {
            console.warn("No results found.");
        }
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testSemanticSearch();
