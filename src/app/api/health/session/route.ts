// src/app/api/health/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json(
        { ok: false, authenticated: false, error: error.message },
        { status: 200 }
      );
    }

    return NextResponse.json({
      ok: true,
      authenticated: !!user,
      user: user ? { id: user.id, email: user.email } : null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || 'session_check_failed' },
      { status: 200 }
    );
  }
}
