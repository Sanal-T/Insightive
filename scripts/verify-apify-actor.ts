
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const token = process.env.APIFY_API_TOKEN;

const actors = [
    'apify/public-google-scholar-scraper', // Official-ish
    'lukaskrivka/google-scholar-scraper', // Known good
    'katerinahronik/google-scholar-scraper',
    'fast_google_scholar_scraper/fast_google_scholar_scraper'
];

async function run() {
    for (const actor of actors) {
        console.log(`\nTesting: ${actor}`);
        // Note: Different actors might have different input schemas.
        // We stick to common 'queries' or 'searchStrings'.
        const url = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${token}&memory=256`;

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    queries: ["machine learning"],
                    searchStrings: ["machine learning"], // Some use this
                    maxPages: 1,
                    resultsPerPage: 1
                })
            });

            console.log(`Status: ${res.status}`);
            if (res.ok) {
                console.log(`!!! SUCCESS: ${actor} !!!`);
                break;
            } else {
                if (res.status === 404) console.log("Not Found (404)");
                else {
                    const text = await res.text();
                    console.log(`Error: ${text.substring(0, 100)}...`);
                }
            }
        } catch (e) {
            console.error(`Ex: ${e.message}`);
        }
    }
}

run();
