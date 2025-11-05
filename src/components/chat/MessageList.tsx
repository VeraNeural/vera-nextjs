'use client';

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isSaved?: boolean;
}

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  onSaveMessage?: (id: string) => void;
  onDeleteMessage?: (id: string) => void;
}

export default function MessageList({
  messages,
  isTyping,
  onSaveMessage,
  onDeleteMessage,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            {...message}
            onSave={onSaveMessage}
            onDelete={onDeleteMessage}
          />
        ))}
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}