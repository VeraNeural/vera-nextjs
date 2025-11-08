// Legacy redirector: forward any calls here to the canonical /api/auth/callback
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const redirectTo = `${url.origin}/api/auth/callback${url.search}`;
  return NextResponse.redirect(redirectTo);
}