'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, FileText, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function LiteratureReviewPage() {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [docId, setDocId] = useState<string | null>(null);
    const [question, setQuestion] = useState("Generate a comprehensive literature review summarizing the key findings, methodology, and limitations.");
    const [review, setReview] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:8000/ingest', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to upload PDF');

            const data = await res.json();
            setDocId(data.doc_id);
            toast({ title: "Success", description: "PDF uploaded and indexed successfully." });
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: "Could not connect to Python backend. Is it running?",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleGenerate = async () => {
        if (!docId) return;

        setIsGenerating(true);
        setReview(""); // Clear previous

        try {
            const res = await fetch('http://localhost:8000/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    doc_id: docId,
                    question: question,
                }),
            });

            if (!res.ok) throw new Error('Generation failed');

            const data = await res.json();
            setReview(data.response);
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to generate review. Check backend logs.",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                    <FileText className="h-8 w-8 text-primary" />
                    Literature Review Agent
                </h1>
                <p className="text-muted-foreground">
                    Upload a research paper and let the Local LLM Agent generate a review for you using RAG.
                </p>
            </div>

            {/* Step 1: Upload */}
            <Card>
                <CardHeader>
                    <CardTitle>1. Upload Paper</CardTitle>
                    <CardDescription>Select a PDF file to analyze. The system will parse and index it locally.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="pdf-upload">PDF File</Label>
                        <Input id="pdf-upload" type="file" accept=".pdf" onChange={handleFileChange} />
                    </div>

                    <Button
                        onClick={handleUpload}
                        disabled={!file || isUploading || !!docId}
                        className="w-full sm:w-auto"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Indexing...
                            </>
                        ) : docId ? (
                            <>
                                <FileText className="mr-2 h-4 w-4" />
                                Indexed ✓
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload & Index
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Step 2: Generate */}
            {docId && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader>
                        <CardTitle>2. Generate Review</CardTitle>
                        <CardDescription>Ask a question or request a specific type of review.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Research Question / Prompt</Label>
                            <Textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full sm:w-auto">
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Agent Working...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Generate Review
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Result */}
            {review && (
                <Card className="border-primary/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="bg-muted/50">
                        <CardTitle>Literature Review Output</CardTitle>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none p-6">
                        <ReactMarkdown>{review}</ReactMarkdown>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
