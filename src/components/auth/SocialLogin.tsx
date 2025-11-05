'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SocialLogin() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const signInWithGoogle = async () => {
    try {
      setLoadingGoogle(true);
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/api/auth/callback`,
          queryParams: {
            // Force account chooser for multi-account users
            prompt: 'select_account',
          },
        },
      });
    } catch (e) {
      console.error('Google OAuth error:', e);
      alert('Unable to start Google sign-in. Please try again.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4">
      <button
        onClick={signInWithGoogle}
        disabled={loadingGoogle}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
        aria-label="Continue with Google"
      >
        <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.957,3.043l5.657-5.657C33.546,6.053,29.027,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.817C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.154,7.957,3.043l5.657-5.657 C33.546,6.053,29.027,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.822-1.977,13.377-5.197l-6.163-5.198C29.22,35.091,26.774,36,24,36 c-5.196,0-9.607-3.317-11.273-7.946l-6.5,5.012C7.545,39.556,15.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.086,5.604 c0.001-0.001,0.002-0.001,0.003-0.002l6.163,5.198C36.882,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        <span>{loadingGoogle ? 'Connecting…' : 'Continue with Google'}</span>
      </button>

      <div className="flex items-center gap-4 my-4">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-white/70 text-sm">or</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>
    </div>
  );
}
