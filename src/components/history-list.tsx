'use client';

import { useChatHistory } from '@/hooks/use-chat-history';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function HistoryList() {
    const { history, deleteChat, clearHistory } = useChatHistory();

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl border-muted/50 bg-muted/20">
                <div className="p-4 rounded-full bg-muted/30 mb-4 text-muted-foreground">
                    <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No history yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                    Your research tasks and discoveries will appear here once you start using Insightive.
                </p>
                <Link href="/">
                    <Button>Start searching</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Research History</h2>
                    <p className="text-muted-foreground">
                        Review your previous discoveries and research tasks.
                    </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                            Clear all history
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Clear All History?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete your entire search history. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={clearHistory}>Clear All</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((item) => (
                    <Card key={item.id} className="group relative border shadow-sm transition-all hover:shadow-md">
                        <CardHeader className="p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <MessageSquare className="w-3 h-3" />
                                <span>{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
                            </div>
                            <CardTitle className="text-lg line-clamp-2 leading-tight pr-8">
                                {item.topic}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex justify-between items-center">
                            <Link href={`/?topic=${encodeURIComponent(item.topic)}`} className="w-full">
                                <Button variant="secondary" size="sm" className="w-full justify-between group/btn">
                                    Restore Research
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                </Button>
                            </Link>

                            <button
                                onClick={() => deleteChat(item.id)}
                                className="absolute top-4 right-4 p-2 rounded-md transition-colors opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                                title="Delete from history"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
