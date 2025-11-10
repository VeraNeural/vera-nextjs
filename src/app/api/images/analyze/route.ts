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

    // Determine media type for Claude
    let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';
    if (imageFile.type === 'image/png') mediaType = 'image/png';
    else if (imageFile.type === 'image/gif') mediaType = 'image/gif';
    else if (imageFile.type === 'image/webp') mediaType = 'image/webp';

    // Call Claude API with vision
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: context || 'Please analyze this image and describe what you see. Consider emotional, psychological, or therapeutic context if relevant to our conversation.',
            },
          ],
        },
      ],
    });

    clearTimeout(timeoutId);

    // Extract text response
    const textContent = response.content.find((block) => block.type === 'text');
    const analysis = textContent && 'text' in textContent ? textContent.text : '';

    return NextResponse.json({
      ok: true,
      analysis,
      fileName: imageFile.name,
      fileSize: imageFile.size,
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    const message = error instanceof Error ? error.message : 'Failed to analyze image';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
