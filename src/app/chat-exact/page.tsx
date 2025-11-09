'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TrialBannerExact from '@/components/trial/TrialBannerExact';
import ChatContainer from '@/components/chat/ChatContainer';
import WelcomeStateExact from '@/components/chat/WelcomeStateExact';
import InputContainer from '@/components/chat/InputContainer';
import { useChat } from '@/hooks/useChat';
import { useTrial } from '@/hooks/useTrial';
import { useAuth } from '@/hooks/useAuth';

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  
  const { messages, loading, sendMessage } = useChat();
  const { trial, loading: trialLoading } = useTrial();
  const { user } = useAuth();

  useEffect(() => {
    // Get user name from auth or profile
    const loadUserName = async () => {
      try {
        const response = await fetch('/api/auth/profile');
        if (response.ok) {
          const data = await response.json();
          setUserName(data.user?.name || '');
        }
      } catch (error) {
        console.error('Error loading user name:', error);
      }
    };
    
    loadUserName();
  }, []);

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  const handleSaveMessage = (id: string) => {
    // TODO: Implement save to database
    console.log('Save message:', id);
  };

  const handleDeleteMessage = (id: string) => {
    // TODO: Implement delete from database
    console.log('Delete message:', id);
  };

  // Calculate trial stats
  const totalMessages = 0; // Not tracking message limits
  const messagesUsed = 0; // Not tracking message limits
  const hoursRemaining = trial?.hoursRemaining || 48;

  // Get last assistant message for TTS
  const lastAssistantMessage = messages.length > 0 
    ? [...messages].reverse().find(msg => msg.role === 'assistant')?.content 
    : undefined;

  return (
    <MainLayout showSidebar={true}>
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          marginLeft: '0',
          width: '100%',
        }}
      >
        {/* Header - Frozen */}
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton={true}
        />

        {/* Trial Banner - Frozen */}
        {trial && (
          <TrialBannerExact
            messagesUsed={messagesUsed}
            totalMessages={totalMessages}
            hoursRemaining={hoursRemaining}
            onUpgrade={() => window.location.href = '/profile'}
          />
        )}

        {/* Chat Messages - Scrollable */}
        {messages.length === 0 ? (
          <WelcomeStateExact
            onQuickAction={(action) => {
              if (action === 'breathing') {
                handleSend('Can you guide me through a breathing exercise?');
              } else if (action === 'journal') {
                handleSend('I want to journal about what I\'m experiencing right now');
              } else if (action === 'grounding') {
                handleSend('I need help with a grounding technique');
              } else if (action === 'emotions') {
                handleSend('I need help processing my emotions right now');
              } else if (action === 'decode') {
                handleSend('I\'m experiencing sensations in my body and want to understand what they mean');
              } else if (action === 'regulate') {
                handleSend('I need help regulating my nervous system right now');
              }
            }}
          />
        ) : (
          <ChatContainer
            messages={messages.map(msg => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.createdAt),
              isSaved: false,
            }))}
            isTyping={loading}
            onSaveMessage={handleSaveMessage}
            onDeleteMessage={handleDeleteMessage}
            userName={userName}
          />
        )}

        {/* Input Container - Frozen */}
        <InputContainer
          onSend={handleSend}
          disabled={loading || trialLoading}
          placeholder="Share what's on your mind..."
          lastMessage={lastAssistantMessage}
        />
      </div>
    </MainLayout>
  );
}
