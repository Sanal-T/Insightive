'use server';
console.log("[DEBUG] Loading suggest-papers.ts");

/**
 * @fileOverview Suggests relevant academic papers from multiple sources:
 * IEEE Xplore, Semantic Scholar, OpenAlex, Springer, Crossref, Apify, arXiv.
 */

import { searchArxivPapers } from '@/lib/api/arxiv';
import { searchCrossrefPapers } from '@/lib/api/crossref';
import { searchSerpApiPapers } from '@/lib/api/serpapi';
import { searchApifyPapers } from '@/lib/api/apify';
import { searchIEEEPapers } from '@/lib/api/ieee';
import { searchSemanticScholarPapers } from '@/lib/api/semantic-scholar';
import { searchOpenAlexPapers } from '@/lib/api/openalex';
import { searchSpringerPapers } from '@/lib/api/springer';
import { searchElsevierPapers } from '@/lib/api/elsevier';
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
  prompt: `You are an expert AI research assistant. Your task is to find HIGHLY RELEVANT and CITABLE academic papers for a given research idea.\nResearch Idea: {{{$input}}}\nProvide a list of 5 highly relevant academic papers from premier sources.\nReturn a JSON array of paper objects.`,
});

export async function suggestPapers(input: SuggestPapersInput): Promise<SuggestPapersOutput> {
  try {
    console.log(`[suggestPapers] Searching all sources for: "${input}"`);

    const [
      ieeeResults,
      springerResults,
      serpResults,
      apifyResults,
      elsevierResults,
      crossrefResults,
      semanticResults,
      openAlexResults,
      arxivResults,
    ] = await Promise.allSettled([
      searchIEEEPapers(input),
      searchSpringerPapers(input),
      searchSerpApiPapers(input),
      searchApifyPapers(input),
      searchElsevierPapers(input),
      searchCrossrefPapers(input),
      searchSemanticScholarPapers(input),
      searchOpenAlexPapers(input),
      searchArxivPapers(input),
    ]);

    const papers: Paper[] = [];
    const urls = new Set<string>();

    const addPapers = (result: PromiseSettledResult<Paper[]>, sourceName: string) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        console.log(`[suggestPapers] Found ${result.value.length} papers from ${sourceName}.`);
        result.value.forEach(p => {
          if (p.url && !urls.has(p.url)) {
            papers.push(p);
            urls.add(p.url);
          }
        });
      } else if (result.status === 'rejected') {
        console.error(`[suggestPapers] ${sourceName} failed:`, result.reason);
      }
    };

    // Priority order as specified by user
    addPapers(ieeeResults, 'IEEE Xplore');          // 1. IEEE
    addPapers(springerResults, 'Springer Nature');      // 2. Springer
    addPapers(serpResults, 'Google Scholar (SerpApi)'); // 3. Google Scholar
    addPapers(apifyResults, 'Google Scholar (Apify)');
    addPapers(elsevierResults, 'Elsevier / Scopus');    // 4. Elsevier
    addPapers(crossrefResults, 'Crossref');             // 5. rest...
    addPapers(semanticResults, 'Semantic Scholar');
    addPapers(openAlexResults, 'OpenAlex');
    addPapers(arxivResults, 'arXiv');                // last — preprints

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
