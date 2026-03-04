'use client';

import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons, getSourceIcon, getSourceColor } from '@/components/icons';
import type { Paper, Repository } from '@/lib/types';
import type { Dataset } from '@/lib/dataset-service';
import { Button } from './ui/button';

interface ResultsDisplayProps {
  repositories: Repository[];
  papers: Paper[];
  datasets: Dataset[];
}

export function ResultsDisplay({ repositories, papers, datasets }: ResultsDisplayProps) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <Tabs defaultValue="repositories" className="w-full">
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
            {repositories.map((repo, index) => {
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
            {datasets.map((dataset, index) => {
              const badgeColor =
                dataset.source === 'Kaggle' ? 'bg-blue-600 text-white' :
                  dataset.source === 'Hugging Face' ? 'bg-yellow-500 text-black' :
                    (dataset.source === 'OpenML (incl. UCI)' || dataset.source === 'Zenodo (incl. UCI)' || dataset.source === 'OpenML (UCI)') ? 'bg-green-600 text-white' :
                      'bg-purple-600 text-white'; // AI Suggested
              return (
                <Card key={index} className="flex flex-col transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="mb-1">
                      <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
                        {dataset.source}
                      </span>
                    </div>
                    <CardTitle className="text-base">{dataset.name}</CardTitle>
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
              );
            })}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
