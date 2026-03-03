import { type Paper } from '@/lib/types';
import { XMLParser } from 'fast-xml-parser';

const ARXIV_API_ENDPOINT = 'http://export.arxiv.org/api/query';

interface ArxivEntry {
    id: string;
    title: string;
    summary: string;
    author: { name: string } | { name: string }[];
    link: { '@_href': string }[];
}

interface ArxivResponse {
    feed: {
        entry?: ArxivEntry | ArxivEntry[];
    };
}

export async function searchArxivPapers(query: string, maxResults: number = 5): Promise<Paper[]> {
    try {
        const url = new URL(ARXIV_API_ENDPOINT);
        url.searchParams.append('search_query', `all:${query}`);
        url.searchParams.append('start', '0');
        url.searchParams.append('max_results', maxResults.toString());
        url.searchParams.append('sortBy', 'relevance');
        url.searchParams.append('sortOrder', 'descending');

        console.log(`[arXiv] Fetching: ${url.toString()}`);

        const response = await fetch(url.toString());

        if (!response.ok) {
            console.error(`arXiv API Error: ${response.status} ${response.statusText}`);
            return [];
        }

        const xmlData = await response.text();
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
        const jsonData: ArxivResponse = parser.parse(xmlData);

        const entries = jsonData.feed.entry;

        if (!entries) {
            return [];
        }

        const entriesArray = Array.isArray(entries) ? entries : [entries];

        return entriesArray.map(entry => {
            // Clean up title and summary (arXiv often has newlines)
            const title = entry.title.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
            const description = entry.summary.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

            let authors: string[] = [];
            if (Array.isArray(entry.author)) {
                authors = entry.author.map(a => a.name);
            } else {
                authors = [entry.author.name];
            }

            // Find PDF link or fallback to ID
            // Link struct: { "@_href": "...", "@_rel": "alternate" }
            // We usually want the abstract page or PDF.
            // Let's grab the id (which is the abs url)
            const url = entry.id;

            return {
                title,
                authors,
                source: 'arXiv',
                url,
                description
            };
        });

    } catch (error) {
        console.error("Failed to fetch papers from arXiv:", error);
        return [];
    }
}
