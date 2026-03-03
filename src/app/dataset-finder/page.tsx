'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { searchDatasets, type DatasetSearchState } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const initialState: DatasetSearchState = {
  datasets: [],
  message: '',
};

export default function DatasetFinderPage() {
  const [state, formAction] = useActionState(searchDatasets, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && state.message !== 'Search complete.') {
      toast({
        title: 'Dataset Search',
        description: state.message,
        variant: state.datasets.length > 0 ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <main className="w-full flex-1 flex flex-col items-center px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground tracking-tight">
          Dataset Finder
        </h1>
        <p className="text-md sm:text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
          Search for datasets from Kaggle and other public sources.
        </p>
      </div>

      <div className="w-full max-w-2xl mb-12">
        <form action={formAction} className="relative">
          <Input
            name="topic"
            placeholder="Search for datasets about..."
            className="h-12 text-base pr-16"
            required
          />
          <div className="absolute top-1/2 right-2 -translate-y-1/2">
            <SubmitButton />
          </div>
        </form>
      </div>

      {state.datasets.length > 0 && (
        <div className="w-full max-w-4xl grid gap-4 md:grid-cols-2">
          {state.datasets.map((dataset, index) => (
            <Card key={index} className="flex flex-col transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle>{dataset.name}</CardTitle>
                <CardDescription>Source: {dataset.source}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {dataset.description}
                </p>
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
