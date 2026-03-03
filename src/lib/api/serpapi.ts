import { type Paper } from '@/lib/types';

const SERPAPI_ENDPOINT = 'https://serpapi.com/search.json';

interface SerpApiResult {
    title: string;
    link?: string;
    publication_info?: {
        summary?: string;
    };
    snippet?: string;
    inline_links?: {
        serpapi_cite_link?: string;
    };
    resources?: {
        title: string;
        link: string;
    }[];
}

interface SerpApiResponse {
    organic_results?: SerpApiResult[];
    error?: string;
}

export async function searchSerpApiPapers(query: string, maxResults: number = 5): Promise<Paper[]> {
    const apiKey = process.env.SERPAPI_KEY;

    if (!apiKey) {
        // Silent return or debug log only to avoid cluttering consoles for users without keys
        // console.debug("SERPAPI_KEY not found. Skipping Google Scholar search.");
        return [];
    }

    try {
        const url = new URL(SERPAPI_ENDPOINT);
        url.searchParams.append('engine', 'google_scholar');
        url.searchParams.append('q', query);
        url.searchParams.append('api_key', apiKey);
        url.searchParams.append('num', maxResults.toString());

        console.log(`[SerpApi] Fetching Google Scholar results...`);

        const response = await fetch(url.toString());

        if (!response.ok) {
            console.error(`SerpApi Error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data: SerpApiResponse = await response.json();

        if (data.error) {
            console.error(`SerpApi API Error: ${data.error}`);
            return [];
        }

        const results = data.organic_results;

        if (!results || results.length === 0) {
            return [];
        }

        return results.map(result => {
            // Extract authors/source from publication_info if available
            // Format often: "Authors - Source, Year - publisher"
            let authors: string[] = ['Unknown'];
            let source = 'Google Scholar';

            if (result.publication_info && result.publication_info.summary) {
                const parts = result.publication_info.summary.split('-');
                if (parts.length > 0) {
                    authors = parts[0].split(',').map(s => s.trim());
                }
                if (parts.length > 1) {
                    source = parts[1].trim();
                }
            }

            return {
                title: result.title,
                authors,
                source,
                url: result.link || (result.resources && result.resources.length > 0 ? result.resources[0].link : '') || 'https://scholar.google.com',
                description: result.snippet || 'No snippet available.'
            };
        });

    } catch (error) {
        console.error("Failed to fetch papers from SerpApi:", error);
        return [];
    }
}
