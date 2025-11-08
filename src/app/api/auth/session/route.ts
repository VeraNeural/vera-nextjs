// src/app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    // Get user data from database
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    // Check trial status
    const now = new Date();
    const trialEnd = new Date(userData.trial_end);
    const trialActive = trialEnd > now;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: userData.id,
        email: userData.email,
        createdAt: userData.created_at,
      },
      trial: {
        active: trialActive,
        endsAt: userData.trial_end,
        hoursRemaining: trialActive
          ? Math.floor((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60))
          : 0,
      },
      subscription: {
        status: userData.subscription_status || 'none',
        plan: userData.subscription_plan || null,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}