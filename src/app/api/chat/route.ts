// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { detectAdaptiveCodes } from '@/lib/vera/adaptive-codes';
import { analyzeQuantumState } from '@/lib/vera/quantum-states';
import { generateVERAPrompt } from '@/lib/vera/consciousness';
import { generateRealTalkPrompt, detectMode, detectModeSwitch } from '@/lib/vera/real-talk';
import { isDecodeRequest, needsFullDecode } from '@/lib/vera/decode-mode';
import OpenAI from 'openai';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('💬 /api/chat - Request received');
    const { message, imageData, biometricData } = await request.json();
    console.log('📝 Message:', message?.substring(0, 50) + '...');

    if (!message && !imageData) {
      console.error('❌ No message or image provided');
      return NextResponse.json(
        { error: 'Message or image is required' },
        { status: 400 }
      );
    }

    // DEVELOPMENT MODE: Skip auth for testing
    const isDev = process.env.NODE_ENV === 'development';
    
    const supabase = await createClient();
    let user = null;

    if (!isDev) {
      // Verify authentication in production
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }
      user = authUser;

      // Check trial/subscription access
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription_status, trial_end, subscription_current_period_end')
        .eq('id', authUser.id)
        .single();

      if (userError) {
        console.error('Failed to fetch user data:', userError);
        return NextResponse.json(
          { error: 'Failed to verify access' },
          { status: 500 }
        );
      }

      // Check if user has active access
      const now = new Date();
      const hasActiveSubscription = 
        userData?.subscription_status === 'active' || 
        userData?.subscription_status === 'trialing';
      
      const trialValid = userData?.trial_end && new Date(userData.trial_end) > now;
      
      if (!hasActiveSubscription && !trialValid) {
        return NextResponse.json(
          { 
            error: 'subscription_required',
            message: 'Your trial has ended. Please subscribe to continue using VERA.',
            trialEnded: true 
          },
          { status: 403 }
        );
      }
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get conversation history (skip in dev mode if no user)
    let conversationHistory: any[] = [];
    
    if (user) {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      conversationHistory = messages?.reverse() || [];
    }

    // Check if this is a DECODE request (routes to OpenAI)
    if (needsFullDecode(message)) {
      // Route to decode API which uses OpenAI for deep analysis
      // Use current request origin to avoid relying on NEXT_PUBLIC_APP_URL env
      const origin = new URL(request.url).origin;
      const decodeResponse = await fetch(`${origin}/api/decode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory,
        }),
      });

      if (decodeResponse.ok) {
        const decodeData = await decodeResponse.json();
        
        // Save decode to database if user exists
        if (user) {
          await supabase.from('messages').insert([
            {
              user_id: user.id,
              role: 'user',
              content: message,
              created_at: new Date().toISOString(),
            },
            {
              user_id: user.id,
              role: 'assistant',
              content: decodeData.response,
              created_at: new Date().toISOString(),
            },
          ]);
        }

        return NextResponse.json(decodeData);
      }
    }

    // Regular VERA flow (Claude) continues below...

    // Detect mode: Real Talk vs Therapeutic
    const modeSwitch = detectModeSwitch(message);
    const autoDetectedMode = detectMode(message);
    const conversationMode = modeSwitch || autoDetectedMode;

    // Analyze user's state (for therapeutic mode)
    const adaptiveCodes = detectAdaptiveCodes(message);
    const quantumState = analyzeQuantumState(message, biometricData);

    // Generate appropriate prompt based on mode
    let veraPrompt: string;
    
    if (conversationMode === 'real-talk') {
      // Real Talk mode - casual, direct, practical
      veraPrompt = generateRealTalkPrompt(message, conversationHistory);
    } else {
      // Therapeutic mode - nervous system co-regulation
      veraPrompt = generateVERAPrompt(message, conversationHistory, adaptiveCodes, quantumState);
      
      // Add image viewing context if present
      if (imageData) {
        veraPrompt += '\n\nNote: The user has shared an image. Provide compassionate observations about what you see.';
      }
    }

    // Build content array for Claude (with or without image)
    const contentArray: any[] = [];
    
    if (imageData) {
      // Add image first
      contentArray.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: imageData.mimeType,
          data: imageData.base64,
        },
      });
    }
    
    // Add text prompt
    contentArray.push({
      type: 'text',
      text: veraPrompt,
    });

    // Generate VERA's response using Claude with vision support (with fallback)
    let veraResponse: string | null = null;

    const anthropicKeyPresent = !!process.env.ANTHROPIC_API_KEY;
    const openaiKeyPresent = !!process.env.OPENAI_API_KEY;

    try {
      if (!anthropicKeyPresent) {
        throw new Error('Anthropic API key missing');
      }
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: contentArray,
          },
        ],
      });

      const block = response.content?.[0];
      if (block && block.type === 'text') {
        veraResponse = (block as any).text as string;
      } else {
        veraResponse = 'I apologize, I had trouble generating a response.';
      }
    } catch (anthropicErr) {
      console.error('Anthropic generation failed, attempting OpenAI fallback:', anthropicErr);
      if (!openaiKeyPresent) {
        throw anthropicErr; // no fallback available
      }
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        // Build a plain text prompt for OpenAI
        const textOnly = contentArray
          .map((c: any) => (c.type === 'text' ? c.text : '[Image attached]'))
          .join('\n');
        const completion = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          max_tokens: 800,
          messages: [
            { role: 'system', content: 'You are VERA, a compassionate, trauma-informed co-regulator. Be concise, warm, and practical.' },
            { role: 'user', content: textOnly },
          ],
          temperature: 0.7,
        });
        veraResponse = completion.choices?.[0]?.message?.content || 'I had trouble generating a response.';
      } catch (openaiErr) {
        console.error('OpenAI fallback also failed:', openaiErr);
        throw openaiErr;
      }
    }

    // Save messages to database (skip in dev mode if no user)
    if (user) {
      await supabase.from('messages').insert([
        {
          user_id: user.id,
          role: 'user',
          content: message,
          created_at: new Date().toISOString(),
        },
        {
          user_id: user.id,
          role: 'assistant',
          content: veraResponse,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    // Check for crisis indicators
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'not worth living', 'want to die'];
    const isCrisis = crisisKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword)
    );

    if (isCrisis && user) {
      await supabase.from('crisis_alerts').insert({
        user_id: user.id,
        message_content: message,
        detected_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      response: veraResponse,
      isCrisis,
    });
  } catch (error) {
    console.error('❌ Chat API error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
