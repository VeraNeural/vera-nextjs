import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import OpenAI from 'openai';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const message: unknown = body?.message;
    const threadId: unknown = body?.threadId;
    const history: unknown = body?.history;

    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
    }

    if (env.app.debugLogs) {
      logger.debug('Chat message received', { messageLength: message.length });
    }

    // Build messages array for OpenAI
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Add conversation history if provided
    if (Array.isArray(history)) {
      for (const msg of history) {
        if (msg && typeof msg === 'object') {
          const h = msg as Record<string, unknown>;
          if (typeof h.role === 'string' && typeof h.content === 'string') {
            const role = h.role === 'assistant' ? 'assistant' : 'user';
            messages.push({ role, content: h.content });
          }
        }
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        { role: 'system', content: `You are VERA, a compassionate nervous system regulation assistant. You help users with anxiety, stress, and emotional regulation through evidence-based techniques like breathing exercises, grounding techniques, and journaling. Be warm, personable, and therapeutic in your responses.` },
        ...messages,
      ] as OpenAI.Chat.ChatCompletionMessageParam[],
    });

    // Extract text response
    const reply = response.choices[0]?.message?.content || 'I encountered an issue processing your message.';

    if (env.app.debugLogs) {
      logger.debug('Chat response generated', { replyLength: reply.length });
    }

    return NextResponse.json({ reply, threadId }, { status: 200 });
  } catch (err: any) {
    logger.error('Chat handler error', err);
    return NextResponse.json(
      { error: 'internal_error', detail: err?.message ?? 'unknown' },
      { status: 500 }
    );
  }
}
