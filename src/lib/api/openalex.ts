import { type Paper } from '@/lib/types';

/**
 * OpenAlex API — fully open academic graph. 250M+ works.
 * No authentication required (polite pool rate limit: add email in User-Agent).
 * Docs: https://docs.openalex.org/
 */
export async function searchOpenAlexPapers(query: string, maxResults: number = 5): Promise<Paper[]> {
    try {
        const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&filter=type:article&per_page=${maxResults}&sort=relevance_score:desc`;

        console.log(`[OpenAlex] Fetching papers for: "${query}"`);
        const response = await fetch(url, {
            headers: {
                Accept: 'application/json',
                'User-Agent': 'Insightive/1.0 (insightiveproject@gmail.com)', // polite pool
            },
        });

        if (!response.ok) {
            console.error(`[OpenAlex] API Error (${response.status})`);
            return [];
        }

        const data = await response.json();
        const items: any[] = data?.results ?? [];

        console.log(`[OpenAlex] Found ${items.length} papers`);

        return items.map((item: any) => {
            const authorships: any[] = item.authorships ?? [];
            const authors = authorships
                .slice(0, 5)
                .map((a: any) => a.author?.display_name)
                .filter(Boolean);

            const bestUrl = item.open_access?.oa_url
                || item.doi
                || item.id
                || 'https://openalex.org';

            return {
                title: item.display_name || item.title || 'Untitled',
                authors: authors.length > 0 ? authors : ['Unknown'],
                source: item.primary_location?.source?.display_name || 'OpenAlex',
                url: bestUrl,
                description: item.abstract_inverted_index
                    ? reconstructAbstract(item.abstract_inverted_index)
                    : 'No abstract available.',
            };
        });
    } catch (error) {
        console.error('[OpenAlex] Fetch error:', error);
        return [];
    }
}

/** OpenAlex stores abstracts as inverted index — reconstruct to string */
function reconstructAbstract(invertedIndex: Record<string, number[]>): string {
    const words: string[] = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
        for (const pos of positions) {
            words[pos] = word;
        }
    }
    return words.join(' ').slice(0, 300);
}
