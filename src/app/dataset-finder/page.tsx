'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { searchDatasets, type DatasetSearchState } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Dataset } from '@/lib/dataset-service';

const SESSION_KEY_RESULTS = 'dataset-finder-results';
const SESSION_KEY_QUERY = 'dataset-finder-query';

const initialState: DatasetSearchState = {
  datasets: [],
  message: '',
};

export default function DatasetFinderPage() {
  const [state, formAction] = useActionState(searchDatasets, initialState);
  const { toast } = useToast();

  // Persisted display state — survives page navigation
  const [displayedDatasets, setDisplayedDatasets] = useState<Dataset[]>([]);
  const [query, setQuery] = useState('');

  // On mount: restore last results from sessionStorage
  useEffect(() => {
    try {
      const savedResults = sessionStorage.getItem(SESSION_KEY_RESULTS);
      const savedQuery = sessionStorage.getItem(SESSION_KEY_QUERY);
      if (savedResults) setDisplayedDatasets(JSON.parse(savedResults));
      if (savedQuery) setQuery(savedQuery);
    } catch { }
  }, []);

  // When server action returns new results: display + persist them
  useEffect(() => {
    if (state.datasets.length > 0) {
      setDisplayedDatasets(state.datasets);
      try {
        sessionStorage.setItem(SESSION_KEY_RESULTS, JSON.stringify(state.datasets));
      } catch { }
    }
    if (state.message && state.message !== 'Search complete.') {
      toast({
        title: 'Dataset Search',
        description: state.message,
        variant: state.datasets.length > 0 ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

  const badgeColor = (source: string) =>
    source === 'Kaggle' ? 'bg-blue-600 text-white' :
      source === 'Hugging Face' ? 'bg-yellow-500 text-black' :
        source === 'UCI ML Repository' ? 'bg-green-600 text-white' :
          'bg-purple-600 text-white';

  return (
    <main className="w-full flex-1 flex flex-col items-center px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground tracking-tight">
          Dataset Finder
        </h1>
        <p className="text-md sm:text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
          Search for datasets from <strong>Kaggle</strong>, <strong>Hugging Face</strong>, <strong>UCI ML Repository</strong>, and AI-curated suggestions — all in one place.
        </p>
      </div>

      <div className="w-full max-w-2xl mb-12">
        <form action={formAction} className="relative">
          <Input
            name="topic"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              try { sessionStorage.setItem(SESSION_KEY_QUERY, e.target.value); } catch { }
            }}
            placeholder="Search for datasets about..."
            className="h-12 text-base pr-16"
            required
          />
          <div className="absolute top-1/2 right-2 -translate-y-1/2">
            <SubmitButton />
          </div>
        </form>
      </div>

      {displayedDatasets.length > 0 && (
        <div className="w-full max-w-4xl grid gap-4 md:grid-cols-2">
          {displayedDatasets.map((dataset, index) => (
            <Card key={index} className="flex flex-col transition-all hover:shadow-md">
              <CardHeader>
                <div className="mb-1">
                  <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor(dataset.source)}`}>
                    {dataset.source}
                  </span>
                </div>
                <CardTitle className="text-base">{dataset.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{dataset.description}</p>
              </CardContent>
              <CardFooter className="mt-auto bg-slate-50 dark:bg-slate-900/50 p-3">
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href={dataset.url} target="_blank" rel="noopener noreferrer">
                    View Dataset
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
