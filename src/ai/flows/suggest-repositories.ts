'use server';

/**
 * @fileOverview Suggests relevant code repositories based on a research idea.
 *
 * - suggestRepositories - A function that suggests code repositories.
 * - SuggestRepositoriesInput - The input type for the suggestRepositories function.
 * - SuggestRepositoriesOutput - The return type for the suggestRepositories function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchGithubRepositories, type GithubRepository } from '@/lib/api/github';

// Input/Output Types
export type SuggestRepositoriesInput = string;
export type SuggestRepositoriesOutput = GithubRepository[];

// Schema for the AI optimization step
const QueryOptimizerInputSchema = z.object({
  userIntent: z.string(),
});
const QueryOptimizerOutputSchema = z.object({
  optimizedQuery: z.string(),
  explanation: z.string().optional(),
});

// Prompt Definition
const optimizeQueryPrompt = ai.definePrompt({
  name: 'optimizeRepositoryQuery',
  input: { schema: QueryOptimizerInputSchema },
  output: { schema: QueryOptimizerOutputSchema },
  prompt: `You are a GitHub Search Expert. Your goal is to convert a user's natural language research idea into a highly effective GitHub search query.

User Intent: {{userIntent}}

Instructions:
1. Analyze the user's intent to identify key technologies, topics, and domain.
2. Construct a specialized GitHub search query string.
3. Use modifiers where appropriate (e.g., \`language:typescript\`, \`topic:machine-learning\`, \`stars:>100\`).
4. Keep the query concise but specific.

Example:
Input: "stock portfolio app"
Output: "stock portfolio manager language:typescript topic:finance"

Return the optimized query string.
`,
});

export async function suggestRepositories(input: SuggestRepositoriesInput): Promise<SuggestRepositoriesOutput> {
  try {
    console.log(`[suggestRepositories] Original Input: "${input}"`);

    // 1. Optimize Query with AI
    let finalQuery = input;
    try {
      const { output } = await optimizeQueryPrompt({ userIntent: input });
      if (output && output.optimizedQuery) {
        finalQuery = output.optimizedQuery;
        console.log(`[suggestRepositories] AI Optimized Query: "${finalQuery}"`);
      }
    } catch (aiError) {
      console.warn('[suggestRepositories] AI Optimization failed, falling back to original input.', aiError);
    }

    // 2. Search GitHub with optimized query
    const repos = await searchGithubRepositories(finalQuery);
    return repos;
  } catch (error) {
    console.error('[suggestRepositories] Error:', error);
    return [];
  }
}


