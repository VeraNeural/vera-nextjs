'use client';

import { useState, ChangeEvent, KeyboardEvent } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMagicLink = async () => {
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

  const handleClose = () => {
    setEmail('');
    setSent(false);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          {sent ? 'Check your email' : 'Sign in to VERA'}
        </h2>

        {sent ? (
          <div className="space-y-4">
            <p className="text-text-secondary">
              We've sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-text-secondary text-sm">
              Click the link in your email to sign in. You can close this window.
            </p>
            <Button onClick={handleClose} fullWidth>
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-text-secondary mb-4">
              Enter your email to receive a magic link. No password needed.
            </p>

            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMagicLink()}
              disabled={loading}
            />

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button
              onClick={handleSendMagicLink}
              disabled={loading || !email}
              fullWidth
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </Button>

            <p className="text-xs text-text-secondary text-center">
              By signing in, you start your 7-day trial with 50 free messages
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
