import { type Paper } from '@/lib/types';

// Actor: kdjLO0hegCjr5Ejqp (User provided Google Scholar Scraper)
// Endpoint: Run Actor Synchronously and get dataset items
const APIFY_ACTOR_ID = 'kdjLO0hegCjr5Ejqp';
const APIFY_ENDPOINT = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items`;

interface ApifyScholarResult {
    title?: string;
    url?: string;
    articleUrl?: string;
    link?: string;
    author?: { name: string }[] | string[];
    publicationInfo?: { summary?: string };
    snippet?: string;
    description?: string;
    position?: number;
}

export async function searchApifyPapers(query: string, maxResults: number = 5): Promise<Paper[]> {
    const token = process.env.APIFY_API_TOKEN;

    if (!token) {
        return [];
    }

    try {
        const url = new URL(APIFY_ENDPOINT);
        url.searchParams.append('token', token);
        url.searchParams.append('memory', '256');
        url.searchParams.append('timeout', '45'); // Allow more time

        // Verified input schema from user snippet
        const input = {
            keyword: query,
            maxItems: maxResults,
            sortBy: "relevance",
            articleType: "any",
            proxyOptions: {
                useApifyProxy: true
            }
        };

        console.log(`[Apify] Fetching Google Scholar results via Actor ${APIFY_ACTOR_ID}...`);

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(input)
        });

        if (!response.ok) {
            // Log error but don't break the app
            const errorText = await response.text();
            console.error(`Apify API Error: ${response.status} ${response.statusText}`);
            console.error(`Apify Error Details: ${errorText}`);
            return [];
        }

        const data: ApifyScholarResult[] = await response.json();
        console.log(`[Apify] Response Data Length: ${Array.isArray(data) ? data.length : 'Not Array'}`);

        if (!Array.isArray(data) || data.length === 0) {
            return [];
        }

        return data.map(item => {
            const title = item.title || 'Untitled';
            const url = item.articleUrl || item.link || item.url || '';

            // Flexible author parsing
            let authors = ['Unknown'];
            if (Array.isArray(item.author)) {
                // Check if array of objects or strings
                if (item.author.length > 0 && typeof item.author[0] === 'object' && 'name' in item.author[0]) {
                    authors = (item.author as { name: string }[]).map(a => a.name);
                } else {
                    authors = item.author as string[];
                }
            } else if (item.publicationInfo?.summary) {
                authors = [item.publicationInfo.summary.split('-')[0].trim()];
            }

            return {
                title,
                authors,
                source: 'Google Scholar (Apify)',
                url,
                description: item.snippet || item.description || 'No description available.'
            };
        });

    } catch (error) {
        console.error("Failed to fetch papers from Apify:", error);
        return [];
    }
}
