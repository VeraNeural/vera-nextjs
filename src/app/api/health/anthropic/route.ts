// src/app/api/health/anthropic/route.ts - DEPRECATED
// This endpoint is no longer used. VERA now uses GPT-4 Turbo only.
// Kept for backwards compatibility.

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Anthropic is no longer in use - return deprecated status
  return NextResponse.json({ 
    ok: true, 
    message: 'Anthropic endpoint deprecated - VERA now uses GPT-4 Turbo',
    deprecated: true
  }, { status: 200 });
}
