'use server';

/**
 * @fileOverview Suggests relevant datasets based on a research idea.
 *
 * - suggestDatasets - A function that suggests datasets.
 * - SuggestDatasetsInput - The input type for the suggestDatasets function.
 * - SuggestDatasetsOutput - The return type for the suggestDatasets function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestDatasetsInputSchema = z.string().describe('The research idea or keywords.');
export type SuggestDatasetsInput = z.infer<typeof SuggestDatasetsInputSchema>;

const DatasetSchema = z.object({
  name: z.string(),
  source: z.string(),
  url: z.string().url(),
  description: z.string(),
});

const SuggestDatasetsOutputSchema = z.array(DatasetSchema).describe('An array of 5 relevant datasets.');
export type SuggestDatasetsOutput = z.infer<typeof SuggestDatasetsOutputSchema>;

export async function suggestDatasets(input: SuggestDatasetsInput): Promise<SuggestDatasetsOutput> {
  try {
    return await suggestDatasetsFlow(input);
  } catch (error) {
    console.error('[suggestDatasets] Error:', error);
    // Return empty array on error to allow other searches to continue
    return [];
  }
}

const prompt = ai.definePrompt({
  name: 'suggestDatasetsPrompt',
  input: { schema: SuggestDatasetsInputSchema },
  output: { schema: SuggestDatasetsOutputSchema },
  prompt: `You are an expert AI research assistant. Your task is to find RELEVANT public datasets for a given research idea.

Research Idea: {{{$input}}}

Provide a list of 5 relevant public datasets from Kaggle only.
- The datasets must be directly suitable for the research idea.
- Do not provide generic datasets (like MNIST/Titanic) unless the user explicitly asks for them or the topic is about them.
- For each dataset, include its name, source, a valid URL, and a description.
- Return a JSON array of dataset objects.
`,
});

const suggestDatasetsFlow = ai.defineFlow(
  {
    name: 'suggestDatasetsFlow',
    inputSchema: SuggestDatasetsInputSchema,
    outputSchema: SuggestDatasetsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
