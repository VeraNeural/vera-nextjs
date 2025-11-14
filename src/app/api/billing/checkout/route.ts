import { NextRequest, NextResponse } from 'next/server';

// Legacy checkout shim: forward POST to the new Stripe checkout endpoint.
// 307 preserves method and body.
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const url = new URL('/api/stripe/create-checkout', req.url);
  return NextResponse.redirect(url, 307);
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ error: 'use POST /api/stripe/create-checkout' }, { status: 405 });
}
