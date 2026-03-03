import { type Paper } from '@/lib/types';

const CROSSREF_API_ENDPOINT = 'https://api.crossref.org/works';

interface CrossrefAuthor {
    given?: string;
    family?: string;
    name?: string;
}

interface CrossrefItem {
    title?: string[];
    author?: CrossrefAuthor[];
    URL: string;
    publisher: string;
    abstract?: string; // Often XML-like or missing
    DOI?: string;
    type: string; // 'journal-article', etc.
}

interface CrossrefResponse {
    message: {
        items: CrossrefItem[];
    };
}

export async function searchCrossrefPapers(query: string, maxResults: number = 5): Promise<Paper[]> {
    try {
        const url = new URL(CROSSREF_API_ENDPOINT);
        url.searchParams.append('query.bibliographic', query);
        url.searchParams.append('rows', maxResults.toString());
        url.searchParams.append('sort', 'relevance');
        // Filter for journal articles or proceedings to avoid datasets/components if possible, but general search is fine
        url.searchParams.append('filter', 'type:journal-article,type:proceedings-article');

        // Polite pool if email is present
        const email = process.env.CROSSREF_EMAIL;
        if (email) {
            url.searchParams.append('mailto', email);
        }

        console.log(`[Crossref] Fetching: ${url.toString()}`);

        const response = await fetch(url.toString(), {
            headers: {
                'User-Agent': 'Insightive-Research-App/1.0'
            }
        });

        if (!response.ok) {
            console.error(`Crossref API Error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data: CrossrefResponse = await response.json();
        const items = data.message.items;

        if (!items || items.length === 0) {
            return [];
        }

        return items.map(item => {
            const title = item.title ? item.title[0] : 'Untitled';
            const authors = item.author
                ? item.author.map(a => `${a.given || ''} ${a.family || a.name || ''}`.trim())
                : ['Unknown Author'];

            // Clean abstract if present (Crossref abstracts are often rare or messy XML tokens)
            // For now, use publisher or type as description if abstract missing
            let description = item.publisher;
            if (item.abstract) {
                // Basic cleanup of JATS XML tags like <jats:p>
                description = item.abstract.replace(/<[^>]+>/g, '');
            }

            return {
                title,
                authors,
                source: item.publisher || 'Crossref',
                url: item.URL || `https://doi.org/${item.DOI}`,
                description: description || 'No description available.'
            };
        });

    } catch (error) {
        console.error("Failed to fetch papers from Crossref:", error);
        return [];
    }
}
