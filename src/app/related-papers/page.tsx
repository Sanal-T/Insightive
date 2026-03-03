'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
// We can modify actions.ts to have a specific searchPapers action or just use the general one?
// Let's create searchPapers in actions.ts first or reuse logic.
// For now, I'll need to update actions.ts to export a specific paper search action.
// Actually, I'll check actions.ts again. It has `search` (general).
// I should add `searchPapers` to actions.ts.
import { searchPapers, type PaperSearchState } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

const initialState: PaperSearchState = {
  papers: [],
  message: '',
};

export default function RelatedPapersPage() {
  const [state, formAction] = useActionState(searchPapers, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && state.message !== 'Search complete.') {
      toast({
        title: 'Paper Search',
        description: state.message,
        variant: state.papers.length > 0 ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <main className="w-full flex-1 flex flex-col items-center px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground tracking-tight">
          Related Papers
        </h1>
        <p className="text-md sm:text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
          Find relevant research papers from IEEE Xplore and other sources.
        </p>
      </div>

      <div className="w-full max-w-2xl mb-12">
        <form action={formAction} className="relative">
          <Input
            name="topic"
            placeholder="Search for research papers..."
            className="h-12 text-base pr-16"
            required
          />
          <div className="absolute top-1/2 right-2 -translate-y-1/2">
            <SubmitButton />
          </div>
        </form>
      </div>

      {state.papers.length > 0 && (
        <div className="w-full max-w-5xl grid gap-4 grid-cols-1 md:grid-cols-2">
          {state.papers.map((paper, index) => (
            <Card key={index} className="flex flex-col transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg leading-tight">{paper.title}</CardTitle>
                <CardDescription className="line-clamp-1">{paper.authors.join(', ')}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {paper.description || "No description provided."}
                </p>
                <p className="text-xs text-muted-foreground mt-2 font-semibold">Source: {paper.source}</p>
              </CardContent>
              <CardFooter className="mt-auto bg-slate-50 dark:bg-slate-900/50 p-3">
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href={paper.url} target="_blank" rel="noopener noreferrer">
                    Read Paper
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
