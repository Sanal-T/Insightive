import 'dotenv/config';
import { suggestRepositories } from '../src/ai/flows/suggest-repositories';
import { suggestPapers } from '../src/ai/flows/suggest-papers';
import { findDatasets } from '../src/lib/dataset-service';

async function main() {
    const topic = 'underwater basket weaving';
    console.log(`Testing AI flows for topic: "${topic}"...\n`);

    console.log('--- Repositories ---');
    try {
        const repos = await suggestRepositories(topic);
        console.log(JSON.stringify(repos, null, 2));
    } catch (e) {
        console.error('Repo Error:', e);
    }

    console.log('\n--- Papers ---');
    try {
        const papers = await suggestPapers(topic);
        console.log(JSON.stringify(papers, null, 2));
    } catch (e) {
        console.error('Paper Error:', e);
    }

    console.log('\n--- Datasets ---');
    try {
        const datasets = await findDatasets(topic);
        console.log(JSON.stringify(datasets, null, 2));
    } catch (e) {
        console.error('Dataset Error:', e);
    }
}

main().catch(console.error);
