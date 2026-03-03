
import { suggestPapers } from '@/ai/flows/suggest-papers';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testArxiv() {
    const query = "deep learning";
    console.log(`Testing arXiv Search for: "${query}"`);

    try {
        const papers = await suggestPapers(query);
        console.log(`Found ${papers.length} papers.`);

        if (papers.length > 0) {
            console.log("Top Result:");
            console.log(`- Title: ${papers[0].title}`);
            console.log(`- Source: ${papers[0].source}`);
            console.log(`- URL: ${papers[0].url}`);
        } else {
            console.warn("No papers found on arXiv. (Fallback might have failed too?)");
        }
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testArxiv();
