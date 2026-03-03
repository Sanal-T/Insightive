
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const token = process.env.APIFY_API_TOKEN;

const actors = [
    'apify/public-google-scholar-scraper',
    'petrpatek/google-scholar-scraper',
    'easyapi/google-scholar-scraper'
];

async function run() {
    console.error(`[DEBUG] Checks started. Token present: ${!!token}`);

    for (const actor of actors) {
        process.stderr.write(`Checking ${actor} ... `);
        const url = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${token}&memory=256`;
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ queries: ["test"], maxPages: 1, resultsPerPage: 1 })
            }); // 5s timeout by default?

            console.error(`Status: ${res.status}`);
            if (res.ok) {
                console.error(`!!! FOUND WORKING ACTOR: ${actor} !!!`);
                process.exit(0);
            }
        } catch (e) {
            console.error(`Error: ${e.message}`);
        }
    }
    console.error("No working actor found.");
}
run();
