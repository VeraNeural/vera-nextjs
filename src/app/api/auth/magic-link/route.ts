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

    // Generate magic link
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      },
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return NextResponse.json(
        { error: 'Failed to send magic link' },
        { status: 500 }
      );
    }

    // Send email via Resend
    await resend.emails.send({
      from: 'VERA <noreply@yourdomain.com>',
      to: email,
      subject: 'Your VERA Magic Link',
      html: `
        <h2>Welcome to VERA</h2>
        <p>Click the link below to sign in:</p>
        <p><a href="${data}">Sign in to VERA</a></p>
        <p>This link expires in 60 minutes.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
