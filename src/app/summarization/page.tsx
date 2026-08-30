'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
    Upload, Loader2, Sparkles, FileText, RotateCcw, Download
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────
interface Summary {
    title: string;
    objective: string;
    methodology: string;
    key_findings: string;
    contributions: string;
    limitations: string;
    conclusion: string;
}

const BACKEND = 'http://localhost:8000';

// ─── Section config ───────────────────────────────────────────────
const SECTIONS: { key: keyof Omit<Summary, 'title'>; label: string; color: string }[] = [
    { key: 'objective', label: '🎯 Objective', color: 'border-blue-500/40 bg-blue-500/5' },
    { key: 'methodology', label: '🔬 Methodology', color: 'border-violet-500/40 bg-violet-500/5' },
    { key: 'key_findings', label: '📊 Key Findings', color: 'border-emerald-500/40 bg-emerald-500/5' },
    { key: 'contributions', label: '✨ Contributions', color: 'border-amber-500/40 bg-amber-500/5' },
    { key: 'limitations', label: '⚠️ Limitations', color: 'border-red-500/40 bg-red-500/5' },
    { key: 'conclusion', label: '🏁 Conclusion', color: 'border-slate-500/40 bg-slate-500/5' },
];

export default function SummarizationPage() {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploading, setUploading] = useState(false);
    const [summarizing, setSummarizing] = useState(false);
    const [docId, setDocId] = useState<string | null>(null);
    const [filename, setFilename] = useState('');
    const [summary, setSummary] = useState<Summary | null>(null);

    // ── Upload PDF ────────────────────────────────────────────────────
    const handleFileSelect = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            toast({ title: 'Invalid file', description: 'Only PDF files are supported.', variant: 'destructive' });
            return;
        }
        setUploading(true);
        setSummary(null);
        setDocId(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${BACKEND}/ingest`, { method: 'POST', body: formData });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Upload failed');
            }
            const data = await res.json();
            setDocId(data.doc_id);
            setFilename(file.name);
            toast({ title: '✅ Indexed', description: `${file.name} is ready to summarize.` });
        } catch (e: any) {
            toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [toast]);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        handleFileSelect(e.dataTransfer.files);
    }, [handleFileSelect]);

    // ── Summarize ─────────────────────────────────────────────────────
    const handleSummarize = async () => {
        if (!docId) return;
        setSummarizing(true);
        setSummary(null);
        try {
            const res = await fetch(`${BACKEND}/summarize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doc_id: docId }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Summarization failed');
            }
            const data: Summary = await res.json();
            setSummary(data);
        } catch (e: any) {
            toast({
                title: 'Summarization failed',
                description: e.message + (e.message.includes('fetch') ? '. Is the Python backend running on port 8000?' : ''),
                variant: 'destructive',
            });
        }
        setSummarizing(false);
    };

    // ── Export as text ────────────────────────────────────────────────
    const exportTxt = () => {
        if (!summary) return;
        const lines = [
            `PAPER SUMMARY — ${summary.title}`,
            '',
            ...SECTIONS.map(s => `## ${s.label}\n${(summary as any)[s.key]}`),
        ].join('\n\n');
        const blob = new Blob([lines], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `${summary.title.slice(0, 40).replace(/\s+/g, '_')}_summary.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <main className="w-full flex-1 flex flex-col items-center px-4 py-12 max-w-5xl mx-auto">

            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground tracking-tight flex items-center justify-center gap-3">
                    <Sparkles className="h-9 w-9 text-primary" />
                    Paper Summarization
                </h1>
                <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                    Upload a research paper — the RAG pipeline extracts the most important sections
                    and <strong>Ollama (gemma3:1b)</strong> generates a structured summary. Fully offline.
                </p>
            </div>

            {/* Upload zone */}
            <div className="w-full max-w-2xl mb-8">
                <div
                    onDrop={onDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
            ${docId ? 'border-green-500/50 bg-green-500/5' : 'border-border hover:border-primary hover:bg-primary/5'}`}
                >
                    <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                        onChange={e => handleFileSelect(e.target.files)} />

                    {uploading ? (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm">Indexing PDF with RAG…</p>
                            <p className="text-xs">Building FAISS vector store from document chunks</p>
                        </div>
                    ) : docId ? (
                        <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8 text-green-500" />
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">{filename}</p>
                            <p className="text-xs text-muted-foreground">Indexed ✓ — Ready to summarize</p>
                            <button
                                onClick={e => { e.stopPropagation(); setDocId(null); setFilename(''); setSummary(null); }}
                                className="mt-1 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                                <RotateCcw className="h-3 w-3" /> Upload different file
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Upload className="h-8 w-8 text-primary" />
                            <p className="text-sm font-medium">Drop a PDF here or click to browse</p>
                            <p className="text-xs">RAG will extract key sections before sending to Ollama</p>
                        </div>
                    )}
                </div>

                <Button
                    onClick={handleSummarize}
                    disabled={!docId || summarizing}
                    className="w-full mt-4"
                    size="lg"
                >
                    {summarizing ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Summarizing with gemma3:1b…</>
                    ) : (
                        <><Sparkles className="h-4 w-4 mr-2" /> Generate Summary</>
                    )}
                </Button>

                {summarizing && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                        RAG is retrieving relevant chunks → gemma3:1b is generating your summary. Takes ~1–2 min.
                    </p>
                )}
            </div>

            {/* Summary output */}
            {summary && (
                <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold line-clamp-2">{summary.title}</h2>
                        <Button variant="outline" size="sm" onClick={exportTxt}>
                            <Download className="h-4 w-4 mr-2" /> Export
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SECTIONS.map(({ key, label, color }) => (
                            <Card key={key} className={`border ${color}`}>
                                <CardHeader className="pb-2 pt-4 px-4">
                                    <CardTitle className="text-sm font-semibold">{label}</CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4">
                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                                        {(summary as any)[key] || '—'}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
