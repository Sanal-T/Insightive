import { type Paper } from '@/lib/types';

/**
 * Elsevier Scopus Search API
 * Requires a free API key from https://dev.elsevier.com/
 * Docs: https://dev.elsevier.com/documentation/ScopusSearchAPI.wadl
 */
export async function searchElsevierPapers(query: string, maxResults: number = 5): Promise<Paper[]> {
    const apiKey = process.env.ELSEVIER_API_KEY;

    if (!apiKey) {
        return []; // Silent skip when key not configured
    }

    try {
        const url = `https://api.elsevier.com/content/search/scopus?query=${encodeURIComponent(query)}&count=${maxResults}&sort=relevancy&field=dc:title,dc:creator,prism:publicationName,dc:description,prism:doi,prism:url`;

        console.log(`[Elsevier] Fetching papers for: "${query}"`);
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'X-ELS-APIKey': apiKey,
            },
        });

        if (!response.ok) {
            console.error(`[Elsevier] API Error (${response.status})`);
            return [];
        }

        const data = await response.json();
        const items: any[] = data?.['search-results']?.entry ?? [];

        console.log(`[Elsevier] Found ${items.length} papers`);

        return items.map((item: any) => ({
            title: item['dc:title'] || 'Untitled',
            authors: item['dc:creator'] ? [item['dc:creator']] : ['Unknown'],
            source: item['prism:publicationName'] || 'Elsevier / Scopus',
            url: item['prism:doi']
                ? `https://doi.org/${item['prism:doi']}`
                : item['prism:url'] || 'https://www.scopus.com',
            description: item['dc:description'] || 'No abstract available.',
        }));
    } catch (error) {
        console.error('[Elsevier] Fetch error:', error);
        return [];
    }
}
