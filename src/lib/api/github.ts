import type { Repository } from '@/lib/types';

export async function searchGitHubRepositories(query: string): Promise<Repository[]> {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        console.warn('GITHUB_TOKEN not found. GitHub search may be rate limited.');
    }

    try {
        const response = await fetch(
            `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5&sort=stars`,
            {
                headers: {
                    Accept: 'application/vnd.github+json',
                    Authorization: `Bearer ${token}`,
                    'X-GitHub-Api-Version': '2022-11-28',
                    'User-Agent': 'Insightive-App',
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`GitHub API Error (${response.status}):`, errorText);
            return [];
        }

        const data = await response.json();
        if (!data.items) return [];

        return data.items.map((item: any) => ({
            name: item.full_name,
            full_name: item.full_name,
            html_url: item.html_url,
            description: item.description || 'No description provided.',
            stars: item.stargazers_count ?? 0,
            source: 'GitHub',
        }));
    } catch (error) {
        console.error('Failed to fetch from GitHub:', error);
        return [];
    }
}

// Keep legacy export for backwards compatibility
export type GithubRepository = {
    name: string;
    full_name: string;
    html_url: string;
    description: string;
    stargazers_count: number;
};

/** @deprecated Use searchGitHubRepositories instead */
export async function searchGithubRepositories(query: string): Promise<GithubRepository[]> {
    const results = await searchGitHubRepositories(query);
    return results.map(r => ({
        name: r.name,
        full_name: r.full_name,
        html_url: r.html_url,
        description: r.description,
        stargazers_count: r.stars,
    }));
}
