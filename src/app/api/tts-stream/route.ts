// src/app/api/tts-stream/route.ts
// Streaming TTS with ElevenLabs - returns audio chunks as they arrive
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAccessStatus } from '@/lib/access';

// Strip markdown formatting for cleaner TTS
function stripMarkdown(text: string): string {
  return text
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*>\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    // Require auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Enforce subscription/trial access
    const access = await getAccessStatus(supabase as any, user.id);
    if (!access.allowed) {
      return new Response(
        JSON.stringify({
          error: 'subscription_required',
          message: 'Your trial has ended. Please subscribe to use text-to-speech.',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { text } = await request.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanText = stripMarkdown(text);

    console.log('🎙️ Streaming TTS Request:', {
      textLength: cleanText.length,
      voiceId: process.env.ELEVENLABS_VOICE_ID,
    });

    // Use streaming endpoint from ElevenLabs
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorData = await elevenLabsResponse.text();
      console.error('❌ ElevenLabs Streaming API error:', {
        status: elevenLabsResponse.status,
        error: errorData,
      });
      throw new Error(`ElevenLabs error: ${elevenLabsResponse.status}`);
    }

    // Stream the response directly to client
    return new Response(elevenLabsResponse.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('TTS streaming error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate speech' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
