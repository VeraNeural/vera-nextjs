import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Enforce a single canonical domain in production
const CANONICAL_HOST = 'veraneural.com';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // Skip in development and when already on canonical host
  if (process.env.NODE_ENV !== 'production' || host === CANONICAL_HOST) {
    return NextResponse.next();
  }

  // Redirect every other host (preview URLs, old domains) to the canonical domain
  const url = new URL(request.url);
  url.host = CANONICAL_HOST;
  url.protocol = 'https:';
  return NextResponse.redirect(url, 308);
}

// Don't run for static assets; allow webhook to receive raw host unchanged
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/billing/webhook).*)',
  ],
};
