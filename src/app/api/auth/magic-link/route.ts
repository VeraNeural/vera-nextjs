// src/app/api/auth/magic-link/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
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
  const origin = request.nextUrl.origin;

    // Generate OTP token but don't send email (we'll send it ourselves)
    // Kick off Supabase's own email as a safety net (will use Supabase templates)
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Always send the callback to the same origin that issued the request
        emailRedirectTo: `${origin}/api/auth/callback`,
        shouldCreateUser: true,
      },
    });

    const supabaseEmailStarted = !error;
    if (error) {
      console.error('Supabase signInWithOtp error (will try Resend path):', error.message);
    }

    // Try to generate our own branded link via service role (optional)
    let token: string | null = null;
    let type: string | null = null;
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabaseAdmin = createServiceClient();

        if (!supabaseAdmin) {
          console.warn('Missing service client; skipping branded magic-link generation.');
        } else {
          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email,
        });
        if (linkError) throw linkError;
        const actionUrl = new URL(linkData.properties.action_link);
        token = actionUrl.searchParams.get('token');
        type = actionUrl.searchParams.get('type');
        }
      } else {
        console.warn('Missing SUPABASE_SERVICE_ROLE_KEY; falling back to Supabase email.');
      }
    } catch (e) {
      console.error('Failed to generate magic link (admin):', e);
    }

    // If we successfully generated a token, try to send branded email via Resend
    const callbackUrl = token && type
      ? `${origin}/api/auth/callback?token_hash=${token}&type=${type}`
      : null;

    // Send beautiful branded email via Resend
    let resendOk = false;
    if (callbackUrl && process.env.RESEND_API_KEY) {
      const emailResult = await resend.emails.send({
      from: 'VERA <support@veraneural.com>',
      to: email,
      subject: 'Your VERA Magic Link ✨',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #8B5CF6; margin-bottom: 16px; font-size: 28px; font-weight: 600;">Welcome to VERA</h2>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
            Your AI Co-Regulator is ready to support your nervous system regulation journey.
          </p>

          <p style="color: #374151; font-size: 16px; margin-bottom: 32px;">
            Click the button below to begin your 48-hour free trial:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${callbackUrl}" 
               style="background: linear-gradient(135deg, #8B5CF6, #3B82F6); 
                      color: white; 
                      padding: 16px 40px; 
                      text-decoration: none; 
                      border-radius: 12px; 
                      font-weight: 600;
                      font-size: 16px;
                      display: inline-block;">
              ✨ Begin Your Journey
            </a>
          </div>

          <p style="color: #6B7280; font-size: 14px; margin-top: 32px; line-height: 1.6;">
            This link expires in 60 minutes. If you didn't request this, you can safely ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;">

          <p style="color: #9CA3AF; font-size: 12px; line-height: 1.5;">
            VERA is not a medical device and does not replace therapy. She complements your care.
          </p>
        </div>
      `,
      });
      if (emailResult.error) {
        console.error('Resend email error:', emailResult.error);
      } else {
        resendOk = true;
        console.log('Magic link email sent via Resend:', emailResult.data);
      }
    }

    // Final result decision: if Resend worked, success; otherwise if Supabase email started, success; else error
    if (resendOk || supabaseEmailStarted) {
      return NextResponse.json({ success: true, via: resendOk ? 'resend' : 'supabase' });
    }

    return NextResponse.json({ error: 'Unable to send magic link' }, { status: 500 });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
