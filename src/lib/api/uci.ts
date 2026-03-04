import type { Dataset } from '@/lib/dataset-service';

/**
 * Combined dataset search: Zenodo + OpenML
 *
 * - Zenodo: Research data repository with full-text search. Hosts many original
 *   UCI-origin datasets uploaded by researchers. Public API, no auth required.
 *   Docs: https://developers.zenodo.org/
 *
 * - OpenML: ML dataset repository. Tag-based search (no full-text).
 *   Docs: https://www.openml.org/apis
 */
export async function searchOpenMLDatasets(query: string): Promise<Dataset[]> {
    const [zenodoResult, openmlResult] = await Promise.allSettled([
        fetchZenodoDatasets(query),
        fetchOpenMLDatasets(query),
    ]);

    const all: Dataset[] = [];
    if (zenodoResult.status === 'fulfilled') all.push(...zenodoResult.value);
    if (openmlResult.status === 'fulfilled') all.push(...openmlResult.value);

    // Deduplicate by URL
    const seen = new Set<string>();
    const unique = all.filter(d => {
        if (seen.has(d.url)) return false;
        seen.add(d.url);
        return true;
    });

    console.log(`[OpenML+Zenodo] Found ${unique.length} datasets for "${query}"`);
    return unique.slice(0, 6);
}

/**
 * Search Zenodo for datasets matching the query (full-text search)
 */
async function fetchZenodoDatasets(query: string): Promise<Dataset[]> {
    const url = `https://zenodo.org/api/records?q=${encodeURIComponent(query)}&type=dataset&size=4&sort=mostrecent`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!response.ok) {
        console.error(`[Zenodo] API Error (${response.status})`);
        return [];
    }

    const data = await response.json();
    const items: any[] = data?.hits?.hits ?? [];

    return items.map((item: any) => ({
        name: item.metadata?.title || 'Zenodo Dataset',
        source: 'Zenodo (incl. UCI)',
        url: item.links?.html || `https://zenodo.org/record/${item.id}`,
        description: item.metadata?.description
            ? item.metadata.description.replace(/<[^>]*>/g, '').slice(0, 200)
            : 'A research dataset on Zenodo.',
    }));
}

/**
 * Search OpenML for datasets by tag (limited but reliable for ML task types)
 */
async function fetchOpenMLDatasets(query: string): Promise<Dataset[]> {
    // Map common query terms to known valid OpenML tags
    const lq = query.toLowerCase();
    let tag = 'classification'; // default broad tag that works

    if (lq.includes('regress') || lq.includes('predict') || lq.includes('forecast')) {
        tag = 'regression';
    } else if (lq.includes('cluster') || lq.includes('segment') || lq.includes('grouping')) {
        tag = 'clustering';
    }

    const url = `https://www.openml.org/api/v1/json/data/list/tag/${tag}/limit/3`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!response.ok) return [];

    const data = await response.json();
    const items: any[] = data?.data?.dataset ?? [];

    return items.map((item: any) => ({
        name: item.name || 'OpenML Dataset',
        source: 'OpenML (UCI)',
        url: `https://www.openml.org/search?type=data&id=${item.did}`,
        description: `OpenML dataset · ${item.quality?.find?.((q: any) => q.name === 'NumberOfInstances')?.value ?? '?'} instances`,
    }));
}
