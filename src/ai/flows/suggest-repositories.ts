'use server';

/**
 * @fileOverview Suggests relevant code repositories based on a research idea,
 * fetching from GitHub, GitLab, Bitbucket, Codeberg, and Launchpad in parallel.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { findRepositories } from '@/lib/repository-service';
import type { Repository } from '@/lib/types';

export type SuggestRepositoriesInput = string;
export type SuggestRepositoriesOutput = Repository[];

const QueryOptimizerInputSchema = z.object({
  userIntent: z.string(),
});
const QueryOptimizerOutputSchema = z.object({
  optimizedQuery: z.string(),
  explanation: z.string().optional(),
});

const optimizeQueryPrompt = ai.definePrompt({
  name: 'optimizeRepositoryQuery',
  input: { schema: QueryOptimizerInputSchema },
  output: { schema: QueryOptimizerOutputSchema },
  prompt: `You are a multi-platform code repository search expert. Your goal is to convert a user's natural language research idea into a highly effective search query that works well across GitHub, GitLab, Bitbucket, Codeberg, and Launchpad.

User Intent: {{userIntent}}

Instructions:
1. Analyze the user's intent to identify key technologies, topics, and domain.
2. Construct a concise but specific search query string (without platform-specific modifiers like "language:typescript" since results span multiple platforms).
3. Focus on the core topic keywords that will return relevant repositories across all platforms.

Example:
Input: "stock portfolio app using typescript"
Output: "stock portfolio manager typescript finance"

Return the optimized query string.
`,
});

export async function suggestRepositories(input: SuggestRepositoriesInput): Promise<SuggestRepositoriesOutput> {
  try {
    console.log(`[suggestRepositories] Original Input: "${input}"`);

    // 1. Optimize query with AI
    let finalQuery = input;
    try {
      const { output } = await optimizeQueryPrompt({ userIntent: input });
      if (output?.optimizedQuery) {
        finalQuery = output.optimizedQuery;
        console.log(`[suggestRepositories] AI Optimized Query: "${finalQuery}"`);
      }
    } catch (aiError) {
      console.warn('[suggestRepositories] AI Optimization failed, using original input.', aiError);
    }

    // 2. Fan out to all platforms via repository-service
    const repos = await findRepositories(finalQuery);
    return repos;
  } catch (error) {
    console.error('[suggestRepositories] Error:', error);
    return [];
  }
}
