'use server';

import { z } from 'zod';
import { suggestRepositories } from '@/ai/flows/suggest-repositories';
import { suggestPapers } from '@/ai/flows/suggest-papers';
import { findDatasets, type Dataset } from '@/lib/dataset-service';
import { type Paper, type Repository } from '@/lib/types';

const searchSchema = z.object({
  topic: z.string().min(3, 'Please enter a topic with at least 3 characters.'),
});

export interface GeneralSearchState {
  repositories: Repository[];
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
    const [repoResults, paperResults, datasetResults] = await Promise.allSettled([
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

    const repositories = repoResults.status === 'fulfilled' ? repoResults.value : [];
    const papers = paperResults.status === 'fulfilled' ? paperResults.value : [];
    const datasets = datasetResults.status === 'fulfilled' ? datasetResults.value : [];

    const errors = [repoResults, paperResults, datasetResults]
      .filter(result => result.status === 'rejected')
      .map(result => {
        const reason = (result as PromiseRejectedResult).reason;
        if (reason instanceof Error) return reason.message;
        if (typeof reason === 'string') return reason;
        if (reason && typeof reason === 'object' && 'message' in reason) return String(reason.message);
        return 'An unknown error occurred';
      });

    if (repositories.length === 0 && papers.length === 0 && datasets.length === 0) {
      return {
        repositories: [],
        papers: [],
        datasets: [],
        message: 'No results found. Try a different topic.',
        errors: errors.length > 0 ? errors : undefined,
      };
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
      return { datasets: [], message: 'No datasets found for this topic.' };
    }
    return { datasets, message: 'Search complete.' };
  } catch (error: any) {
    console.error(error);
    return {
      datasets: [],
      message: error.message || 'An unexpected error occurred while searching for datasets.',
    };
  }
}

export interface RepoSearchState {
  repositories: Repository[];
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
      return { repositories: [], message: 'No repositories found for this topic.' };
    }
    return { repositories, message: 'Search complete.' };
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
      return { papers: [], message: 'No papers found for this topic.' };
    }
    return { papers, message: 'Search complete.' };
  } catch (error: any) {
    console.error(error);
    return {
      papers: [],
      message: error.message || 'An unexpected error occurred while searching for papers.',
    };
  }
}
