import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { getAccessStatus } from '@/lib/access';

export const dynamic = 'force-dynamic';

const IMAGE_PREFIX = 'image/';
const SUPPORTED_DOC_TYPES = ['application/pdf'];
const DEFAULT_MODEL = 'gpt-4o-mini';
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;

type RateBucket = {
  count: number;
  resetAt: number;
};

const rateBuckets = new Map<string, RateBucket>();

function checkRateLimit(userId: string) {
  const now = Date.now();
  const bucket = rateBuckets.get(userId);

  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.max(0, Math.ceil((bucket.resetAt - now) / 1000)) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'missing_openai_api_key' },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const access = await getAccessStatus(supabase as any, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: 'subscription_required',
          message: 'Upgrade required to run document analysis.',
          trialEnded: access.trialEnded,
        },
        { status: 403 }
      );
    }

    const rateStatus = checkRateLimit(user.id);
    if (!rateStatus.allowed) {
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: 'Too many analyze requests. Please try again shortly.',
          retryAfterSeconds: rateStatus.retryAfter,
        },
        {
          status: 429,
          headers: rateStatus.retryAfter
            ? { 'Retry-After': String(rateStatus.retryAfter) }
            : undefined,
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'no_file_uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || '';
    const openai = new OpenAI({ apiKey });

    if (mimeType.startsWith(IMAGE_PREFIX)) {
      const analysis = await analyzeImage(openai, buffer, mimeType, file.name);
      return NextResponse.json({ type: 'image', analysis });
    }

    if (SUPPORTED_DOC_TYPES.includes(mimeType)) {
      const analysis = await analyzePdf(openai, buffer, file.name);
      return NextResponse.json({ type: 'document', analysis });
    }

    return NextResponse.json(
      {
        error: 'unsupported_file_type',
        supported: [IMAGE_PREFIX + '*', ...SUPPORTED_DOC_TYPES],
      },
      { status: 415 }
    );
  } catch (error: any) {
    console.error('Analyze endpoint failure:', error);
    return NextResponse.json(
      { error: 'analysis_failed', message: error?.message || 'unknown_error' },
      { status: 500 }
    );
  }
}

async function analyzeImage(openai: OpenAI, buffer: Buffer, mimeType: string, fileName: string) {
  const base64 = buffer.toString('base64');

  const completion = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are VERA, a trauma-informed somatic companion. Analyze this image (${fileName}) and describe key emotional or situational cues that could support a therapeutic conversation. Respond with:
- A short summary (2-3 sentences)
- Notable emotional/somatic signals
- Suggestions for compassionate follow-up questions`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
            },
          },
        ],
      },
    ],
  });

  const text = completion.choices[0]?.message?.content || 'No analysis available.';

  return {
    summary: text,
    raw: completion,
  };
}

async function analyzePdf(openai: OpenAI, buffer: Buffer, fileName: string) {
  const pdfParseModule = await import('pdf-parse');
  const pdfParse = (pdfParseModule as any).default || pdfParseModule;
  const parsed = await pdfParse(buffer);
  const text = (parsed.text || '').trim();

  if (!text) {
    return {
      summary: 'The PDF did not contain extractable text. Please provide a text-based document.',
      wordCount: 0,
    };
  }

  const MAX_CHARS = 12000;
  const truncated = text.slice(0, MAX_CHARS);

  const prompt = `You are VERA, a trauma-informed somatic companion. Summarize the uploaded PDF (${fileName}).

Focus on:
- Core themes and emotional currents
- Notable somatic cues or regulation opportunities
- 2 follow-up prompts VERA could ask.

The extracted text (truncated if necessary) is below:
"""
${truncated}
"""`;

  const completion = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
        ],
      },
    ],
  });

  const summary = completion.choices[0]?.message?.content || 'Failed to generate summary.';

  return {
    summary,
    wordCount: text.split(/\s+/).length,
    truncated: text.length > MAX_CHARS,
  };
}
