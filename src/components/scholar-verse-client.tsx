'use client';

import { useEffect, useActionState, useState } from 'react';
import { search, type GeneralSearchState } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { SubmitButton } from '@/components/submit-button';
import { ResultsDisplay } from '@/components/results-display';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const initialState: GeneralSearchState = {
  repositories: [],
  papers: [],
  datasets: [],
  message: '',
  errors: [],
};

export function InsightiveClient() {
  const [state, formAction] = useActionState(search, initialState);
  const [query, setQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && !['Search complete.', 'No results found. Try a different topic.'].includes(state.message)) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
    if (state.errors && state.errors.length > 0) {
      state.errors.forEach((error) => {
        toast({
          title: 'Search Error',
          description: error,
          variant: 'destructive',
        });
      });
    }
  }, [state.message, state.errors, toast]);

  const hasResults = state.repositories.length > 0 || state.papers.length > 0 || state.datasets.length > 0;

  return (
    <main className="w-full flex-1 flex flex-col items-center justify-center -mt-24 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold font-headline text-foreground tracking-tight">
          Leveraging Agentic AI and LLMs for <br /> Intelligent Academic Discovery and Analysis
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
          Write a research task or choose one below and Insightive Agent will use the best
          AI Models, Tools and Data to complete it for you.
        </p>
      </div>

      <div className="w-full max-w-3xl rounded-xl bg-card border shadow-lg p-2 mb-12">
        <form action={formAction} className="relative">
          <Textarea
            name="topic"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Give me any task to work on..."
            className="min-h-[120px] text-base bg-transparent border-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-12"
            required
          />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-3 right-3">
            <SubmitButton />
          </div>
        </form>
      </div>

      {state.errors && state.errors.length > 0 && (
        <Alert variant="destructive" className="mt-8 max-w-3xl">
          <AlertDescription>
            <ul className="list-disc pl-5">
              {state.errors.map((error, i) => <li key={i}>{error}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {state.message === 'No results found. Try a different topic.' && !hasResults && (
        <div className="text-center mt-12 text-muted-foreground">
          <p>{state.message}</p>
        </div>
      )}

      {hasResults && (
        <ResultsDisplay
          repositories={state.repositories}
          papers={state.papers}
          datasets={state.datasets}
        />
      )}
    </main>
  );
}
