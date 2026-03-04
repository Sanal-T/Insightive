import { suggestDatasets } from '@/ai/flows/suggest-datasets';
import { searchKaggleDatasets } from '@/lib/api/kaggle';
import { searchHuggingFaceDatasets } from '@/lib/api/huggingface';
import { searchOpenMLDatasets } from '@/lib/api/uci';

export interface Dataset {
    name: string;
    source: string;
    url: string;
    description: string;
}

export async function findDatasets(topic: string): Promise<Dataset[]> {
    console.log(`[DatasetService] Finding datasets for: "${topic}"`);

    const [aiResults, kaggleResults, hfResults, openmlResults] = await Promise.allSettled([
        suggestDatasets(topic),
        searchKaggleDatasets(topic),
        searchHuggingFaceDatasets(topic),
        searchOpenMLDatasets(topic),
    ]);

    let datasets: Dataset[] = [];

    // Helper to check relevance by matching topic keywords in title/name/id
    const isRelevant = (item: any) => {
        const lowerTopic = topic.toLowerCase();
        const textToCheck = (
            (item.title || '') +
            (item.name || '') +
            (item.id || '') +
            (item.subtitle || '')
        ).toLowerCase();
        return textToCheck.includes(lowerTopic);
    };

    // 1. AI Suggestions (highest priority — most relevant context)
    if (aiResults.status === 'fulfilled') {
        console.log(`[DatasetService] AI Suggestions: ${aiResults.value.length}`);
        datasets = [...datasets, ...aiResults.value];
    }

    // 2. Kaggle (API already returns relevant results — no need to double-filter)
    if (kaggleResults.status === 'fulfilled' && Array.isArray(kaggleResults.value)) {
        const mapped = kaggleResults.value
            .slice(0, 5)
            .map((item: any) => ({
                name: item.title || item.ref,
                source: 'Kaggle',
                url: item.url || `https://www.kaggle.com/datasets/${item.ref}`,
                description: item.subtitle || 'No description available.',
            }));
        console.log(`[DatasetService] Kaggle: ${mapped.length}`);
        datasets = [...datasets, ...mapped];
    }

    // 3. Hugging Face
    if (hfResults.status === 'fulfilled') {
        console.log(`[DatasetService] Hugging Face: ${hfResults.value.length}`);
        datasets = [...datasets, ...hfResults.value];
    } else {
        console.error(`[DatasetService] Hugging Face failed:`, hfResults.reason);
    }

    // 4. OpenML (includes UCI collection)
    if (openmlResults.status === 'fulfilled') {
        console.log(`[DatasetService] OpenML: ${openmlResults.value.length}`);
        datasets = [...datasets, ...openmlResults.value];
    } else {
        console.error(`[DatasetService] OpenML failed:`, openmlResults.reason);
    }

    // Deduplicate by URL
    const uniqueDatasets = Array.from(
        new Map(datasets.map(item => [item.url, item])).values()
    );

    console.log(`[DatasetService] Total unique datasets: ${uniqueDatasets.length}`);
    return uniqueDatasets;
}
