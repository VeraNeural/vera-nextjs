'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BreathingOrb from '@/components/orb/BreathingOrb';
import Button from '@/components/ui/Button';
import { useTrial as useSubscriptionTrial } from '@/hooks/useTrial';
import { useAuth } from '@/hooks/useAuth';

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

  // Ensure client-side only rendering for timestamps
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch threads from database
  useEffect(() => {
    if (mounted) {
      loadThreads();
    }
  }, [mounted]);

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

  // Separate threads by date
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Demo threads for preview (shown when no real threads exist)
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
    // Analyze recent threads for patterns
    const recentThreads = [...todayThreads, ...thisWeekThreads];
    const allText = recentThreads.map(t => `${t.title} ${t.preview}`).join(' ').toLowerCase();
    
    // Pattern detection
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

    // Priority-based recommendations
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
    // Clear current thread and go back to welcome screen
    if (onMobileClose) onMobileClose();
    localStorage.removeItem('vera_current_thread');
    window.location.reload();
  };

  const handleThreadClick = (threadId: string) => {
    // Don't load demo threads
    if (threadId.startsWith('demo-')) {
      return;
    }
    
    setActiveThreadId(threadId);
    // Store the thread ID and reload to load that conversation
    localStorage.setItem('vera_current_thread', threadId);
    if (onMobileClose) onMobileClose();
    window.location.reload();
  };

  return (
    <>
      {/* Backdrop - Shows when sidebar is open */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={onMobileClose}
          style={{
            touchAction: 'none',
          }}
        />
      )}

      {/* Sidebar - Hidden by default, slides in when open */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          w-[280px]
          flex flex-col
          transition-transform duration-300 ease-in-out
          overflow-y-auto
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderRight: '1px solid var(--border-color)',
          height: '100dvh',
          maxHeight: '100dvh',
          boxShadow: '4px 0 32px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* 1. Logo Area */}
        <div className="p-6 border-b" style={{ 
          backgroundColor: 'transparent',
          borderBottomColor: 'var(--border-color)'
        }}>
          <div className="flex items-center gap-3">
            <BreathingOrb size={36} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orb-purple to-blue-500 bg-clip-text text-transparent">
              VERA
            </h1>
          </div>

          {/* Close Button for all screens */}
          <button
            onClick={onMobileClose}
            className="absolute top-4 right-4 transition-colors"
            style={{ color: 'var(--sidebar-text-soft)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--sidebar-text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--sidebar-text-soft)'}
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 2. New Thread Button */}
        <div className="px-4 py-4" style={{ backgroundColor: 'transparent' }}>
          <button
            onClick={handleNewThread}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-orb-purple to-purple-600 hover:from-orb-purple/90 hover:to-purple-600/90 text-white font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Thread
          </button>
        </div>

        {/* 3. Thread Categories */}
        <div className="px-4 space-y-6" style={{ 
          backgroundColor: 'transparent',
          minHeight: '200px'
        }}>
          {/* Today Section */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--sidebar-text-soft)' }}>
              Today
            </h3>
            <div className="space-y-2">
              {todayThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => handleThreadClick(thread.id)}
                  className="w-full text-left p-3 rounded-lg transition-colors duration-200"
                  style={{
                    backgroundColor: activeThreadId === thread.id 
                      ? 'rgba(139, 92, 246, 0.15)' 
                      : 'transparent',
                    border: activeThreadId === thread.id 
                      ? '1px solid rgba(139, 92, 246, 0.3)' 
                      : '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (activeThreadId !== thread.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeThreadId !== thread.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate" 
                          style={{ color: 'var(--sidebar-text-primary)' }}>
                        {thread.title}
                      </h4>
                      <p className="text-xs truncate mt-1" 
                         style={{ color: 'var(--sidebar-text-secondary)' }}>
                        {thread.preview}
                      </p>
                      <p className="text-xs mt-1" 
                         style={{ color: 'var(--sidebar-text-soft)' }}>
                        {formatTimestamp(thread.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* This Week Section */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--sidebar-text-soft)' }}>
              This Week
            </h3>
            <div className="space-y-2">
              {thisWeekThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => handleThreadClick(thread.id)}
                  className="w-full text-left p-3 rounded-lg transition-colors duration-200"
                  style={{
                    backgroundColor: activeThreadId === thread.id 
                      ? 'rgba(139, 92, 246, 0.15)' 
                      : 'transparent',
                    border: activeThreadId === thread.id 
                      ? '1px solid rgba(139, 92, 246, 0.3)' 
                      : '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (activeThreadId !== thread.id) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeThreadId !== thread.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate" 
                          style={{ color: 'var(--sidebar-text-primary)' }}>
                        {thread.title}
                      </h4>
                      <p className="text-xs truncate mt-1" 
                         style={{ color: 'var(--sidebar-text-secondary)' }}>
                        {thread.preview}
                      </p>
                      <p className="text-xs mt-1" 
                         style={{ color: 'var(--sidebar-text-soft)' }}>
                        {formatTimestamp(thread.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Protocol Section */}
          <div className="mt-6 pt-6 border-t" style={{ borderTopColor: 'rgba(255, 255, 255, 0.1)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--sidebar-text-soft)' }}>
              Suggested Protocol
            </h3>
            <div
              className="p-4 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 184, 232, 0.1) 0%, rgba(184, 168, 232, 0.1) 100%)',
                border: '1px solid rgba(168, 184, 232, 0.2)',
              }}
            >
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--sidebar-text-primary)' }}>
                {threads.length > 0 ? getSuggestedProtocol() : '✨ Start your journey with a daily check-in'}
              </p>
              <p className="text-xs" style={{ color: 'var(--sidebar-text-secondary)' }}>
                {threads.length > 0 ? 'Based on your recent conversations' : 'Protocols adapt as you share more'}
              </p>
            </div>
          </div>
        </div>

        {/* 4. Theme Section */}
        <div className="px-4 py-3 border-t" style={{ 
          backgroundColor: 'transparent',
          borderTopColor: 'var(--border-color)'
        }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--sidebar-text-soft)' }}>
            Theme
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('vera-theme', 'light');
              }}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--sidebar-text-secondary)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'var(--sidebar-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'var(--sidebar-text-secondary)';
              }}
            >
              Light
            </button>
            <button
              onClick={() => {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('vera-theme', 'dark');
              }}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--sidebar-text-secondary)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'var(--sidebar-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'var(--sidebar-text-secondary)';
              }}
            >
              Dark
            </button>
            <button
              onClick={() => {
                document.documentElement.setAttribute('data-theme', 'deep');
                localStorage.setItem('vera-theme', 'deep');
              }}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--sidebar-text-secondary)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'var(--sidebar-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'var(--sidebar-text-secondary)';
              }}
            >
              Deep
            </button>
          </div>
        </div>

        {/* 4.5 Subscription Section */}
        <div className="px-4 py-3 border-t" style={{ 
          backgroundColor: 'transparent',
          borderTopColor: 'var(--border-color)'
        }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--sidebar-text-soft)' }}>
            Subscription
          </h3>
          {trial?.hasSubscription ? (
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/stripe/portal', { method: 'POST' });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data?.error || 'Failed to open billing portal');
                  if (data.url) window.location.href = data.url;
                } catch (e) {
                  console.error('Portal error:', e);
                  alert('Unable to open billing portal. Please try again.');
                }
              }}
              className="w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: 'rgba(168, 184, 232, 0.1)',
                color: 'var(--sidebar-text-primary)',
                border: '1px solid rgba(168, 184, 232, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 184, 232, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(168, 184, 232, 0.1)';
              }}
            >
              Manage Billing
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/billing/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ plan: 'monthly' }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.error || 'Failed to start checkout');
                    if (data.url) window.location.href = data.url;
                  } catch (e) {
                    console.error('Checkout error:', e);
                    alert('Unable to start checkout. Please try again.');
                  }
                }}
                className="flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(79, 70, 229, 0.25))',
                  color: 'white',
                  border: '1px solid rgba(139, 92, 246, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'none';
                }}
              >
                Upgrade
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/billing/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ plan: 'annual' }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.error || 'Failed to start checkout');
                    if (data.url) window.location.href = data.url;
                  } catch (e) {
                    console.error('Checkout error:', e);
                    alert('Unable to start checkout. Please try again.');
                  }
                }}
                className="px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--sidebar-text-secondary)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                title="Annual plan"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'var(--sidebar-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'var(--sidebar-text-secondary)';
                }}
              >
                Yearly
              </button>
            </div>
          )}
        </div>

        {/* 5. User Profile Section */}
        <div className="p-4 pb-8 border-t" style={{ 
          backgroundColor: 'transparent',
          borderTopColor: 'rgba(255, 255, 255, 0.1)'
        }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orb-purple to-purple-600 flex items-center justify-center text-white font-semibold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" 
                 style={{ color: 'var(--sidebar-text-primary)' }}>
                {user?.email || 'User'}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/profile')}
            className="w-full px-4 py-3 text-sm rounded-lg transition-colors duration-200 flex items-center gap-3"
            style={{ 
              color: 'var(--sidebar-text-primary)',
              backgroundColor: 'rgba(168, 184, 232, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(168, 184, 232, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(168, 184, 232, 0.1)';
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="font-medium">Manage Profile</span>
          </button>
        </div>

        {/* 6. Legal Links */}
        <div className="px-4 pb-6 border-t" style={{ 
          backgroundColor: 'transparent',
          borderTopColor: 'rgba(255, 255, 255, 0.08)'
        }}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]" style={{ color: 'var(--sidebar-text-soft)' }}>
            <Link href="/legal/disclaimer" className="hover:underline hover:text-[var(--sidebar-text-primary)] transition-colors">
              Disclaimer
            </Link>
            <span>•</span>
            <Link href="/legal/privacy" className="hover:underline hover:text-[var(--sidebar-text-primary)] transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/legal/terms" className="hover:underline hover:text-[var(--sidebar-text-primary)] transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
