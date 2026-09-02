'use client';

import React, { createContext, useContext } from 'react';
import { useChatHistory, ChatEntry } from '@/hooks/use-chat-history';

interface ChatHistoryContextType {
  history: ChatEntry[];
  addEntry: (query: string) => void;
  clearHistory: () => void;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const chatHistory = useChatHistory();

  return (
    <ChatHistoryContext.Provider value={chatHistory}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistoryContext() {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error('useChatHistoryContext must be used within a ChatHistoryProvider');
  }
  return context;
}
