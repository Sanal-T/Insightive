
import { suggestDatasets } from '../src/ai/flows/suggest-datasets';

async function main() {
    const query = 'cancer detection';
    console.log(`Searching datasets for: "${query}"...`);
    try {
        const results = await suggestDatasets(query);
        console.log('Results:', JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('Error searching datasets:', error);
    }
}

main();
