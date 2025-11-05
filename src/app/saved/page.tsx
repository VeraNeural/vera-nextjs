'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

interface SavedMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  thread_title?: string;
}

export default function SavedMessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedMessages();
  }, []);

  const fetchSavedMessages = async () => {
    try {
      const response = await fetch('/api/messages?saved=true');
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching saved messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_saved: false }),
      });
      
      // Remove from local state
      setMessages(messages.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Error unsaving message:', error);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });
      
      // Remove from local state
      setMessages(messages.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      <Header 
        onMenuToggle={() => {}} 
        onNewChat={() => router.push('/')}
        showMenuButton={false}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-text-primary">Saved Messages</h1>
            <button
              onClick={() => router.push('/')}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              ← Back to Chat
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orb-purple"></div>
              <p className="mt-4 text-text-secondary">Loading saved messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg">No saved messages yet</p>
              <p className="text-text-tertiary mt-2">Click the ♥ icon on any message to save it</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="p-6 rounded-2xl bg-bg-secondary border border-border-color"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-medium ${
                          message.role === 'assistant' ? 'text-orb-purple' : 'text-text-secondary'
                        }`}>
                          {message.role === 'assistant' ? 'VERA' : 'You'}
                        </span>
                        {message.thread_title && (
                          <span className="text-xs text-text-tertiary">
                            from "{message.thread_title}"
                          </span>
                        )}
                      </div>
                      <p className="text-text-primary whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p className="text-xs text-text-tertiary mt-3">
                        {new Date(message.created_at).toLocaleDateString()} at{' '}
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUnsave(message.id)}
                        className="text-orb-purple hover:text-orb-blue transition-colors"
                        title="Remove from saved"
                      >
                        ♥
                      </button>
                      <button
                        onClick={() => handleDelete(message.id)}
                        className="text-text-tertiary hover:text-red-400 transition-colors"
                        title="Delete message"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
