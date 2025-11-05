// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');

  console.log('🔐 Auth callback triggered, type:', type, 'token_hash:', token_hash ? 'present' : 'missing');

  if (token_hash && type) {
    const supabase = await createClient();
    
    // Verify the OTP token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });
    
    if (error) {
      console.error('❌ Auth callback error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/signup?error=auth_failed`);
    }

    console.log('✅ Session created for user:', data?.user?.email);

    if (data?.user) {
      // Use service client to check/create user
      const supabaseAdmin = createServiceClient();
      
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      console.log('🔍 Existing user check:', existingUser ? 'found' : 'not found', checkError ? `(error: ${checkError.message})` : '');

      if (!existingUser) {
        console.log('➕ Creating new user entry with 48hr trial...');
        const { data: newUser, error: insertError } = await supabaseAdmin.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          subscription_status: 'trialing',
          trial_start: new Date().toISOString(),
          trial_end: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        }).select().single();

        if (insertError) {
          console.error('❌ Failed to create user entry:', insertError);
        } else {
          console.log('✅ User entry created:', newUser);
        }
      }
    }
  }

  // Redirect to home page after successful authentication
  console.log('🔄 Redirecting to home page');
  return NextResponse.redirect(`${requestUrl.origin}/`);
}
