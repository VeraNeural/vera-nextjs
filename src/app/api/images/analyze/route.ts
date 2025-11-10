import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const context = formData.get('context') as string || '';

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 20MB)
    if (imageFile.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image too large (max 20MB)' },
        { status: 400 }
      );
    }

    // Validate MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validMimes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Unsupported image format' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Prepare OpenAI GPT-4.1 vision API payload
    const imageUrl = `data:${imageFile.type};base64,${base64}`;
    const messages = [
      {
        role: 'system',
        content: 'You are VERA, a nervous system co-regulator powered by OpenAI GPT-4.1. Analyze the image and respond with emotional, psychological, and therapeutic insight. Never break character.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: context || 'Please analyze this image and describe what you see. Consider emotional, psychological, or therapeutic context if relevant to our conversation.',
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl },
          },
        ],
      },
    ];

    // Call OpenAI GPT-4.1 vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      max_tokens: 1024,
      messages: messages as any,
      temperature: 0.7,
    });

    // Extract the response text
    const resultText = response.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      result: resultText,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Unknown error' }, { status: 500 });
  }
}
