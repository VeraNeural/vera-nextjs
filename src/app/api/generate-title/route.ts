// src/app/api/generate-title/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userMessage, assistantResponse } = await request.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',  // ✅ Supports json_object and is faster/cheaper
      messages: [
        {
          role: 'system',
          content: `You are a title generator for therapy conversation threads. Generate a short, emotionally resonant title (2-4 words) that captures the essence of the conversation. Focus on the emotional state or main topic. Examples:
- "Feeling overwhelmed"
- "Morning anxiety"
- "Grounding practice"
- "Processing grief"
- "Breathing exercise"
- "Understanding triggers"

Also generate a brief preview (60 characters max) of the user's main concern.

Respond in JSON format: {"title": "...", "preview": "..."}`,
        },
        {
          role: 'user',
          content: `User said: "${userMessage}"\n\nVERA responded: "${assistantResponse.substring(0, 200)}..."`,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
      response_format: { type: 'json_object' },
    });

    const result = completion.choices[0].message.content;
    if (result) {
      const parsed = JSON.parse(result);
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ 
      title: 'New Conversation',
      preview: userMessage.substring(0, 60)
    });
  } catch (error) {
    console.error('Error generating title:', error);
    return NextResponse.json(
      { 
        title: 'New Conversation',
        preview: 'Recent conversation'
      },
      { status: 200 }
    );
  }
}
