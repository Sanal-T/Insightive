
'use client';

import { useState } from 'react';
import { summarizePaper } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Upload, FileText, Loader2, BookOpen, Lightbulb, Target, GitPullRequest } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PaperSummary {
    title: string;
    shortSummary: string;
    detailedSummary: string;
    majorFindings: string[];
    methods: string[];
    contributions: string[];
}

export default function SummarizationPage() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [summary, setSummary] = useState<PaperSummary | null>(null);
    const { toast } = useToast();

    async function handleSubmit(formData: FormData) {
        const file = formData.get('file');
        if (!file || !(file instanceof File)) {
            toast({
                title: "No file selected",
                description: "Please upload a PDF or DOCX file.",
                variant: "destructive"
            });
            return;
        }

        setIsAnalyzing(true);
        setSummary(null);

        try {
            const result = await summarizePaper(formData);
            if (result) {
                setSummary(result);
                toast({ title: "Summarization Complete!", description: `Summarized ${result.title}` });
            } else {
                throw new Error("Summarization returned null");
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Summarization Failed",
                description: "Could not generate summary. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsAnalyzing(false);
        }
    }

    return (
        <div className="container mx-auto py-8 max-w-5xl px-4">
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold mb-3 font-headline">Research Summarizer</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Upload a research paper to get comprehensive summaries, key findings, and methodological insights instantly.
                </p>
            </div>

            <div className="max-w-xl mx-auto mb-16">
                <Card className="border-dashed border-2 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-center gap-2">
                            <Upload className="w-5 h-5 text-primary" />
                            Upload Paper
                        </CardTitle>
                        <CardDescription className="text-center">
                            Supports .pdf and .docx
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={handleSubmit} className="flex flex-col gap-4">
                            <Input type="file" name="file" accept=".pdf,.docx" required className="cursor-pointer" />
                            <Button type="submit" disabled={isAnalyzing} className="w-full" size="lg">
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating Summary...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Summarize
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {summary && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    <div className="text-center border-b pb-6">
                        <Badge variant="outline" className="mb-2">Analyzed Paper</Badge>
                        <h2 className="text-2xl font-bold text-foreground">{summary.title}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Quick Look */}
                        <Card className="bg-muted/30">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                    Quick Look
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed">{summary.shortSummary}</p>
                            </CardContent>
                        </Card>

                        {/* Detailed Summary */}
                        <Card className="md:row-span-2">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-green-500" />
                                    Detailed Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary.detailedSummary}</p>
                            </CardContent>
                        </Card>

                        {/* Key Insights Section - Stacked below Quick Look on Desktop */}
                        <div className="space-y-6">

                            {/* Major Findings */}
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2 text-sm">
                                    <Lightbulb className="w-4 h-4 text-yellow-500" /> Major Findings
                                </h3>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-1">
                                    {summary.majorFindings.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <Separator />

                            {/* Methods */}
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2 text-sm">
                                    <Target className="w-4 h-4 text-red-500" /> Methodology
                                </h3>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-1">
                                    {summary.methods.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <Separator />

                            {/* Contributions */}
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2 text-sm">
                                    <GitPullRequest className="w-4 h-4 text-purple-500" /> Contributions
                                </h3>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-1">
                                    {summary.contributions.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
