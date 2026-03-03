import { suggestDatasets } from '@/ai/flows/suggest-datasets';
import { searchKaggleDatasets } from '@/lib/api/kaggle';


export interface Dataset {
    name: string;
    source: string;
    url: string;
    description: string;
}

export async function findDatasets(topic: string): Promise<Dataset[]> {
    console.log(`[DatasetService] Finding datasets for: "${topic}"`);
    const [aiResults, kaggleResults] = await Promise.allSettled([
        suggestDatasets(topic),
        searchKaggleDatasets(topic)
    ]);

    let datasets: Dataset[] = [];

    // 1. AI Suggestions (High priority for relevance context)
    if (aiResults.status === 'fulfilled') {
        datasets = [...datasets, ...aiResults.value];
    }

    // Helper to check relevance
    // Helper to check relevance
    const isRelevant = (item: any) => {
        const lowerTopic = topic.toLowerCase();
        // Check title, ref (id), and subtitle for the topic keyword
        const textToCheck = (
            (item.title || '') +
            (item.name || '') +
            (item.id || '') +
            (item.subtitle || '')
        ).toLowerCase();
        return textToCheck.includes(lowerTopic);
    };

    // 2. Kaggle Results
    if (kaggleResults.status === 'fulfilled' && Array.isArray(kaggleResults.value)) {
        const kaggleMapped = kaggleResults.value
            .filter((item: any) => isRelevant(item))
            .slice(0, 5)
            .map((item: any) => ({
                name: item.title || item.ref,
                source: 'Kaggle',
                url: item.url || `https://www.kaggle.com/${item.ref}`,
                description: item.subtitle || 'No description available.',
            }));
        datasets = [...datasets, ...kaggleMapped];
    }



    // Deduplicate by URL
    const uniqueDatasets = Array.from(new Map(datasets.map(item => [item.url, item])).values());

    return uniqueDatasets;
}
