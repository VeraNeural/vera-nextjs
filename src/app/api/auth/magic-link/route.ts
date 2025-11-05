// src/app/api/auth/magic-link/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Generate magic link with Supabase
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error('Supabase auth error:', error.message, error);
      return NextResponse.json(
        { error: error.message || 'Failed to send magic link' },
        { status: 500 }
      );
    }

    // Note: Supabase sends the email automatically with their template
    // To customize, go to Supabase Dashboard → Auth → Email Templates
    // Or disable Supabase emails and use Resend by calling signInWithOtp with { shouldCreateUser: false }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
