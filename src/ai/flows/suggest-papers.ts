'use server';
console.log("[DEBUG] Loading suggest-papers.ts");

/**
 * @fileOverview Suggests relevant academic papers based on a research idea.
 *
 * - suggestPapers - A function that suggests academic papers.
 * - SuggestPapersInput - The input type for the suggestPapers function.
 * - SuggestPapersOutput - The return type for the suggestPapers function.
 */

import { searchArxivPapers } from '@/lib/api/arxiv';
import { searchCrossrefPapers } from '@/lib/api/crossref';
import { searchSerpApiPapers } from '@/lib/api/serpapi';
import { searchApifyPapers } from '@/lib/api/apify';
import { type Paper } from '@/lib/types';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export type SuggestPapersInput = string;
export type SuggestPapersOutput = Paper[];

// Genkit Definitions for Fallback
const SuggestPapersInputSchema = z.string().describe('The research idea or keywords.');
const PaperSchema = z.object({
  title: z.string(),
  authors: z.array(z.string()),
  source: z.string(),
  url: z.string().url(),
  description: z.string(),
});
const SuggestPapersOutputSchema = z.array(PaperSchema).describe('An array of 5 relevant academic papers.');

const prompt = ai.definePrompt({
  name: 'suggestPapersPrompt',
  input: { schema: SuggestPapersInputSchema },
  output: { schema: SuggestPapersOutputSchema },
  prompt: `You are an expert AI research assistant. Your task is to find HIGHLY RELEVANT and CITABLE academic papers for a given research idea.
Research Idea: {{{$input}}}
Provide a list of 5 highly relevant academic papers from premier sources.
Return a JSON array of paper objects.`,
});

export async function suggestPapers(input: SuggestPapersInput): Promise<SuggestPapersOutput> {
  try {
    console.log(`[suggestPapers] Searching Multi-Source (arXiv, Crossref, SerpApi, Apify) for: "${input}"`);

    // We run all queries in parallel.
    // Note: SerpApi and Apify both target Google Scholar. If both keys are present, we might get dupes.
    // However, usually a user handles one. We will deduplicate by URL later if needed.
    const [arxivResults, crossrefResults, serpResults, apifyResults] = await Promise.allSettled([
      searchArxivPapers(input),
      searchCrossrefPapers(input),
      searchSerpApiPapers(input),
      searchApifyPapers(input)
    ]);

    const papers: Paper[] = [];
    const urls = new Set<string>();

    const addPapers = (newPapers: Paper[], sourceName: string) => {
      if (newPapers.length > 0) {
        console.log(`[suggestPapers] Found ${newPapers.length} papers from ${sourceName}.`);
        newPapers.forEach(p => {
          if (!urls.has(p.url)) { // Basic deduplication
            papers.push(p);
            urls.add(p.url);
          }
        });
      }
    };

    if (arxivResults.status === 'fulfilled') addPapers(arxivResults.value, 'arXiv');
    else console.error('[suggestPapers] arXiv Search Failed:', arxivResults.reason);

    if (crossrefResults.status === 'fulfilled') addPapers(crossrefResults.value, 'Crossref');
    else console.error('[suggestPapers] Crossref Search Failed:', crossrefResults.reason);

    if (serpResults.status === 'fulfilled') addPapers(serpResults.value, 'Google Scholar (SerpApi)');
    else console.error('[suggestPapers] SerpApi Search Failed:', serpResults.reason);

    if (apifyResults.status === 'fulfilled') addPapers(apifyResults.value, 'Google Scholar (Apify)');
    else console.error('[suggestPapers] Apify Search Failed:', apifyResults.reason);

    if (papers.length > 0) {
      return papers;
    }

    console.warn('[suggestPapers] No API results found. Falling back to AI.');
    const { output } = await prompt(input);
    return output || [];

  } catch (error) {
    console.error('[suggestPapers] Error:', error);
    return [];
  }
}
