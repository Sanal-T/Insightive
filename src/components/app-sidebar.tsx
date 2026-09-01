'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarFooter,
} from '@/components/ui/sidebar';
import {
    Home,
    FileText,
    Plus,
    History,
    Settings,
    LogOut,
    LifeBuoy,
    Github,
    Database,
    BookText,
    Sparkles,
    Trash2,
    ChevronDown,
    ChevronUp,
    MessageSquare,
    HelpCircle,
} from 'lucide-react';
import { useChatHistoryContext } from '@/contexts/chat-history-context';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

// ── FAQ data ─────────────────────────────────────────────────
const FAQ_CATEGORIES = [
    {
        category: '🔍 General',
        items: [
            {
                q: 'What is Insightive?',
                a: 'Insightive is an AI-powered research assistant that helps you discover datasets, find GitHub repositories, explore related academic papers, conduct literature reviews, and summarise documents — all in one place.',
            },
            {
                q: 'Is Insightive free to use?',
                a: 'Yes, Insightive is free during the current phase. Features may be expanded in future plans.',
            },
            {
                q: 'Do I need to create an account?',
                a: 'An account is required to save your chat history and personalise your experience. Guest access may be supported for basic queries.',
            },
        ],
    },
    {
        category: '💬 Chat & Search',
        items: [
            {
                q: 'How do I start a new chat?',
                a: 'Click the "New Chat" button at the top of the sidebar. This clears the current session and lets you begin a fresh research query.',
            },
            {
                q: 'Can I revisit a previous search?',
                a: 'Yes! Click the History button in the sidebar footer to expand your recent chats. Selecting any entry will pre-fill the query so you can continue where you left off.',
            },
            {
                q: 'How do I clear my chat history?',
                a: 'Expand the History panel and click the trash icon that appears next to the "Recent Chats" label. This permanently removes all stored sessions from your device.',
            },
        ],
    },
    {
        category: '📚 Features',
        items: [
            {
                q: 'What does the Dataset Finder do?',
                a: 'Dataset Finder searches publicly available repositories (like Kaggle, UCI, and Hugging Face) to surface datasets relevant to your research topic.',
            },
            {
                q: 'How does Literature Review work?',
                a: 'Enter your research topic or keywords and Insightive will compile a structured overview of key papers, themes, and findings — saving you hours of manual scanning.',
            },
            {
                q: 'What is the Summarization feature?',
                a: 'Paste any academic paper, article, or lengthy document and Insightive will produce a concise, structured summary highlighting the key points, methodology, and conclusions.',
            },
            {
                q: 'What does the Repository Finder show?',
                a: 'It searches GitHub for open-source projects that match your research interest, ranked by relevance, stars, and recency.',
            },
        ],
    },
    {
        category: '⚙️ Troubleshooting',
        items: [
            {
                q: 'Why is the AI response taking a long time?',
                a: 'Complex queries or heavy document processing can take a few extra seconds. If it exceeds 30 seconds, try refreshing the page and submitting again. Check your internet connection as well.',
            },
            {
                q: 'The results don\'t seem relevant — what should I do?',
                a: 'Try rephrasing your query to be more specific. Adding keywords like the domain, time range, or methodology can significantly improve result quality.',
            },
        ],
    },
];

// ── Help & Support Dialog ─────────────────────────────────────
function HelpSupportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-5 border-b bg-muted/40">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                        <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold">Help &amp; Support</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Frequently asked questions about Insightive
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>

                {/* FAQ body */}
                <ScrollArea className="max-h-[65vh] px-6 py-4">
                    <div className="space-y-6 pb-2">
                        {FAQ_CATEGORIES.map((cat) => (
                            <div key={cat.category}>
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                                    {cat.category}
                                </p>
                                <Accordion type="single" collapsible className="w-full">
                                    {cat.items.map((item, idx) => (
                                        <AccordionItem key={idx} value={`${cat.category}-${idx}`}>
                                            <AccordionTrigger className="text-sm text-left hover:no-underline font-medium">
                                                {item.q}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                                                {item.a}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Footer hint */}
                <div className="border-t px-6 py-3 text-xs text-muted-foreground bg-muted/20">
                    Still have questions? Reach out via the feedback form or open an issue on GitHub.
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Relative time helper ────────────────────────────────────
function relativeTime(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

export function AppSidebar() {
    const router = useRouter();
    const { history, clearHistory } = useChatHistoryContext();
    const [historyOpen, setHistoryOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    const handleHistoryEntry = (query: string) => {
        sessionStorage.setItem('insightive_prefill', query);
        router.push('/');
    };

    return (
        <>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center gap-2 px-1">
                        <Image src="/logo.png" alt="Insightive Logo" width={32} height={32} className="rounded-md" />
                        <span className="text-xl font-bold font-headline">Insightive</span>
                    </div>
                </SidebarHeader>

                {/* ── Main Nav ── */}
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link href="/">
                                    <SidebarMenuButton>
                                        <Plus />
                                        New Chat
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link href="/">
                                    <SidebarMenuButton>
                                        <Home />
                                        Home
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/dataset-finder">
                                    <SidebarMenuButton>
                                        <Database />
                                        Dataset Finder
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/repository-finder">
                                    <SidebarMenuButton>
                                        <Github />
                                        Repository Finder
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/literature-review">
                                    <SidebarMenuButton>
                                        <BookText />
                                        Literature Review
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/summarization">
                                    <SidebarMenuButton>
                                        <Sparkles />
                                        Summarization
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Link href="/related-papers">
                                    <SidebarMenuButton>
                                        <FileText />
                                        Related Papers
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>

                    {/* ── History Panel (collapsible) ── */}
                    {historyOpen && (
                        <SidebarGroup>
                            <div className="flex items-center justify-between px-2 mb-1">
                                <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide">
                                    Recent Chats
                                </SidebarGroupLabel>
                                {history.length > 0 && (
                                    <button
                                        onClick={clearHistory}
                                        title="Clear history"
                                        className="text-muted-foreground hover:text-destructive transition-colors p-0.5 rounded"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                            <SidebarMenu>
                                {history.length === 0 ? (
                                    <SidebarMenuItem>
                                        <p className="px-2 text-xs text-muted-foreground py-2">No history yet.</p>
                                    </SidebarMenuItem>
                                ) : (
                                    history.map((entry) => (
                                        <SidebarMenuItem key={entry.id}>
                                            <SidebarMenuButton
                                                onClick={() => handleHistoryEntry(entry.query)}
                                                className="flex flex-col items-start gap-0.5 h-auto py-2"
                                                title={entry.query}
                                            >
                                                <div className="flex items-center gap-1.5 w-full">
                                                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                    <span className="text-sm truncate flex-1">{entry.query}</span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground pl-5">
                                                    {relativeTime(entry.timestamp)}
                                                </span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))
                                )}
                            </SidebarMenu>
                        </SidebarGroup>
                    )}
                </SidebarContent>

                {/* ── Footer ── */}
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => setHistoryOpen(o => !o)}
                                className="w-full"
                            >
                                <History />
                                History
                                {historyOpen
                                    ? <ChevronUp className="ml-auto h-4 w-4" />
                                    : <ChevronDown className="ml-auto h-4 w-4" />
                                }
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => setHelpOpen(true)}>
                                <LifeBuoy />
                                Help &amp; Support
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Settings />
                                Settings
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarSeparator />
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <LogOut />
                                Logout
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <HelpSupportDialog open={helpOpen} onOpenChange={setHelpOpen} />
        </>
    );
}
