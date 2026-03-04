import type { Repository } from '@/lib/types';

export async function searchGitLabRepositories(query: string): Promise<Repository[]> {
    const token = process.env.GITLAB_TOKEN;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['PRIVATE-TOKEN'] = token;
    }

    try {
        const url = `https://gitlab.com/api/v4/projects?search=${encodeURIComponent(query)}&order_by=star_count&sort=desc&per_page=5&visibility=public`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`GitLab API Error (${response.status}):`, errorText);
            return [];
        }

        const data = await response.json();
        if (!Array.isArray(data)) return [];

        return data.map((item: any) => ({
            name: item.path_with_namespace || item.name,
            full_name: item.path_with_namespace || item.name,
            html_url: item.web_url,
            description: item.description || 'No description provided.',
            stars: item.star_count ?? 0,
            source: 'GitLab',
        }));
    } catch (error) {
        console.error('Failed to fetch from GitLab:', error);
        return [];
    }
}
