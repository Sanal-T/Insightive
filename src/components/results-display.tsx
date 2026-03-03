'use client';

import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import type { Paper } from '@/lib/types';
import type { Dataset } from '@/lib/dataset-service';
import { Button } from './ui/button';

interface ResultsDisplayProps {
  repositories: string[];
  papers: Paper[];
  datasets: Dataset[];
}

function getRepoName(url: string) {
  try {
    const parsedUrl = new URL(url);
    let path = parsedUrl.pathname;

    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    const parts = path.split('/');

    if (parsedUrl.hostname === 'github.com' && parts.length >= 2) {
      return `${parts[0]} / ${parts[1]}`;
    } else if (parsedUrl.hostname === 'paperswithcode.com') {
      if (parts.length > 1) {
        return parts.slice(1).join(' / ').replace(/-/g, ' ');
      }
    }
    return path;
  } catch {
    return url;
  }
}

export function ResultsDisplay({ repositories, papers, datasets }: ResultsDisplayProps) {
  const defaultTab = repositories.length > 0 ? "repositories" : (papers.length > 0 ? "papers" : "datasets");

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-200/50 dark:bg-gray-800/50">
          <TabsTrigger value="repositories" className="flex items-center gap-2" disabled={repositories.length === 0}>
            <Icons.GitHub />
            Repositories <Badge variant="secondary" className="ml-2 hidden sm:inline-block">{repositories.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="papers" className="flex items-center gap-2" disabled={papers.length === 0}>
            <Icons.Paper />
            Papers <Badge variant="secondary" className="ml-2 hidden sm:inline-block">{papers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="datasets" className="flex items-center gap-2" disabled={datasets.length === 0}>
            <Icons.Dataset />
            Datasets <Badge variant="secondary" className="ml-2 hidden sm:inline-block">{datasets.length}</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="repositories" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repositories.map((repo, index) => (
              <Card key={index} className="flex flex-col transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-start gap-3">
                    <Icons.GitHub className="mt-1 h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="font-code text-base capitalize">{getRepoName(repo)}</span>
                  </CardTitle>
                </CardHeader>
                <CardFooter className="mt-auto bg-slate-50 dark:bg-slate-900/50 p-3">
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href={repo} target="_blank" rel="noopener noreferrer">
                      View Source
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="papers" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {papers.map((paper, index) => (
              <Card key={index} className="flex flex-col transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle>{paper.title}</CardTitle>
                  <CardDescription>{paper.authors.join(', ')}</CardDescription>
                </CardHeader>
                <CardContent className='flex-grow'>
                  <p className="text-sm text-muted-foreground line-clamp-3">{paper.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center mt-auto bg-slate-50 dark:bg-slate-900/50 p-3">
                  <Badge variant="outline">{paper.source}</Badge>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={paper.url} target="_blank" rel="noopener noreferrer">
                      Read Paper
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="datasets" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {datasets.map((dataset, index) => (
              <Card key={index} className="flex flex-col transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle>{dataset.name}</CardTitle>
                  <CardDescription>Source: {dataset.source}</CardDescription>
                </CardHeader>
                <CardContent className='flex-grow'>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
