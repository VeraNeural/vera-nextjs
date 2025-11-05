// src/hooks/useChat.ts
'use client';

import { useState, useEffect } from 'react';
import type { Message, ChatRequest, ChatResponse } from '@/types/chat';

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, imageData?: { base64: string; mimeType: string; name: string }, biometricData?: any) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  threadId: string | null;
  trialExpired: boolean;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [trialExpired, setTrialExpired] = useState(false);

  // Load or create thread on mount
  useEffect(() => {
    const savedThreadId = localStorage.getItem('vera_current_thread');
    if (savedThreadId) {
      // Load messages from existing thread
      loadThread(savedThreadId);
    }
  }, []);

  const loadThread = async (id: string) => {
    try {
      const response = await fetch(`/api/threads/${id}`);
      if (response.ok) {
        const data = await response.json();
        setThreadId(id);
        setMessages(data.messages || []);
      } else {
        // Thread not found, clear it
        localStorage.removeItem('vera_current_thread');
        setThreadId(null);
      }
    } catch (err) {
      console.error('Failed to load thread:', err);
      localStorage.removeItem('vera_current_thread');
    }
  };

  const createThread = async (): Promise<string | null> => {
    try {
      console.log('🔄 Creating new thread...');
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation', preview: '' }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Thread created:', data);
        // API returns { thread: { id, ... } }
        const newThreadId = data.thread?.id || data.id;
        setThreadId(newThreadId);
        localStorage.setItem('vera_current_thread', newThreadId);
        return newThreadId;
      } else {
        console.error('❌ Thread creation failed:', response.status, await response.text());
        // For any error, use temporary local ID
        const tempId = `local-${Date.now()}`;
        setThreadId(tempId);
        localStorage.setItem('vera_current_thread', tempId);
        return tempId;
      }
    } catch (err) {
      console.error('❌ Failed to create thread:', err);
      // Fallback to local thread
      const tempId = `local-${Date.now()}`;
      setThreadId(tempId);
      localStorage.setItem('vera_current_thread', tempId);
      return tempId;
    }
  };

  const saveMessageToDatabase = async (message: Message, currentThreadId: string): Promise<Message | null> => {
    // Skip database save for local-only threads
    if (currentThreadId.startsWith('local-')) {
      return message; // Return original message for local mode
    }

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: currentThreadId,
          role: message.role,
          content: message.content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.message;
      } else if (response.status === 401) {
        // Not authenticated - return original message
        return message;
      }
    } catch (err) {
      console.error('Failed to save message to database:', err);
    }
    return message; // Return original message on error
  };

  const updateThreadTitle = async (threadId: string, userMessage: string, assistantResponse: string) => {
    // Skip title generation for local-only threads
    if (threadId.startsWith('local-')) {
      return;
    }

    try {
      // Generate title using AI or fallback
      const response = await fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage, assistantResponse }),
      });

      if (response.ok) {
        const { title, preview } = await response.json();
        
        // Update thread in database
        await fetch(`/api/threads/${threadId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, preview }),
        });
      }
    } catch (err) {
      console.error('Failed to update thread title:', err);
    }
  };

  const sendMessage = async (content: string, imageData?: { base64: string; mimeType: string; name: string }, biometricData?: any) => {
    if (!content.trim() && !imageData) return;

    setLoading(true);
    setError(null);

    // Ensure we have a thread
    let currentThreadId = threadId;
    if (!currentThreadId) {
      currentThreadId = await createThread();
      if (!currentThreadId) {
        setError('Failed to create conversation thread');
        setLoading(false);
        return;
      }
    }

    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim() || '[Image]',
      createdAt: new Date().toISOString(),
      imageData: imageData ? `data:${imageData.mimeType};base64,${imageData.base64}` : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Save user message to database and update with real ID
    const savedUserMessage = await saveMessageToDatabase(userMessage, currentThreadId);
    if (savedUserMessage) {
      setMessages((prev) => 
        prev.map(msg => msg.id === userMessage.id ? savedUserMessage : msg)
      );
    }

    try {
      const requestBody: ChatRequest = {
        message: content.trim() || 'What do you see in this image?',
        imageData,
      };

      if (biometricData) {
        requestBody.biometricData = biometricData;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data: ChatResponse = await response.json();

      if (!response.ok) {
        // Check for trial expiration
        if (response.status === 403 && (data as any).error === 'subscription_required') {
          setTrialExpired(true);
          throw new Error('Your trial has ended. Please subscribe to continue.');
        }
        throw new Error(data.response || 'Failed to get response from VERA');
      }

      // Add VERA's response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to database and update with real ID
      const savedAssistantMessage = await saveMessageToDatabase(assistantMessage, currentThreadId);
      if (savedAssistantMessage) {
        setMessages((prev) => 
          prev.map(msg => msg.id === assistantMessage.id ? savedAssistantMessage : msg)
        );
      }

      // Generate and update thread title (only for first exchange)
      if (messages.length === 0) {
        updateThreadTitle(currentThreadId, content.trim(), data.response);
      }

      // Handle crisis response
      if (data.isCrisis) {
        console.warn('Crisis detected in message');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);

      // Add error message to chat
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `I'm having trouble connecting right now. ${errorMessage}. Please try again.`,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const clearMessages = () => {
    setMessages([]);
    setThreadId(null);
    localStorage.removeItem('vera_current_thread');
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
    clearError,
    threadId,
    trialExpired,
  };
}
