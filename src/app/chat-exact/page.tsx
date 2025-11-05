'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import TrialBannerExact from '@/components/trial/TrialBannerExact';
import ChatContainer from '@/components/chat/ChatContainer';
import WelcomeStateExact from '@/components/chat/WelcomeStateExact';
import InputContainer from '@/components/chat/InputContainer';
import { useChat } from '@/hooks/useChat';
import { useTrial } from '@/hooks/useTrial';

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { messages, loading, sendMessage } = useChat();
  const { trial, loading: trialLoading } = useTrial();

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
  const totalMessages = 50;
  const messagesUsed = 0; // TODO: Get from trial state
  const hoursRemaining = trial?.hoursRemaining || 48;

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
          marginLeft: sidebarOpen ? '280px' : '0',
          transition: 'margin-left 0.3s ease',
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
            onUpgrade={() => console.log('Upgrade')}
          />
        )}

        {/* Chat Messages - Scrollable */}
        {messages.length === 0 ? (
          <WelcomeStateExact
            onQuickAction={(action) => {
              if (action === 'breathing') {
                // TODO: Open breathing modal
                console.log('Open breathing modal');
              } else if (action === 'journal') {
                // TODO: Open journaling panel
                console.log('Open journaling panel');
              } else if (action === 'grounding') {
                // TODO: Open grounding panel
                console.log('Open grounding panel');
              } else if (action === 'emotions') {
                handleSend('I need help processing my emotions right now');
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
          />
        )}

        {/* Input Container - Frozen */}
        <InputContainer
          onSend={handleSend}
          disabled={loading || trialLoading}
          placeholder="Share what's on your mind..."
        />
      </div>
    </MainLayout>
  );
}
