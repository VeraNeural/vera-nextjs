// src/app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const origin = new URL(request.url).origin;

    async function check(path: string) {
      try {
        const res = await fetch(`${origin}${path}`);
        const ok = res.ok;
        let body: any = null;
        try { body = await res.json(); } catch {}
        return { ok, status: res.status, body };
      } catch (e: any) {
        return { ok: false, status: 0, error: e?.message || 'fetch_failed' };
      }
    }

    const [config, session, supabase, anthropic, openai, resend] = await Promise.all([
      check('/api/health/config'),
      check('/api/health/session'),
      check('/api/health/supabase'),
      check('/api/health/anthropic?light=true'),
      check('/api/health/openai?light=true'),
      check('/api/health/resend?light=true'),
    ]);

    return NextResponse.json({
      ok: config.ok && supabase.ok && anthropic.ok && openai.ok && resend.ok,
      origin,
      checks: { config, session, supabase, anthropic, openai, resend },
    });
  } catch (error) {
    console.error('Health summary error:', error);
    return NextResponse.json({ ok: false, error: 'health_summary_failed' }, { status: 500 });
  }
}
