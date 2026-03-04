import type { Repository } from '@/lib/types';

/**
 * Launchpad REST API v1.0 — searches public projects by text.
 * No authentication required.
 */
export async function searchLaunchpadRepositories(query: string): Promise<Repository[]> {
    try {
        const url = `https://api.launchpad.net/1.0/projects?ws.op=search&text=${encodeURIComponent(query)}&ws.size=5`;
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            console.error(`Launchpad API Error (${response.status})`);
            return [];
        }

        const data = await response.json();
        if (!data.entries || !Array.isArray(data.entries)) return [];

        return data.entries.map((item: any) => ({
            name: item.name || item.display_name,
            full_name: item.display_name || item.name,
            html_url: item.web_link || `https://launchpad.net/${item.name}`,
            description: item.summary || item.description || 'No description provided.',
            stars: 0, // Launchpad has no star concept
            source: 'Launchpad',
        }));
    } catch (error) {
        console.error('Failed to fetch from Launchpad:', error);
        return [];
    }
}
