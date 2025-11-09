// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase/service';
import { cookies } from 'next/headers';

// Ensure this route is always dynamic so auth cookies are written on the response
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // Check for both token_hash (new) and code (PKCE flow)
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const code = requestUrl.searchParams.get('code');

  console.log('🔐 Auth callback triggered');
  console.log('Token hash:', token_hash ? 'present' : 'missing');
  console.log('Type:', type);
  console.log('Code:', code ? 'present' : 'missing');

  // Use @supabase/ssr to manage cookies automatically
  const cookieStore = await cookies();
  let response = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
            response.cookies.set(name, value, options);
          } catch (error) {
            console.error('Cookie set error:', error);
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
            response.cookies.set(name, '', options);
          } catch (error) {
            console.error('Cookie remove error:', error);
          }
        },
      },
    }
  );

  let userData = null;
  let sessionData = null;

  // Handle magic link (token_hash)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });
    
    if (error) {
      console.error('❌ Magic link verification error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/signup?error=auth_failed`);
    }
    
    userData = data?.user;
    sessionData = data?.session;
    console.log('✅ Magic link verified for user:', userData?.email);
    console.log('Session created:', sessionData ? 'YES' : 'NO');
    
    // Explicitly set the session to ensure cookies are written
    if (sessionData) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      });
      
      if (sessionError) {
        console.error('❌ Failed to set session:', sessionError);
      } else {
        console.log('✅ Session explicitly set');
      }
    }
  }
  // Handle PKCE flow (code)
  else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('❌ Code exchange error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/signup?error=auth_failed`);
    }
    
    userData = data?.user;
    sessionData = data?.session;
    console.log('✅ Code exchanged for user:', userData?.email);
    console.log('Session created:', sessionData ? 'YES' : 'NO');

    // CRITICAL: Explicitly set the session for OAuth to ensure cookies are written
    if (sessionData) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      });
      
      if (sessionError) {
        console.error('❌ Failed to set OAuth session:', sessionError);
      } else {
        console.log('✅ OAuth session explicitly set');
      }
    }
  }
  else {
    console.error('❌ No auth parameters found');
    return NextResponse.redirect(`${requestUrl.origin}/auth/signup?error=missing_params`);
  }

  // Create user in database if needed
  if (userData) {
    const supabaseAdmin = createServiceClient();
    
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userData.id)
      .single();

    if (!existingUser) {
      console.log('➕ Creating new user entry with 48hr trial...');
      const { error: insertError } = await supabaseAdmin.from('users').insert({
        id: userData.id,
        email: userData.email,
        subscription_status: 'trialing',
        trial_start: new Date().toISOString(),
        trial_end: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      });

      if (insertError) {
        console.error('❌ Failed to create user entry:', insertError);
      } else {
        console.log('✅ User entry created');
      }
    }
  }

  // Verify session was set before redirecting
  if (sessionData) {
    console.log('✅ Session established, safe to redirect');
  } else {
    console.error('⚠️ No session data, but proceeding with redirect');
  }

  console.log('🔄 Redirecting to chat');
  response = NextResponse.redirect(`${requestUrl.origin}/chat-exact`);
  
  // Re-apply cookies to the redirect response
  const allCookies = cookieStore.getAll();
  allCookies.forEach(({ name, value }) => {
    response.cookies.set(name, value);
  });
  
  return response;
}
