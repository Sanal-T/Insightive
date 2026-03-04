import type { Repository } from '@/lib/types';
import { searchGitHubRepositories } from '@/lib/api/github';
import { searchGitLabRepositories } from '@/lib/api/gitlab';
import { searchCodebergRepositories } from '@/lib/api/codeberg';

/**
 * Aggregates repositories from all supported public platforms in parallel.
 * Returns deduplicated results sorted by star count descending.
 *
 * Platforms with live public APIs:
 *   GitHub, GitLab, Bitbucket, Codeberg (Gitea), Launchpad
 *
 * Platforms without global search APIs (self-hosted / private-cloud):
 *   OneDev, Gogs, Radicle, Google Cloud Source Repositories, AWS CodeCommit
 *   → Results for these come from the AI suggestion flow labelled as "AI Suggested"
 */
export async function findRepositories(topic: string): Promise<Repository[]> {
    console.log(`[RepositoryService] Searching all platforms for: "${topic}"`);

    const [githubResult, gitlabResult, codebergResult] =
        await Promise.allSettled([
            searchGitHubRepositories(topic),
            searchGitLabRepositories(topic),
            searchCodebergRepositories(topic),
        ]);

    const allResults: Repository[] = [];

    const collect = (result: PromiseSettledResult<Repository[]>, platformName: string) => {
        if (result.status === 'fulfilled') {
            console.log(`[RepositoryService] ${platformName}: ${result.value.length} results`);
            allResults.push(...result.value);
        } else {
            console.error(`[RepositoryService] ${platformName} failed:`, result.reason);
        }
    };

    collect(githubResult, 'GitHub');
    collect(gitlabResult, 'GitLab');
    collect(codebergResult, 'Codeberg');

    // Deduplicate by URL
    const seen = new Set<string>();
    const unique = allResults.filter(repo => {
        if (seen.has(repo.html_url)) return false;
        seen.add(repo.html_url);
        return true;
    });

    // Sort by stars descending
    unique.sort((a, b) => b.stars - a.stars);

    console.log(`[RepositoryService] Total unique results: ${unique.length}`);
    return unique;
}
