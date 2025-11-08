// src/app/api/trial/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // ALWAYS use real database data, even in development
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from('users')
      .select('trial_end, subscription_status')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const trialEnd = new Date(userData.trial_end);
    const trialActive = trialEnd > now;
    const hoursRemaining = trialActive
      ? Math.floor((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60))
      : 0;

    return NextResponse.json({
      active: trialActive,
      endsAt: userData.trial_end,
      hoursRemaining,
      hasSubscription: userData.subscription_status === 'active',
    });
  } catch (error) {
    console.error('Trial check error:', error);
    return NextResponse.json(
      { error: 'Failed to check trial' },
      { status: 500 }
    );
  }
}
