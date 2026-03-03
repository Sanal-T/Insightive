'use client';

import { useChatHistory } from '@/hooks/use-chat-history';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuAction,
} from '@/components/ui/sidebar';
import { History, Trash2, MessageSquare } from 'lucide-react';
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

export function HistoryList() {
    const { history, deleteChat, clearHistory } = useChatHistory();

    if (history.length === 0) {
        return null;
    }

    return (
        <SidebarGroup>
            <div className="flex items-center justify-between px-2 mb-2">
                <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    History
                </SidebarGroupLabel>
                {history.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button className="text-[10px] text-muted-foreground hover:text-destructive transition-colors">
                                Clear all
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Clear History</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete all your previous chat history. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={clearHistory}>Clear All</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
            <SidebarMenu>
                {history.map((item) => (
                    <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton tooltip={item.topic}>
                            <MessageSquare className="h-4 w-4" />
                            <span className="truncate">{item.topic}</span>
                        </SidebarMenuButton>
                        <SidebarMenuAction
                            onClick={() => deleteChat(item.id)}
                            showOnHover
                        >
                            <Trash2 className="h-4 w-4" />
                        </SidebarMenuAction>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
