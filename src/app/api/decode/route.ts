// src/app/api/decode/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { detectAdaptiveCodes } from '@/lib/vera/adaptive-codes';
import { analyzeQuantumState } from '@/lib/vera/quantum-states';
import { generateDecodePrompt } from '@/lib/vera/decode-mode';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Analyze the user's state
    const adaptiveCodes = detectAdaptiveCodes(message);
    const quantumState = analyzeQuantumState(message);

    // Generate the decode prompt
    const decodePrompt = generateDecodePrompt(
      message,
      conversationHistory || [],
      adaptiveCodes,
      quantumState
    );

    // Use OpenAI for deep analysis (stable, widely available model)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are VERA in DECODE MODE - a nervous system pattern analysis expert.',
        },
        {
          role: 'user',
          content: decodePrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const decodeResponse = completion.choices[0]?.message?.content || 
      'I had trouble generating the decode analysis.';

    return NextResponse.json({
      response: decodeResponse,
      mode: 'decode',
      adaptiveCodes,
      quantumState,
    });
  } catch (error) {
    console.error('Decode error:', error);
    return NextResponse.json(
      { error: 'Failed to process decode request' },
      { status: 500 }
    );
  }
}
