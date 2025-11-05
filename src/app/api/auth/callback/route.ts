// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

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

  const supabase = await createClient();
  let userData = null;

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
    console.log('✅ Magic link verified for user:', userData?.email);
  }
  // Handle PKCE flow (code)
  else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('❌ Code exchange error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/signup?error=auth_failed`);
    }
    
    userData = data?.user;
    console.log('✅ Code exchanged for user:', userData?.email);
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

  console.log('🔄 Redirecting to home page');
  return NextResponse.redirect(`${requestUrl.origin}/`);
}
