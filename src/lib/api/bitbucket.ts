import type { Repository } from '@/lib/types';

export async function searchBitbucketRepositories(query: string): Promise<Repository[]> {
    try {
        // Bitbucket query language requires spaces around ~ and the full q value encoded
        // Correct format: name ~ "query" AND is_private = false
        const searchQuery = `name ~ "${query}" AND is_private = false`;
        const url = `https://api.bitbucket.org/2.0/repositories?q=${encodeURIComponent(searchQuery)}&pagelen=5&sort=-updated_on`;

        console.log(`[Bitbucket] Fetching: ${url}`);

        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            const body = await response.text();
            console.error(`[Bitbucket] API Error (${response.status}):`, body.slice(0, 300));
            return [];
        }

        const data = await response.json();

        if (!data.values || !Array.isArray(data.values)) {
            console.warn('[Bitbucket] Unexpected response shape:', JSON.stringify(data).slice(0, 300));
            return [];
        }

        console.log(`[Bitbucket] Found ${data.values.length} results`);
        return data.values.map((item: any) => ({
            name: item.full_name || item.name,
            full_name: item.full_name || item.name,
            html_url: item.links?.html?.href ?? `https://bitbucket.org/${item.full_name}`,
            description: item.description || 'No description provided.',
            stars: 0,
            source: 'Bitbucket',
        }));
    } catch (error) {
        console.error('[Bitbucket] Fetch error:', error);
        return [];
    }
}
