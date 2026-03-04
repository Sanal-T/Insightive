import { type Paper } from '@/lib/types';

/**
 * Springer Nature API (Meta API v2)
 * Returns open-access and metadata for Springer/Nature publications.
 * Requires a free API key: https://dev.springernature.com/
 * Docs: https://dev.springernature.com/docs
 */
export async function searchSpringerPapers(query: string, maxResults: number = 5): Promise<Paper[]> {
    const apiKey = process.env.SPRINGER_API_KEY;

    if (!apiKey) {
        // Silent skip — user hasn't configured the key yet
        return [];
    }

    try {
        const url = `https://api.springer.com/meta/v2/json?q=${encodeURIComponent(query)}&p=${maxResults}&api_key=${apiKey}`;

        console.log(`[Springer] Fetching papers for: "${query}"`);
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            console.error(`[Springer] API Error (${response.status})`);
            return [];
        }

        const data = await response.json();
        const items: any[] = data?.records ?? [];

        console.log(`[Springer] Found ${items.length} papers`);

        return items.map((item: any) => ({
            title: item.title || 'Untitled',
            authors: item.creators?.map((c: any) => c.creator).filter(Boolean) || ['Unknown'],
            source: item.publicationName || 'Springer Nature',
            url: item.url?.[0]?.value
                || (item.doi ? `https://doi.org/${item.doi}` : 'https://link.springer.com'),
            description: item.abstract || item.description || 'No abstract available.',
        }));
    } catch (error) {
        console.error('[Springer] Fetch error:', error);
        return [];
    }
}
