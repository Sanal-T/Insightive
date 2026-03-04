import type { Dataset } from '@/lib/dataset-service';

/**
 * Hugging Face Datasets API
 * Public API — no authentication required for public datasets.
 * Docs: https://huggingface.co/docs/hub/api
 */
export async function searchHuggingFaceDatasets(query: string): Promise<Dataset[]> {
    try {
        const url = `https://huggingface.co/api/datasets?search=${encodeURIComponent(query)}&limit=5&sort=downloads&direction=-1`;
        console.log(`[HuggingFace] Fetching datasets for: "${query}"`);

        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            console.error(`[HuggingFace] API Error (${response.status})`);
            return [];
        }

        const data = await response.json();
        if (!Array.isArray(data)) return [];

        console.log(`[HuggingFace] Found ${data.length} datasets`);

        return data.map((item: any) => ({
            name: item.id || item.modelId || 'Unknown',
            source: 'Hugging Face',
            url: `https://huggingface.co/datasets/${item.id}`,
            description: item.description || item.cardData?.summary || `A dataset by ${item.author || 'the community'} on Hugging Face.`,
        }));
    } catch (error) {
        console.error('[HuggingFace] Fetch error:', error);
        return [];
    }
}
