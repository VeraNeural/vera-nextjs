'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

interface UserProfile {
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  trial_end?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'saved' | 'account'>('profile');
  const [savedMessages, setSavedMessages] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('dark');

  // Profile form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saveProfileLoading, setSaveProfileLoading] = useState(false);

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [adaptiveMode, setAdaptiveMode] = useState(true);

  useEffect(() => {
    loadProfile();
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setCurrentTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (activeTab === 'saved') {
      loadSavedMessages();
    }
  }, [activeTab]);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setName(data.user.name || '');
        setEmail(data.user.email || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedMessages = async () => {
    setLoadingSaved(true);
    try {
      const response = await fetch('/api/messages?saved=true');
      if (response.ok) {
        const data = await response.json();
        setSavedMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading saved messages:', error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaveProfileLoading(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        await loadProfile();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaveProfileLoading(false);
    }
  };

  const handleUnsaveMessage = async (id: string) => {
    try {
      await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_saved: false }),
      });
      setSavedMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (error) {
      console.error('Error unsaving message:', error);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
      });
      setSavedMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will delete all your data.'
    );
    
    if (!confirmed) return;

    const doubleConfirm = prompt('Type "DELETE" to confirm account deletion:');
    
    if (doubleConfirm !== 'DELETE') {
      alert('Account deletion cancelled');
      return;
    }

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Account deleted successfully');
        router.push('/login');
      } else {
        alert('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout showSidebar={true}>
        <Sidebar isMobileOpen={false} onMobileClose={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-text-secondary">Loading profile...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showSidebar={true}>
      <Sidebar isMobileOpen={false} onMobileClose={() => {}} />
      
      <div className="flex-1 flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
        <Header />
        
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--background)' }}>
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Your Profile
                </h1>
                <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Manage your account settings and preferences
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgba(168, 184, 232, 0.1)',
                  color: 'var(--text-primary)',
                }}
              >
                Back to Chat
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              {(['profile', 'settings', 'saved', 'account'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 font-medium transition-colors capitalize"
                  style={{
                    color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderBottom: activeTab === tab ? '2px solid rgba(168, 184, 232, 0.8)' : '2px solid transparent',
                  }}
                >
                  {tab === 'saved' ? 'Saved Messages' : tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div
                    className="p-6 rounded-2xl"
                    style={{
                      backgroundColor: 'var(--sidebar-bg)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                      Profile Information
                    </h2>

                    <div className="space-y-4">
                      {/* Avatar */}
                      <div className="flex items-center gap-4">
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #A8B8E8 0%, #B8A8E8 100%)',
                            color: 'white',
                          }}
                        >
                          {email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {name || 'User'}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {email}
                          </p>
                        </div>
                      </div>

                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full px-4 py-2 rounded-lg outline-none transition-colors"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        />
                      </div>

                      {/* Email Field (read-only) */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          disabled
                          className="w-full px-4 py-2 rounded-lg outline-none"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            color: 'var(--text-secondary)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            cursor: 'not-allowed',
                          }}
                        />
                        <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Email cannot be changed
                        </p>
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={handleSaveProfile}
                        disabled={saveProfileLoading}
                        className="px-6 py-2 rounded-lg font-medium transition-colors"
                        style={{
                          background: 'linear-gradient(135deg, #A8B8E8 0%, #B8A8E8 100%)',
                          color: 'white',
                          opacity: saveProfileLoading ? 0.6 : 1,
                        }}
                      >
                        {saveProfileLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>

                  {/* Account Stats */}
                  <div
                    className="p-6 rounded-2xl"
                    style={{
                      backgroundColor: 'var(--sidebar-bg)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                      Account Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Member Since</p>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Trial Status</p>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {profile?.trial_end ? 'Active' : 'Expired'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div
                  className="p-6 rounded-2xl space-y-6"
                  style={{
                    backgroundColor: 'var(--sidebar-bg)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    App Settings
                  </h2>

                  {/* Theme Selection */}
                  <div className="pb-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <p className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                      Theme
                    </p>
                    <div className="flex gap-3">
                      {['light', 'dark', 'deep'].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => {
                            document.documentElement.setAttribute('data-theme', theme);
                            localStorage.setItem('theme', theme);
                            setCurrentTheme(theme);
                          }}
                          className="px-4 py-2 rounded-lg font-medium transition-all capitalize"
                          style={{
                            backgroundColor:
                              currentTheme === theme
                                ? 'rgba(168, 184, 232, 0.8)'
                                : 'rgba(255, 255, 255, 0.1)',
                            color:
                              currentTheme === theme
                                ? 'white'
                                : 'var(--text-secondary)',
                            border: currentTheme === theme ? '2px solid rgba(168, 184, 232, 1)' : '2px solid transparent',
                          }}
                        >
                          {theme === 'deep' ? '✨ Deep' : theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Notifications Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          Notifications
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Receive notifications for important updates
                        </p>
                      </div>
                      <button
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        className="w-12 h-6 rounded-full transition-colors relative"
                        style={{
                          backgroundColor: notificationsEnabled ? 'rgba(168, 184, 232, 0.8)' : 'rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5"
                          style={{
                            left: notificationsEnabled ? 'calc(100% - 22px)' : '2px',
                          }}
                        />
                      </button>
                    </div>

                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          Sound Effects
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Play sounds for message notifications
                        </p>
                      </div>
                      <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="w-12 h-6 rounded-full transition-colors relative"
                        style={{
                          backgroundColor: soundEnabled ? 'rgba(168, 184, 232, 0.8)' : 'rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5"
                          style={{
                            left: soundEnabled ? 'calc(100% - 22px)' : '2px',
                          }}
                        />
                      </button>
                    </div>

                    {/* Adaptive Mode Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          Adaptive Responses
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          VERA adapts to your emotional state
                        </p>
                      </div>
                      <button
                        onClick={() => setAdaptiveMode(!adaptiveMode)}
                        className="w-12 h-6 rounded-full transition-colors relative"
                        style={{
                          backgroundColor: adaptiveMode ? 'rgba(168, 184, 232, 0.8)' : 'rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5"
                          style={{
                            left: adaptiveMode ? 'calc(100% - 22px)' : '2px',
                          }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Saved Messages Tab */}
              {activeTab === 'saved' && (
                <div className="space-y-4">
                  {loadingSaved ? (
                    <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                      Loading saved messages...
                    </div>
                  ) : savedMessages.length === 0 ? (
                    <div
                      className="p-12 rounded-2xl text-center"
                      style={{
                        backgroundColor: 'var(--sidebar-bg)',
                        backdropFilter: 'blur(20px)',
                      }}
                    >
                      <svg
                        className="w-16 h-16 mx-auto mb-4 opacity-50"
                        style={{ color: 'var(--text-secondary)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <p style={{ color: 'var(--text-primary)' }}>No saved messages yet</p>
                      <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Click the heart icon on any message to save it
                      </p>
                    </div>
                  ) : (
                    savedMessages.map((message) => (
                      <div
                        key={message.id}
                        className="p-6 rounded-2xl"
                        style={{
                          backgroundColor: 'var(--sidebar-bg)',
                          backdropFilter: 'blur(20px)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="text-xs font-medium px-2 py-1 rounded"
                                style={{
                                  backgroundColor: message.role === 'assistant' ? 'rgba(168, 184, 232, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {message.role === 'assistant' ? 'VERA' : 'You'}
                              </span>
                              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                {new Date(message.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p style={{ color: 'var(--text-primary)' }}>{message.content}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUnsaveMessage(message.id)}
                              className="p-2 rounded-lg transition-colors"
                              style={{
                                color: 'var(--text-secondary)',
                              }}
                              title="Unsave"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(message.id)}
                              className="p-2 rounded-lg transition-colors"
                              style={{
                                color: 'var(--text-secondary)',
                              }}
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  {/* Logout */}
                  <div
                    className="p-6 rounded-2xl"
                    style={{
                      backgroundColor: 'var(--sidebar-bg)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                      Session
                    </h2>
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Sign out of your account on this device
                    </p>
                    <button
                      onClick={handleLogout}
                      className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      style={{
                        backgroundColor: 'rgba(168, 184, 232, 0.2)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div
                    className="p-6 rounded-2xl border"
                    style={{
                      backgroundColor: 'rgba(220, 38, 38, 0.05)',
                      backdropFilter: 'blur(20px)',
                      borderColor: 'rgba(220, 38, 38, 0.2)',
                    }}
                  >
                    <h2 className="text-xl font-semibold mb-4" style={{ color: '#ef4444' }}>
                      Danger Zone
                    </h2>
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      style={{
                        backgroundColor: 'rgba(220, 38, 38, 0.2)',
                        color: '#ef4444',
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
