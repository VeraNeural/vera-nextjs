// src/app/api/health/supabase/route.ts
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET() {
  try {
    const svc = createServiceClient();

    if (!svc) {
      return NextResponse.json(
        { ok: false, error: 'service_role_key_missing' },
        { status: 200 }
      );
    }

    // Perform a lightweight head/count query that bypasses RLS
    const { error, count } = await svc
      .from('users')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { ok: true, reachable: true, sampleCount: count ?? null },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || 'supabase_check_failed' },
      { status: 200 }
    );
  }
}
