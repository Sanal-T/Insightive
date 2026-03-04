import type { Repository } from '@/lib/types';
import { searchGiteaRepos } from './gitea';

/**
 * Codeberg is powered by Gitea — reuse the generic Gitea helper.
 */
export async function searchCodebergRepositories(query: string): Promise<Repository[]> {
    return searchGiteaRepos('https://codeberg.org', query, 'Codeberg');
}
