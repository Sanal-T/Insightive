import { type Paper } from '@/lib/types';

/**
 * Semantic Scholar Academic Graph API
 * 200M+ papers. No authentication required.
 * Docs: https://api.semanticscholar.org/api-docs/graph
 */
export async function searchSemanticScholarPapers(query: string, maxResults: number = 5): Promise<Paper[]> {
    try {
        const fields = 'title,authors,year,abstract,externalIds,openAccessPdf,url';
        const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${maxResults}&fields=${fields}`;

        console.log(`[SemanticScholar] Fetching papers for: "${query}"`);
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            console.error(`[SemanticScholar] API Error (${response.status})`);
            return [];
        }

        const data = await response.json();
        const items: any[] = data?.data ?? [];

        console.log(`[SemanticScholar] Found ${items.length} papers`);

        return items.map((item: any) => ({
            title: item.title || 'Untitled',
            authors: item.authors?.map((a: any) => a.name).filter(Boolean) || ['Unknown'],
            source: 'Semantic Scholar',
            url: item.openAccessPdf?.url
                || (item.externalIds?.DOI ? `https://doi.org/${item.externalIds.DOI}` : null)
                || item.url
                || `https://www.semanticscholar.org/paper/${item.paperId}`,
            description: item.abstract || 'No abstract available.',
        }));
    } catch (error) {
        console.error('[SemanticScholar] Fetch error:', error);
        return [];
    }
}
