export async function searchHuggingFaceDatasets(query: string) {
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
        console.warn("Hugging Face API key not found in environment variables.");
        return [];
    }

    try {
        const response = await fetch(`https://huggingface.co/api/datasets?search=${encodeURIComponent(query)}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`Hugging Face API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch from Hugging Face:", error);
        return [];
    }
}
