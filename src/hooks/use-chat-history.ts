'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ChatHistoryItem {
    id: string;
    topic: string;
    timestamp: number;
}

const STORAGE_KEY = 'insightive_chat_history';

export function useChatHistory() {
    const [history, setHistory] = useState<ChatHistoryItem[]>([]);

    // Load history from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse chat history', e);
            }
        }
    }, []);

    const saveChat = useCallback((topic: string) => {
        const newItem: ChatHistoryItem = {
            id: crypto.randomUUID(),
            topic,
            timestamp: Date.now(),
        };

        setHistory((prev) => {
            // Avoid duplicate topics if they were just searched (optional)
            // For now just add it to the top
            const updated = [newItem, ...prev].slice(0, 50); // Keep last 50
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const deleteChat = useCallback((id: string) => {
        setHistory((prev) => {
            const updated = prev.filter((item) => item.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        history,
        saveChat,
        deleteChat,
        clearHistory,
    };
}
