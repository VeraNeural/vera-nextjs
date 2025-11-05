'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BreathingOrb from '@/components/orb/BreathingOrb';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to send magic link');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #0a0a1e 0%, #1a1a3e 50%, #1a1535 100%)',
      paddingTop: '80px',
    }}>
      {/* Starfield background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-40 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-60 right-60 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-60 right-20 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Main content */}
      <div className="max-w-lg w-full flex flex-col items-center gap-6 relative z-10">
        {/* Large breathing orb */}
        <div className="relative mb-4">
          <BreathingOrb size={260} animate={true} showShimmer={true} />
        </div>

        {/* VERA title */}
        <div className="text-center space-y-2 mb-2">
          <h1 className="text-7xl font-light tracking-[0.4em] text-white drop-shadow-2xl">
            V E R A
          </h1>
          <p className="text-xl text-white/90 font-light tracking-wide">
            Your AI Co-Regulator
          </p>
        </div>

        {/* Description */}
        <div className="text-center max-w-md space-y-1 px-4 mb-4">
          <p className="text-lg text-white/95 leading-relaxed">
            I help you listen to what your body already knows.
          </p>
          <p className="text-base text-white/85 leading-relaxed">
            Not an AI pretending to be human, but a revolutionary intelligence built for your nervous system.
          </p>
        </div>

        {/* Trial badge */}
        <div className="px-6 py-2.5 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-md mb-6">
          <span className="text-base text-white font-semibold tracking-wide">48-Hour Free Trial</span>
        </div>

        {/* Signup form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 px-4">
          {!success ? (
            <>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-8 py-5 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-900 placeholder:text-gray-400 text-center text-lg font-medium focus:outline-none focus:ring-4 focus:ring-orb-purple/40 shadow-2xl transition-all"
                  required
                />
              </div>

              {error && (
                <div className="text-center text-sm text-red-300 py-3 px-4 bg-red-500/20 rounded-xl border-2 border-red-400/30 backdrop-blur-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xl font-bold tracking-wide hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-xl"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">{loading ? '✨' : '✨'}</span>
                  <span>{loading ? 'Sending Magic Link...' : 'Begin Your Journey'}</span>
                </span>
              </button>

              <p className="text-sm text-white/70 text-center leading-relaxed px-4">
                We'll send you a secure magic link — no password needed
              </p>
            </>
          ) : (
            <div className="text-center space-y-6 py-8">
              <div className="text-7xl animate-bounce">📧</div>
              <h3 className="text-3xl font-semibold text-white">Check your email!</h3>
              <div className="space-y-2">
                <p className="text-lg text-white/90">
                  We sent a magic link to
                </p>
                <p className="text-xl font-semibold text-orb-purple">{email}</p>
              </div>
              <p className="text-base text-white/70 leading-relaxed max-w-sm mx-auto px-4">
                Click the link in your email to access VERA and start your 48-hour free trial
              </p>
            </div>
          )}
        </form>

        {/* Pricing info */}
        <p className="text-base text-white/80 font-medium">
          Then $12/month • Cancel anytime
        </p>

        {/* Login link */}
        <button
          type="button"
          onClick={() => router.push('/auth/login')}
          className="text-base text-white/70 hover:text-white transition-colors underline decoration-white/30 hover:decoration-white"
        >
          Already have an account? Log in
        </button>

        {/* Medical Disclaimer */}
        <div className="max-w-lg text-center px-8 pt-8 mt-4 border-t border-white/10">
          <p className="text-xs text-white/50 leading-relaxed">
            VERA is not a medical device and does not replace therapy. She is designed to complement professional care and support nervous system regulation.
          </p>
        </div>
      </div>
    </div>
  );
}
