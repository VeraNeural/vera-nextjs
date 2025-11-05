// src/app/api/health/resend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'missing_api_key' });
  }
  const light = new URL(request.url).searchParams.get('light') === 'true';
  try {
    const resend = new Resend(apiKey);
    if (light) {
      // Light: just instantiate client and return ok
      return NextResponse.json({ ok: true, mode: 'light' });
    }
    // Slightly heavier: list domains (no emails sent)
    const domains = await resend.domains.list();
    return NextResponse.json({ ok: true, domains: (domains as any)?.data?.length ?? null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'resend_check_failed' }, { status: 200 });
  }
}
