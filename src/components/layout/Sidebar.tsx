'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BreathingOrb from '@/components/orb/BreathingOrb';
import { useTrial as useSubscriptionTrial } from '@/hooks/useTrial';
import { useAuth } from '@/hooks/useAuth';
import type { PlanSlug } from '@/types/subscription';

interface Thread {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  created_at: string;
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { trial } = useSubscriptionTrial();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      loadThreads();
    }
  }, [mounted]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const original = document.body.style.overflow;
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = original || '';
    }
    return () => {
      document.body.style.overflow = original || '';
    };
  }, [isMobileOpen]);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/threads');
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads || []);
      }
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const demoTodayThreads: Thread[] = [
    {
      id: 'demo-1',
      title: 'Feeling overwhelmed',
      preview: "I'm feeling really overwhelmed with work and...",
      timestamp: '2 hours ago',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-2',
      title: 'Morning anxiety',
      preview: 'Woke up with that familiar tightness in...',
      timestamp: '5 hours ago',
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const demoThisWeekThreads: Thread[] = [
    {
      id: 'demo-3',
      title: 'Grounding practice',
      preview: 'Started the 5-4-3-2-1 technique and it...',
      timestamp: '2 days ago',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-4',
      title: 'Breakthrough moment',
      preview: 'I recognized my freeze response today...',
      timestamp: '4 days ago',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const todayThreads = threads.length > 0
    ? threads.filter(thread => {
        const threadDate = new Date(thread.created_at);
        return threadDate >= todayStart;
      })
    : demoTodayThreads;

  const thisWeekThreads = threads.length > 0
    ? threads.filter(thread => {
        const threadDate = new Date(thread.created_at);
        return threadDate < todayStart && threadDate >= weekStart;
      })
    : demoThisWeekThreads;

  const formatTimestamp = (isoDate: string) => {
    if (!mounted) return '';
    const date = new Date(isoDate);
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getSuggestedProtocol = () => {
    const recentThreads = [...todayThreads, ...thisWeekThreads];
    const allText = recentThreads.map(t => `${t.title} ${t.preview}`).join(' ').toLowerCase();

    const patterns = {
      anxiety: /anxiety|anxious|worry|worried|panic|nervous/,
      overwhelm: /overwhelm|too much|stressed|stress|exhausted/,
      freeze: /freeze|frozen|shutdown|shut down|numb|dissociat/,
      trauma: /trauma|trigger|flashback|ptsd/,
      grounding: /ground|present|here/,
      breathing: /breath|breathing/,
      regulation: /regulat|dysregulat|calm/,
    };

    const matches = Object.entries(patterns).filter(([_, regex]) => regex.test(allText));
    if (matches.length === 0) {
      return '✨ Continue building awareness through daily check-ins';
    }

    if (matches.some(([key]) => key === 'freeze')) {
      return '🌊 Protocol: Gentle body awareness and pendulation';
    }
    if (matches.some(([key]) => key === 'anxiety' || key === 'overwhelm')) {
      return '🫁 Protocol: Morning grounding + nervous system reset';
    }
    if (matches.some(([key]) => key === 'trauma')) {
      return '🛡️ Protocol: Resource building and safe anchoring';
    }
    if (matches.some(([key]) => key === 'regulation')) {
      return '⚖️ Protocol: Co-regulation practices and window of tolerance expansion';
    }
    return '💫 Protocol: Daily emotional tracking and pattern recognition';
  };

  const handleNewThread = () => {
    if (onMobileClose) onMobileClose();
    localStorage.removeItem('vera_current_thread');
    window.location.reload();
  };

  const handleThreadClick = (threadId: string) => {
    if (threadId.startsWith('demo-')) return;
    setActiveThreadId(threadId);
    localStorage.setItem('vera_current_thread', threadId);
    if (onMobileClose) onMobileClose();
    window.location.reload();
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

  const handleUpgrade = async (plan: PlanSlug) => {
    try {
      const res = await fetch('/api/stripe/create-checkout', {
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

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            cursor: 'pointer',
          }}
        />
      )}

      {/* Sidebar - SOLID DARK BACKGROUND */}
      <aside
        className={`
          fixed top-0 left-0 z-[1050]
          w-[280px] max-w-[80vw]
          h-screen
          flex flex-col
          transition-transform duration-300
          overflow-y-auto
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          backgroundColor: '#1a1a2e',
          borderRight: '1px solid rgba(100, 100, 120, 0.3)',
        }}
      >
        {/* HEADER - LOGO */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(100, 100, 120, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BreathingOrb size={36} />
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
              VERA
            </h1>
          </div>
          <button
            onClick={onMobileClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: '24px',
              padding: '4px',
            }}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* NEW THREAD BUTTON */}
        <div style={{ padding: '12px 16px' }}>
          <button
            onClick={handleNewThread}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            + New Thread
          </button>
        </div>

        {/* THREADS - SCROLLABLE */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px 0' }}>
          {todayThreads.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#666', padding: '0 16px', marginBottom: '8px', textTransform: 'uppercase' }}>
                Today
              </h3>
              <div>
                {todayThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => handleThreadClick(thread.id)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: activeThreadId === thread.id ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                      border: 'none',
                      borderLeft: activeThreadId === thread.id ? '3px solid #8B5CF6' : '3px solid transparent',
                      color: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (activeThreadId !== thread.id) {
                        e.currentTarget.style.background = 'rgba(100, 100, 120, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeThreadId !== thread.id) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {thread.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {thread.preview}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {thisWeekThreads.length > 0 && (
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#666', padding: '0 16px', marginBottom: '8px', textTransform: 'uppercase' }}>
                This Week
              </h3>
              <div>
                {thisWeekThreads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => handleThreadClick(thread.id)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: activeThreadId === thread.id ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                      border: 'none',
                      borderLeft: activeThreadId === thread.id ? '3px solid #8B5CF6' : '3px solid transparent',
                      color: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (activeThreadId !== thread.id) {
                        e.currentTarget.style.background = 'rgba(100, 100, 120, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeThreadId !== thread.id) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {thread.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {thread.preview}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PLAN SECTION */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(100, 100, 120, 0.2)' }}>
          <h3 style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '12px', textTransform: 'uppercase' }}>
            Plan
          </h3>
          {trial?.hasSubscription ? (
            <button
              onClick={handleManageBilling}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(139, 92, 246, 0.2)',
                color: '#8B5CF6',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)')}
            >
              Manage Plan
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleUpgrade('starter')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Upgrade
              </button>
                <button
                  onClick={() => handleUpgrade('annual')}
                style={{
                  flex: 0.5,
                  padding: '10px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: '#8B5CF6',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)')}
              >
                Yearly
              </button>
            </div>
          )}
        </div>

        {/* USER PROFILE */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(100, 100, 120, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              flexShrink: 0,
            }}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || 'User'}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/profile')}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(139, 92, 246, 0.2)',
              color: '#8B5CF6',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)')}
          >
            Manage Profile
          </button>
        </div>

        {/* LEGAL LINKS */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(100, 100, 120, 0.2)', fontSize: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Link href="/legal/disclaimer" style={{ color: '#666', textDecoration: 'none' }}>Disclaimer</Link>
            <span style={{ color: '#444' }}>•</span>
            <Link href="/legal/privacy" style={{ color: '#666', textDecoration: 'none' }}>Privacy</Link>
            <span style={{ color: '#444' }}>•</span>
            <Link href="/legal/terms" style={{ color: '#666', textDecoration: 'none' }}>Terms</Link>
          </div>
        </div>
      </aside>
    </>
  );
}
