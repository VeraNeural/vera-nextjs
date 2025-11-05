import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Canonical domain enforcement (configurable via env)
// Set APP_CANONICAL_HOST to your desired host (e.g., 'app.veraneural.com' or 'veraneural.com')
// Set APP_ENFORCE_CANONICAL to 'true' to enable redirects in production
const CANONICAL_HOST = (process.env.APP_CANONICAL_HOST || '').toLowerCase();
const ENFORCE = process.env.APP_ENFORCE_CANONICAL === 'true';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // Skip when not enforcing, in development, or no canonical set
  if (!ENFORCE || process.env.NODE_ENV !== 'production' || !CANONICAL_HOST) {
    return NextResponse.next();
  }

  // Already on canonical host
  if (host.toLowerCase() === CANONICAL_HOST) {
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
    '/((?!_next/static|_next/image|favicon.ico|api/billing/webhook|api/stripe/webhook).*)',
  ],
};
