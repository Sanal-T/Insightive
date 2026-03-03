
import { suggestPapers } from '@/ai/flows/suggest-papers';
import { searchApifyPapers } from '@/lib/api/apify';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testApify() {
    const token = process.env.APIFY_API_TOKEN;
    console.log(`Token loaded: ${token ? (token.substring(0, 5) + '...') : 'NO'}`);

    const query = "reinforcement learning";
    console.log(`Testing Apify (Google Scholar) Search for: "${query}"`);

    try {
        // We call the service directly to isolate Apify
        const papers = await searchApifyPapers(query, 2); // Limit to 2 for speed/cost
        console.log(`Found ${papers.length} papers from Apify.`);

        if (papers.length > 0) {
            console.log("Top Result:");
            console.log(`- Title: ${papers[0].title}`);
            console.log(`- Source: ${papers[0].source}`);
            console.log(`- URL: ${papers[0].url}`);
        } else {
            console.warn("No papers found. Token might be invalid or actor failed.");
        }
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testApify();
