'use client';

import { useEffect, useActionState, useRef, useState } from 'react';
import { search, type GeneralSearchState } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { SubmitButton } from '@/components/submit-button';
import { ResultsDisplay } from '@/components/results-display';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { useChatHistoryContext } from '@/contexts/chat-history-context';

const initialState: GeneralSearchState = {
  repositories: [],
  papers: [],
  datasets: [],
  message: '',
  errors: [],
};

export default function InsightivePage() {
  const [state, formAction] = useActionState(search, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const { addEntry } = useChatHistoryContext();

  // Pre-fill from history click (stored in sessionStorage by AppSidebar)
  useEffect(() => {
    const prefill = sessionStorage.getItem('insightive_prefill');
    if (prefill && textareaRef.current) {
      textareaRef.current.value = prefill;
      sessionStorage.removeItem('insightive_prefill');
    }
  }, []);

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

  const submitQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSubmittedQuery(trimmed);
    addEntry(trimmed);
    formRef.current?.requestSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitQuery(e.currentTarget.value);
    }
  };

  return (
    <main className="w-full flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground tracking-tight">
          Leveraging Agentic AI and LLMs for <br /> Intelligent Academic Discovery and Analysis
        </h1>
        <p className="text-md sm:text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
          Write a research task or choose one below and Insightive Agent will use the best
          AI Models, Tools and Data to complete it for you.
        </p>
      </div>

      <div className="w-full max-w-3xl rounded-xl bg-card border shadow-lg p-2 mb-12">
        <form ref={formRef} action={formAction} className="relative">
          <Textarea
            ref={textareaRef}
            name="topic"
            placeholder="Give me any task to work on... (Enter to send, Shift+Enter for new line)"
            className="min-h-[120px] text-base bg-transparent border-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-12"
            required
            onKeyDown={handleKeyDown}
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
        <div className="w-full max-w-5xl mx-auto">
          {submittedQuery && (
            <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Search className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Your query</p>
                <p className="text-sm font-medium text-foreground">{submittedQuery}</p>
              </div>
            </div>
          )}
          <ResultsDisplay
            repositories={state.repositories}
            papers={state.papers}
            datasets={state.datasets}
          />
        </div>
      )}
    </main>
  );
}
