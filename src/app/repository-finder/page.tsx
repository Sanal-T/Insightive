'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { searchRepositories, type RepoSearchState } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSourceIcon, getSourceColor } from '@/components/icons';
import type { Repository } from '@/lib/types';

const SESSION_KEY_RESULTS = 'repo-finder-results';
const SESSION_KEY_QUERY = 'repo-finder-query';

const initialState: RepoSearchState = {
  repositories: [],
  message: '',
};

export default function RepositoryFinderPage() {
  const [state, formAction] = useActionState(searchRepositories, initialState);
  const { toast } = useToast();

  // Persisted display state — survives page navigation
  const [displayedRepos, setDisplayedRepos] = useState<Repository[]>([]);
  const [query, setQuery] = useState('');

  // On mount: restore last results from sessionStorage
  useEffect(() => {
    try {
      const savedResults = sessionStorage.getItem(SESSION_KEY_RESULTS);
      const savedQuery = sessionStorage.getItem(SESSION_KEY_QUERY);
      if (savedResults) setDisplayedRepos(JSON.parse(savedResults));
      if (savedQuery) setQuery(savedQuery);
    } catch { }
  }, []);

  // When server action returns new results: display + persist them
  useEffect(() => {
    if (state.repositories.length > 0) {
      setDisplayedRepos(state.repositories);
      try {
        sessionStorage.setItem(SESSION_KEY_RESULTS, JSON.stringify(state.repositories));
      } catch { }
    }
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
          Search for public repositories across <strong>GitHub</strong>, <strong>GitLab</strong>, <strong>Bitbucket</strong>, <strong>Codeberg</strong>, and <strong>Launchpad</strong> — all in one place.
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
            placeholder="Search for repositories..."
            className="h-12 text-base pr-16"
            required
          />
          <div className="absolute top-1/2 right-2 -translate-y-1/2">
            <SubmitButton />
          </div>
        </form>
      </div>

      {displayedRepos.length > 0 && (
        <div className="w-full max-w-5xl grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayedRepos.map((repo, index) => {
            const SourceIcon = getSourceIcon(repo.source);
            const badgeColor = getSourceColor(repo.source);
            return (
              <Card key={index} className="flex flex-col transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
                      <SourceIcon className="h-3 w-3" />
                      {repo.source}
                    </span>
                    {repo.stars > 0 && (
                      <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                        ★ {repo.stars.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <CardTitle className="font-code text-sm break-words leading-snug">
                    {repo.full_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {repo.description || 'No description provided.'}
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
            );
          })}
        </div>
      )}
    </main>
  );
}
