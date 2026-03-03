'use server';

import { z } from 'zod';
import { suggestRepositories } from '@/ai/flows/suggest-repositories';
import { suggestPapers } from '@/ai/flows/suggest-papers';
import { findDatasets, type Dataset } from '@/lib/dataset-service';
import { type Paper } from '@/lib/types';
import { type GithubRepository } from '@/lib/api/github';


const searchSchema = z.object({
  topic: z.string().min(3, 'Please enter a topic with at least 3 characters.'),
});

export interface GeneralSearchState {
  repositories: string[];
  papers: Paper[];
  datasets: Dataset[];
  message?: string;
  errors?: string[];
}

export async function search(
  prevState: GeneralSearchState,
  formData: FormData,
): Promise<GeneralSearchState> {
  const validatedFields = searchSchema.safeParse({
    topic: formData.get('topic'),
  });

  if (!validatedFields.success) {
    return {
      repositories: [],
      papers: [],
      datasets: [],
      message: validatedFields.error.flatten().fieldErrors.topic?.[0],
    };
  }

  const topic = validatedFields.data.topic;
  console.log(`[Search] Topic: "${topic}"`);

  try {
    console.log('[Search] Starting parallel search...');
    const [
      repoResults,
      paperResults,
      datasetResults
    ] = await Promise.allSettled([
      suggestRepositories(topic),
      suggestPapers(topic),
      findDatasets(topic),
    ]);
    console.log('[Search] Parallel search finished.');

    if (repoResults.status === 'fulfilled') console.log(`[Search] Repos: ${repoResults.value.length}`);
    else console.error(`[Search] Repos Failed:`, repoResults.reason);

    if (paperResults.status === 'fulfilled') console.log(`[Search] Papers: ${paperResults.value.length}`);
    else console.error(`[Search] Papers Failed:`, paperResults.reason);

    if (datasetResults.status === 'fulfilled') console.log(`[Search] Datasets: ${datasetResults.value.length}`);
    else console.error(`[Search] Datasets Failed:`, datasetResults.reason);

    const repositories = repoResults.status === 'fulfilled' ? repoResults.value.map(r => r.html_url) : [];
    const papers = paperResults.status === 'fulfilled' ? paperResults.value : [];
    const datasets = datasetResults.status === 'fulfilled' ? datasetResults.value : [];

    const errors = [repoResults, paperResults, datasetResults]
      .filter(result => result.status === 'rejected')
      .map(result => {
        const reason = (result as PromiseRejectedResult).reason;
        // Handle different error types and ensure message is serializable
        if (reason instanceof Error) {
          return reason.message;
        } else if (typeof reason === 'string') {
          return reason;
        } else if (reason && typeof reason === 'object' && 'message' in reason) {
          return String(reason.message);
        }
        return 'An unknown error occurred';
      });

    if (repositories.length === 0 && papers.length === 0 && datasets.length === 0) {
      return {
        repositories: [],
        papers: [],
        datasets: [],
        message: 'No results found. Try a different topic.',
        errors: errors.length > 0 ? errors : undefined,
      }
    }

    return {
      repositories,
      papers,
      datasets,
      message: 'Search complete.',
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    console.error(error);
    return {
      repositories: [],
      papers: [],
      datasets: [],
      message: error.message || 'An unexpected error occurred during the search. Please try again.',
    };
  }
}

export interface DatasetSearchState {
  datasets: Dataset[];
  message?: string;
}

export async function searchDatasets(
  prevState: DatasetSearchState,
  formData: FormData,
): Promise<DatasetSearchState> {
  const validatedFields = searchSchema.safeParse({
    topic: formData.get('topic'),
  });

  if (!validatedFields.success) {
    return {
      datasets: [],
      message: validatedFields.error.flatten().fieldErrors.topic?.[0],
    };
  }

  const topic = validatedFields.data.topic;

  try {
    const datasets = await findDatasets(topic);

    if (datasets.length === 0) {
      return {
        datasets: [],
        message: 'No datasets found for this topic.',
      };
    }

    return {
      datasets,
      message: 'Search complete.',
    };
  } catch (error: any) {
    console.error(error);
    return {
      datasets: [],
      message:
        error.message ||
        'An unexpected error occurred while searching for datasets.',
    };
  }
}

export interface RepoSearchState {
  repositories: GithubRepository[];
  message?: string;
}

export async function searchRepositories(
  prevState: RepoSearchState,
  formData: FormData,
): Promise<RepoSearchState> {
  const validatedFields = searchSchema.safeParse({
    topic: formData.get('topic'),
  });

  if (!validatedFields.success) {
    return {
      repositories: [],
      message: validatedFields.error.flatten().fieldErrors.topic?.[0],
    };
  }

  const topic = validatedFields.data.topic;

  try {
    const repositories = await suggestRepositories(topic);

    if (repositories.length === 0) {
      return {
        repositories: [],
        message: 'No repositories found for this topic.',
      };
    }

    return {
      repositories,
      message: 'Search complete.',
    };
  } catch (error: any) {
    console.error(error);
    return {
      repositories: [],
      message: 'An unexpected error occurred while searching for repositories.',
    };
  }
}

export interface PaperSearchState {
  papers: Paper[];
  message?: string;
}

export async function searchPapers(
  prevState: PaperSearchState,
  formData: FormData,
): Promise<PaperSearchState> {
  const validatedFields = searchSchema.safeParse({
    topic: formData.get('topic'),
  });

  if (!validatedFields.success) {
    return {
      papers: [],
      message: validatedFields.error.flatten().fieldErrors.topic?.[0],
    };
  }

  const topic = validatedFields.data.topic;

  try {
    const papers = await suggestPapers(topic);

    if (papers.length === 0) {
      return {
        papers: [],
        message: 'No papers found for this topic.',
      };
    }

    return {
      papers,
      message: 'Search complete.',
    };
  } catch (error: any) {
    console.error(error);
    return {
      papers: [],
      message:
        error.message ||
        'An unexpected error occurred while searching for papers.',
    };
  }
}

// -- Summarization Actions --
import { summarizePaperFlow, type SummarizePaperOutput } from '@/ai/flows/summarize-paper';
import mammoth from 'mammoth';

export async function summarizePaper(formData: FormData): Promise<SummarizePaperOutput | null> {
  const file = formData.get('file') as File;
  if (!file) {
    console.error('No file provided');
    return null;
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.type === 'application/pdf') {
      const PDFParser = require("pdf2json");
      const pdfParser = new PDFParser(null, 1); // 1 = text only

      text = await new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
          try {
            // Manual extraction context
            const rawText = pdfData.Pages.map((page: any) => {
              return page.Texts.map((textItem: any) => {
                try {
                  return decodeURIComponent(textItem.R[0].T);
                } catch (e) {
                  return textItem.R[0].T;
                }
              }).join(' ');
            }).join('\n');
            resolve(rawText);
          } catch (err) {
            reject(err);
          }
        });
        pdfParser.parseBuffer(buffer);
      });
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      console.error('Unsupported file type:', file.type);
      return null;
    }

    // Smart chunking for Summaries (Intro + Conclusion)
    // REDUCED to ~10k chars total (~2.5k tokens) to avoid Rate Limits
    let truncatedText = text;
    if (text.length > 10000) {
      const start = text.substring(0, 6000); // Abstract + Intro
      const end = text.substring(text.length - 4000); // Conclusion/Refs
      truncatedText = `${start}\n\n... [Middle content omitted to save tokens] ...\n\n${end}`;
    }

    console.log(`Summarizing file: ${file.name} (Length: ${text.length}, Sending: ${truncatedText.length})`);
    return await summarizePaperFlow(truncatedText);

  } catch (error: any) {
    console.error('Error summarizing paper:', error);
    // Return structured error instead of null
    return {
      title: "Error summarizing paper",
      shortSummary: "Detailed analysis failed.",
      detailedSummary: `The system is currently experiencing high traffic (Rate Limit). Please try again in a minute.\n\nTechnical Error: ${error.message || 'Unknown error'}`,
      majorFindings: [],
      methods: [],
      contributions: []
    };
  }
}




