import type { Repository } from '@/lib/types';

/**
 * Generic Gitea API search helper.
 * Works with any Gitea-compatible host (Codeberg, self-hosted, etc.)
 */
export async function searchGiteaRepos(baseUrl: string, query: string, sourceName: string): Promise<Repository[]> {
    try {
        const url = `${baseUrl}/api/v1/repos/search?q=${encodeURIComponent(query)}&limit=5&sort=stars&order=desc`;
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            console.error(`Gitea API Error from ${baseUrl} (${response.status})`);
            return [];
        }

        const data = await response.json();
        if (!data.data || !Array.isArray(data.data)) return [];

        return data.data.map((item: any) => ({
            name: item.full_name || item.name,
            full_name: item.full_name || item.name,
            html_url: item.html_url,
            description: item.description || 'No description provided.',
            stars: item.stars_count ?? 0,
            source: sourceName,
        }));
    } catch (error) {
        console.error(`Failed to fetch from Gitea instance (${baseUrl}):`, error);
        return [];
    }
}
