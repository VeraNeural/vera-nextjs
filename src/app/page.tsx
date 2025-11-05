'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ChatContainer from '@/components/chat/ChatContainer';
import WelcomeStateExact from '@/components/chat/WelcomeStateExact';
import InputContainer from '@/components/chat/InputContainer';
import { useChat } from '@/hooks/useChat';
import { useTrial } from '@/hooks/useTrial';
import { useAuth } from '@/hooks/useAuth';
import PlanPicker from '@/components/billing/PlanPicker';
import TrialCornerIndicator from '@/components/trial/TrialCornerIndicator';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default
  const [mounted, setMounted] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const { messages, loading, sendMessage, clearMessages, toggleSave, trialExpired } = useChat();
  const { trial, loading: trialLoading } = useTrial();

  // Redirect to signup if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signup');
    }
  }, [authLoading, user, router]);

  // Defer rendering until after hydration to avoid production hydration/runtime hook errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--background)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-soft)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  // Auto-open PlanPicker on trial expiration
  useEffect(() => {
    if (trialExpired) {
      try {
        alert('Your trial has ended. Please choose a plan to continue using VERA.');
      } catch {}
      setShowPlan(true);
    }
  }, [trialExpired]);

  // Listen for global subscription-required events from other parts of the UI
  useEffect(() => {
    const handler = () => setShowPlan(true);
    if (typeof window !== 'undefined') {
      window.addEventListener('vera:subscription_required', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('vera:subscription_required', handler);
      }
    };
  }, []);

  const handleSend = async (content: string, imageData?: { base64: string; mimeType: string; name: string }) => {
    await sendMessage(content, imageData);
  };

  const handleNewChat = () => {
    if (messages.length === 0) return; // Already on welcome screen
    clearMessages();
    setSidebarOpen(false);
  };

  const handleSaveMessage = async (id: string) => {
    await toggleSave(id);
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
      });

      console.log('Message deleted:', id);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const startCheckout = async (plan: 'monthly' | 'annual' = 'monthly') => {
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to start checkout');
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error('Checkout error:', e);
      alert('Unable to start checkout. Please try again.');
    }
  };

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to open billing portal');
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error('Portal error:', e);
      alert('Unable to open billing portal. Please try again.');
    }
  };

  return (
    <MainLayout showSidebar={true}>
      {/* Always-on, subtle trial indicator (non-invasive) */}
      {trial && trial.active && !trial.hasSubscription && (
        <TrialCornerIndicator
          hoursRemaining={trial.hoursRemaining}
          onUpgrade={() => setShowPlan(true)}
        />
      )}

      {/* Sidebar - Overlay on mobile, hidden on desktop */}
      <Sidebar
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area - Full width, sidebar overlays on top */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Header - Frozen */}
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onNewChat={handleNewChat}
          showMenuButton={true}
        />

  {/* Chat Messages - Scrollable */}
        {messages.length === 0 ? (
          <WelcomeStateExact
            onQuickAction={(action) => {
              if (action === 'breathing') {
                handleSend("I'd like to do a breathing exercise. Can you guide me through one?");
              } else if (action === 'journal') {
                handleSend("I want to journal. Can you give me a prompt to help me process what I'm experiencing?");
              } else if (action === 'grounding') {
                handleSend('I need grounding. Can you guide me through the 5-4-3-2-1 technique?');
              } else if (action === 'emotions') {
                handleSend('I need help processing my emotions right now');
              } else if (action === 'decode') {
                handleSend("I'm noticing sensations in my body. Can you help me decode what they might mean?");
              } else if (action === 'regulate') {
                handleSend("I'm feeling dysregulated. Can you help me find my way back to regulation?");
              }
            }}
          />
        ) : (
          <ChatContainer
            messages={messages.map(msg => {
              // Support both client shape (createdAt) and DB shape (created_at)
              const rawTs = (msg as any).created_at || (msg as any).createdAt;
              const parsed = rawTs ? new Date(rawTs) : new Date();
              const timestamp = isNaN(parsed.getTime()) ? new Date() : parsed;
              return {
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp,
                isSaved: Boolean((msg as any).is_saved ?? (msg as any).isSaved ?? false),
                imageData: msg.imageData,
              };
            })}
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
          lastMessage={messages.length > 0 && messages[messages.length - 1].role === 'assistant' 
            ? messages[messages.length - 1].content 
            : undefined}
        />
      </div>

      {/* Plan Picker Modal */}
      <PlanPicker
        isOpen={showPlan}
        onClose={() => setShowPlan(false)}
        onSelect={(plan) => startCheckout(plan)}
      />
    </MainLayout>
  );
}

