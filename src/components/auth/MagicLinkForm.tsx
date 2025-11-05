'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function MagicLinkForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link');
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-orb-purple/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-orb-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-text-primary">
            Check your email
          </h2>
          
          <p className="text-text-secondary">
            We've sent a magic link to <strong className="text-text-primary">{email}</strong>
          </p>
          
          <p className="text-sm text-text-secondary">
            Click the link in your email to sign in. The link will expire in 1 hour.
          </p>

          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
              fullWidth
            >
              Use a different email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-text-primary">
          Welcome to VERA
        </h2>
        <p className="text-text-secondary">
          Enter your email to receive a magic link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !email}
          fullWidth
        >
          {loading ? 'Sending...' : 'Send magic link'}
        </Button>

        <p className="text-xs text-text-secondary text-center">
          By signing in, you start your 48-hour free trial with full access to VERA
        </p>
      </form>
    </div>
  );
}
