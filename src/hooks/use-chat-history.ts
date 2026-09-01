'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'insightive_history';
const MAX_ENTRIES = 50;

export interface ChatEntry {
    id: string;
    query: string;
    timestamp: number; // Unix ms
}

function loadFromStorage(): ChatEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as ChatEntry[]) : [];
    } catch {
        return [];
    }
}

function saveToStorage(entries: ChatEntry[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch { }
}

export function useChatHistory() {
    const [history, setHistory] = useState<ChatEntry[]>([]);

    // Load on mount (client-only)
    useEffect(() => {
        setHistory(loadFromStorage());
    }, []);

    const addEntry = useCallback((query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        const entry: ChatEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            query: trimmed,
            timestamp: Date.now(),
        };
        setHistory(prev => {
            const updated = [entry, ...prev].slice(0, MAX_ENTRIES);
            saveToStorage(updated);
            return updated;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        try { localStorage.removeItem(STORAGE_KEY); } catch { }
    }, []);

    return { history, addEntry, clearHistory };
}
