// src/app/api/health/openai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'missing_api_key' }, { status: 200 });
  }

  const light = new URL(request.url).searchParams.get('light') === 'true';
  const model = 'gpt-4o-mini';

  try {
    const openai = new OpenAI({ apiKey });

    if (light) {
      // Light touch: attempt a trivial listing of models (cheap)
      try {
        const models = await openai.models.list();
        const found = models.data.some((m) => m.id === model);
        return NextResponse.json({ ok: true, mode: 'models.list', modelAvailable: found });
      } catch (error: any) {
        // Fallback to micro generation if listing is restricted
        console.warn('Model listing failed, falling back to minimal generation', error.message);
      }
    }

    const completion = await openai.chat.completions.create({
      model,
      max_tokens: 1,
      messages: [{ role: 'user', content: 'ping' }],
      temperature: 0,
    });

    const choice = completion.choices?.[0]?.finish_reason || 'unknown';

    return NextResponse.json({
      ok: true,
      mode: 'generate',
      finish: choice,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || 'openai_check_failed' },
      { status: 500 }
    );
  }
}
