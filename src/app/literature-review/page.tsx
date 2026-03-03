'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AnalysisResult {
    title: string;
    detailed_summary: string;
    gap: string;
    future_scope: string;
}

export default function LiteratureReviewPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/analyze-paper', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze paper');
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-primary">Literature Review Assistant</h1>
                    <p className="text-muted-foreground text-lg">
                        Upload your research paper to get a comprehensive AI-powered analysis.
                    </p>
                </div>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Upload Research Paper</CardTitle>
                        <CardDescription>Supported format: PDF</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-muted-foreground/25 hover:border-primary/50 transition-colors">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer flex flex-col items-center space-y-4"
                            >
                                <div className="p-4 bg-muted rounded-full">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <div className="text-center">
                                    <span className="font-semibold text-primary">Click to upload</span>
                                    <span className="text-muted-foreground"> or drag and drop</span>
                                    <p className="text-xs text-muted-foreground mt-1">PDF up to 10MB</p>
                                </div>
                            </label>
                            {file && (
                                <div className="mt-4 flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">
                                    <FileText className="h-4 w-4" />
                                    {file.name}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={handleUpload}
                                disabled={!file || loading}
                                size="lg"
                                className="w-full md:w-auto"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing Paper...
                                    </>
                                ) : (
                                    'Analyze Paper'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {result && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Literature Study Header */}
                        <div className="text-center space-y-4">
                            <h2 className="text-5xl font-serif text-[#4472C4] font-medium">Literature Study</h2>
                            <p className="text-2xl font-medium text-foreground max-w-4xl mx-auto">
                                [3] Paper Title: "{result.title}"
                            </p>
                        </div>

                        {/* Table Layout */}
                        <div className="overflow-hidden border border-muted shadow-sm rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 bg-[#1F4E79] text-white">
                                <div className="p-4 text-center font-medium border-b md:border-b-0 md:border-r border-white/20">
                                    Detailed Summary:
                                </div>
                                <div className="p-4 text-center font-medium border-b md:border-b-0 md:border-r border-white/20">
                                    Gap
                                </div>
                                <div className="p-4 text-center font-medium">
                                    Future scope
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 bg-[#D9E3F0] dark:bg-slate-900/50">
                                <div className="p-6 md:border-r border-muted h-full">
                                    <div className="prose dark:prose-invert prose-sm max-w-none text-slate-800 dark:text-slate-200">
                                        <div dangerouslySetInnerHTML={{ __html: result.detailed_summary }} />
                                    </div>
                                </div>
                                <div className="p-6 md:border-r border-muted h-full">
                                    <div className="prose dark:prose-invert prose-sm max-w-none text-slate-800 dark:text-slate-200">
                                        <div dangerouslySetInnerHTML={{ __html: result.gap }} />
                                    </div>
                                </div>
                                <div className="p-6 h-full">
                                    <div className="prose dark:prose-invert prose-sm max-w-none text-slate-800 dark:text-slate-200">
                                        <div dangerouslySetInnerHTML={{ __html: result.future_scope }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pr-4">
                            <span className="text-muted-foreground font-serif italic text-lg">8</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
