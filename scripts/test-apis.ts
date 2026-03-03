import 'dotenv/config';
import { findDatasets } from '../src/lib/dataset-service';

async function main() {
    const topic = 'machine learning';
    console.log(`Testing findDatasets for topic: "${topic}"...`);

    try {
        const results = await findDatasets(topic);
        console.log(`Found ${results.length} datasets:`);
        results.forEach((d, i) => {
            console.log(`${i + 1}. [${d.source}] ${d.name} - ${d.url}`);
        });
    } catch (error) {
        console.error("Error finding datasets:", error);
    }
}

main().catch(console.error);
