'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { searchRepositories, type RepoSearchState } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';

const initialState: RepoSearchState = {
  repositories: [],
  message: '',
};

export default function RepositoryFinderPage() {
  const [state, formAction] = useActionState(searchRepositories, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && state.message !== 'Search complete.') {
      toast({
        title: 'Repository Search',
        description: state.message,
        variant: state.repositories.length > 0 ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <main className="w-full flex-1 flex flex-col items-center px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground tracking-tight">
          Repository Finder
        </h1>
        <p className="text-md sm:text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
          Search for public repositories from GitHub.
        </p>
      </div>

      <div className="w-full max-w-2xl mb-12">
        <form action={formAction} className="relative">
          <Input
            name="topic"
            placeholder="Search for repositories..."
            className="h-12 text-base pr-16"
            required
          />
          <div className="absolute top-1/2 right-2 -translate-y-1/2">
            <SubmitButton />
          </div>
        </form>
      </div>

      {state.repositories.length > 0 && (
        <div className="w-full max-w-5xl grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.repositories.map((repo, index) => (
            <Card key={index} className="flex flex-col transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-start gap-3">
                  <Icons.GitHub className="mt-1 h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <span className="font-code text-base break-words">{repo.full_name}</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <span className='text-yellow-600 dark:text-yellow-400'>★</span> {repo.stargazers_count} stars
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {repo.description || "No description provided."}
                </p>
              </CardContent>
              <CardFooter className="mt-auto bg-slate-50 dark:bg-slate-900/50 p-3">
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href={repo.html_url} target="_blank" rel="noopener noreferrer">
                    View Repository
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
