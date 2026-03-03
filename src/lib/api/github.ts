export interface GithubRepository {
    name: string;
    full_name: string;
    html_url: string;
    description: string;
    stargazers_count: number;
}

export async function searchGithubRepositories(query: string): Promise<GithubRepository[]> {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        console.warn("GITHUB_TOKEN not found in environment variables. GitHub search may be rate limited or fail.");
    }

    try {
        const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`, {
            headers: {
                "Accept": "application/vnd.github+json",
                "Authorization": `Bearer ${token}`,
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "Insightive-App"
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`GitHub API Error (${response.status}):`, errorText);
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.items) {
            console.warn("GitHub API response missing 'items':", data);
        }
        return data.items || [];
    } catch (error) {
        console.error("Failed to fetch from GitHub:", error);
        return [];
    }
}
