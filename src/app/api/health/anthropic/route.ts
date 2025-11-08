// src/app/api/health/anthropic/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function GET(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'missing_api_key' }, { status: 500 });
  }

  const light = new URL(request.url).searchParams.get('light') === 'true';
  const model = 'claude-3-5-sonnet-20240620';

  try {
    const anthropic = new Anthropic({ apiKey });

    // Check if token counting is available (only on newer SDK versions)
    if (light && (anthropic.messages as any)?.countTokens) {
      // Use a very light token count check
      const result = await (anthropic.messages as any).countTokens({
        model,
        messages: [{ role: 'user', content: 'ping' }],
      });

      return NextResponse.json({
        ok: true,
        mode: 'countTokens',
        tokens: result?.input_tokens ?? null,
        model,
      });
    }

    // Fallback: minimal generation (low cost)
    const res = await anthropic.messages.create({
      model,
      max_tokens: 1,
      messages: [{ role: 'user', content: [{ type: 'text', text: 'ping' }] }],
    });

    const contentType = res.content?.[0]?.type || null;

    return NextResponse.json({
      ok: true,
      mode: 'generate',
      contentType,
      model,
    });
  } catch (e: any) {
    // Return a proper error response with status code
    return NextResponse.json(
      { ok: false, error: e.message || 'anthropic_check_failed' },
      { status: 500 }
    );
  }
}
