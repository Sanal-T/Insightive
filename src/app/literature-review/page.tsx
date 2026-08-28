'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    Upload, Search, X, FileText, Loader2, BookOpen,
    Plus, ChevronRight
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────
interface UploadedPaper {
    type: 'pdf';
    docId: string;
    filename: string;
}

interface SearchPaper {
    type: 'search';
    title: string;
    description: string;
    authors: string;
    source: string;
    url: string;
}

type QueuedPaper = UploadedPaper | SearchPaper;

interface AnalysisRow {
    title: string;
    methodology: string;
    key_findings: string;
    limitations: string;
    research_gaps: string;
    future_work: string;
    error?: string;
}

const BACKEND = 'http://localhost:8000';

// ─── Component ────────────────────────────────────────────────────
export default function LiteratureReviewPage() {
    const { toast } = useToast();

    // Input mode: 'upload' or 'search'
    const [mode, setMode] = useState<'upload' | 'search'>('upload');

    // Paper queue
    const [queue, setQueue] = useState<QueuedPaper[]>([]);

    // Upload tab state
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Search tab state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchPaper[]>([]);
    const [searching, setSearching] = useState(false);

    // Analysis state
    const [analyzing, setAnalyzing] = useState(false);
    const [comparison, setComparison] = useState<AnalysisRow[]>([]);

    // ── Upload PDFs ──────────────────────────────────────────────────
    const handleFileSelect = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);

        for (const file of Array.from(files)) {
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                toast({ title: 'Invalid file', description: `${file.name} is not a PDF.`, variant: 'destructive' });
                continue;
            }
            try {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch(`${BACKEND}/ingest`, { method: 'POST', body: formData });
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.detail || 'Upload failed');
                }
                const data = await res.json();
                setQueue(q => [...q, { type: 'pdf', docId: data.doc_id, filename: file.name }]);
                toast({ title: 'Uploaded', description: `${file.name} indexed successfully.` });
            } catch (e: any) {
                toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
            }
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [toast]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        handleFileSelect(e.dataTransfer.files);
    }, [handleFileSelect]);

    // ── Search papers ────────────────────────────────────────────────
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        setSearchResults([]);
        try {
            const res = await fetch(`/api/search-papers?q=${encodeURIComponent(searchQuery)}`);
            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();
            setSearchResults(data.papers || []);
        } catch (e: any) {
            toast({ title: 'Search error', description: e.message, variant: 'destructive' });
        }
        setSearching(false);
    };

    const addSearchPaper = (paper: SearchPaper) => {
        const alreadyAdded = queue.some(
            q => q.type === 'search' && q.title === paper.title
        );
        if (alreadyAdded) {
            toast({ description: 'Paper already in queue.' });
            return;
        }
        setQueue(q => [...q, paper]);
        toast({ description: `"${paper.title.slice(0, 50)}..." added to queue.` });
    };

    const removeFromQueue = (idx: number) => {
        setQueue(q => q.filter((_, i) => i !== idx));
    };

    // ── Compare papers ───────────────────────────────────────────────
    const handleCompare = async () => {
        if (queue.length === 0) {
            toast({ description: 'Add at least one paper to compare.', variant: 'destructive' });
            return;
        }
        setAnalyzing(true);
        setComparison([]);

        try {
            const pdfPapers = queue.filter(p => p.type === 'pdf') as UploadedPaper[];
            const searchPapers = queue.filter(p => p.type === 'search') as SearchPaper[];

            const results: AnalysisRow[] = [];

            // Analyze PDFs
            if (pdfPapers.length > 0) {
                const res = await fetch(`${BACKEND}/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ doc_ids: pdfPapers.map(p => p.docId) }),
                });
                if (!res.ok) throw new Error((await res.json()).detail || 'PDF analysis failed');
                const data = await res.json();
                results.push(...data.papers);
            }

            // Analyze search papers (by abstract)
            if (searchPapers.length > 0) {
                const res = await fetch(`${BACKEND}/analyze_abstracts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        papers: searchPapers.map(p => ({
                            title: p.title,
                            abstract: p.description,
                            authors: p.authors,
                            source: p.source,
                        })),
                    }),
                });
                if (!res.ok) throw new Error((await res.json()).detail || 'Abstract analysis failed');
                const data = await res.json();
                results.push(...data.papers);
            }

            setComparison(results);
        } catch (e: any) {
            toast({ title: 'Analysis failed', description: e.message + '. Is the Python backend running on port 8000?', variant: 'destructive' });
        }
        setAnalyzing(false);
    };


    // ── Render ───────────────────────────────────────────────────────
    return (
        <main className="w-full flex-1 flex flex-col items-center px-4 py-12 max-w-7xl mx-auto">

            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground tracking-tight flex items-center justify-center gap-3">
                    <BookOpen className="h-9 w-9 text-primary" />
                    Literature Review
                </h1>
                <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                    Upload research papers or search online, then compare them side-by-side.
                    Powered by <strong>Ollama (gemma3:1b)</strong> — runs locally, no API limits.
                </p>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── LEFT PANEL: Add Papers ─── */}
                <div className="lg:col-span-1 space-y-4">

                    {/* Mode tabs */}
                    <div className="flex rounded-lg border overflow-hidden">
                        <button
                            onClick={() => setMode('upload')}
                            className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors
                ${mode === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                        >
                            <Upload className="h-4 w-4" /> Upload PDF
                        </button>
                        <button
                            onClick={() => setMode('search')}
                            className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors
                ${mode === 'search' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}
                        >
                            <Search className="h-4 w-4" /> Search Papers
                        </button>
                    </div>

                    {/* Upload tab */}
                    {mode === 'upload' && (
                        <div
                            onDrop={onDrop}
                            onDragOver={e => e.preventDefault()}
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                multiple
                                className="hidden"
                                onChange={e => handleFileSelect(e.target.files)}
                            />
                            {uploading ? (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm">Indexing PDF…</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <Upload className="h-8 w-8 text-primary" />
                                    <p className="text-sm font-medium">Drop PDFs here or click to browse</p>
                                    <p className="text-xs">Multiple files supported</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Search tab */}
                    {mode === 'search' && (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search papers…"
                                    className="flex-1"
                                />
                                <Button onClick={handleSearch} disabled={searching} size="icon">
                                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                </Button>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                                    {searchResults.map((paper, i) => (
                                        <div key={i} className="border rounded-lg p-3 bg-card hover:bg-muted/50 transition-colors">
                                            <p className="text-sm font-medium line-clamp-2">{paper.title}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{paper.source}</p>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="mt-2 h-7 text-xs"
                                                onClick={() => addSearchPaper(paper)}
                                            >
                                                <Plus className="h-3 w-3 mr-1" /> Add to Queue
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Paper Queue */}
                    {queue.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold">Paper Queue ({queue.length})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {queue.map((paper, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs group">
                                        <FileText className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                                        <span className="flex-1 line-clamp-2 text-muted-foreground">
                                            {paper.type === 'pdf' ? paper.filename : paper.title}
                                        </span>
                                        <Badge variant="outline" className="shrink-0 text-[10px] h-5">
                                            {paper.type === 'pdf' ? 'PDF' : 'Web'}
                                        </Badge>
                                        <button
                                            onClick={() => removeFromQueue(i)}
                                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                        </button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Compare button */}
                    <Button
                        onClick={handleCompare}
                        disabled={analyzing || queue.length === 0}
                        className="w-full"
                        size="lg"
                    >
                        {analyzing ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing with Ollama…</>
                        ) : (
                            <><ChevronRight className="h-4 w-4 mr-2" /> Compare {queue.length > 0 ? `${queue.length} ` : ''}Papers</>
                        )}
                    </Button>

                    {analyzing && (
                        <p className="text-xs text-muted-foreground text-center">
                            Ollama is analyzing each paper locally. This may take 1–3 minutes per paper.
                        </p>
                    )}
                </div>

                {/* ── RIGHT PANEL: Comparison Table ─── */}
                <div className="lg:col-span-2">
                    {comparison.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Comparison Results</h2>
                            </div>

                            <div className="overflow-x-auto rounded-xl border">
                                <table className="w-full text-sm border-collapse min-w-[700px]">
                                    <thead>
                                        <tr className="bg-muted/60">
                                            {['Paper', 'Methodology', 'Key Findings', 'Limitations', 'Research Gaps', 'Future Work'].map(h => (
                                                <th key={h} className="px-3 py-3 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap border-b">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparison.map((row, i) => (
                                            <tr key={i} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                                                <td className="px-3 py-4 font-medium align-top min-w-[150px] max-w-[200px]">
                                                    <span className="line-clamp-4 text-foreground">{row.title}</span>
                                                    {row.error && <Badge variant="destructive" className="mt-1 text-[10px]">Error</Badge>}
                                                </td>
                                                {['methodology', 'key_findings', 'limitations', 'research_gaps', 'future_work'].map(key => (
                                                    <td key={key} className="px-3 py-4 text-muted-foreground align-top min-w-[140px] max-w-[220px]">
                                                        <span className="line-clamp-6 text-xs leading-relaxed">
                                                            {(row as any)[key] || '—'}
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20 border-2 border-dashed border-border rounded-xl">
                            <BookOpen className="h-12 w-12 mb-4 opacity-30" />
                            <p className="font-medium">No comparison yet</p>
                            <p className="text-sm mt-1 text-center max-w-xs">
                                Upload PDFs or search for papers, then click <strong>Compare Papers</strong>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
