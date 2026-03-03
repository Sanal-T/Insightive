import { type Paper } from '@/lib/types';

const IEEE_API_ENDPOINT = 'http://ieeexploreapi.ieee.org/api/v1/search/articles';

interface IEEEResponse {
    articles?: IEEEArticle[];
    total_records: number;
}

interface IEEEArticle {
    title: string;
    authors?: { authors: { full_name: string }[] };
    publication_title: string;
    abstract?: string;
    html_url: string;
    pdf_url?: string;
    doi?: string;
}

export async function searchIEEEPapers(query: string, maxResults: number = 5): Promise<Paper[]> {
    const apiKey = process.env.IEEE_API_KEY;

    if (!apiKey) {
        console.warn("IEEE_API_KEY not found in environment variables.");
        return [];
    }

    try {
        const url = new URL(IEEE_API_ENDPOINT);
        url.searchParams.append('apikey', apiKey);
        url.searchParams.append('format', 'json');
        url.searchParams.append('max_records', maxResults.toString());
        url.searchParams.append('querytext', query);
        url.searchParams.append('sort_order', 'desc');
        url.searchParams.append('sort_field', 'article_number');

        console.log(`[IEEE] Fetching: ${url.toString().replace(apiKey, 'HIDDEN')}`);

        const response = await fetch(url.toString());
        console.log(`[IEEE] Response Status: ${response.status}`);

        if (!response.ok) {
            console.error(`IEEE API Error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data: IEEEResponse = await response.json();

        if (!data.articles) {
            return [];
        }

        return data.articles.map(article => ({
            title: article.title,
            authors: article.authors?.authors.map(a => a.full_name) || ['Unknown'],
            source: article.publication_title || 'IEEE Xplore',
            url: article.html_url || article.pdf_url || `https://doi.org/${article.doi}`,
            description: article.abstract || 'No abstract available.'
        }));

    } catch (error) {
        console.error("Failed to fetch papers from IEEE:", error);
        return [];
    }
}
