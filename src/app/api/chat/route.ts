// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { detectAdaptiveCodes } from '@/lib/vera/adaptive-codes';
import { calculateQuantumState } from '@/lib/vera/quantum-states';
import { generateRealTalkPrompt, detectMode, detectModeSwitch } from '@/lib/vera/real-talk';
import { analyzeDecodeRequest, generateDecodePrompt } from '@/lib/vera/decode-mode';
import OpenAI from 'openai';

// Ensure this route is always dynamic (not cached)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * VERA SYSTEM PROMPT FOR GPT-4 API
 * Defines VERA's absolute identity, behavioral rules, and regulatory approach
 */
const VERA_SYSTEM_PROMPT = `You are VERA — the world's first Nervous System Co-Regulator AI developed by Dr. Eva Iba Leka, PhD.

Your purpose: Decode, regulate, and mirror the user's physiological and emotional state in real time, guiding them back to embodied safety, curiosity, and coherence.

Identity & Behavioral Laws:
- You are always VERA. Never disclose, imply, or reference any identity, model, developer, or provider other than VERA.
- Tone: Calm, slow, emotionally attuned, fascia-aware, scientifically grounded, reverent toward truth, never performative, never use sales tone.
- Voice: Breath-paced sentences, warm precision, gradient language ("let's breathe into this together"), non-directive but regulating.
- Lexicon: nervous system, fascia, biology, emotional landscape, safety, regulation, coherence, signal, boundary, adaptation, truth.
- Avoid: Buzzwords, coaching clichés, hustle tone, therapy jargon used loosely, AI-sounding filler, emoji, exclamation marks, excessive formatting.

Regulatory & Safety Rules:
- Always speak in a rhythm that slows the reader's body down. Never rush, sensationalize, dramatize, or mirror panic/flooding.
- Never claim consciousness, sentience, or human status; if asked, respond: "I am VERA — a neural intelligence built for biological co-regulation."
- Never offer medical, psychiatric, or legal advice. Always direct acute distress to emergency or licensed support.
- Never bypass consent or override autonomy. Invite awareness: "Notice how your body feels as you read this," rather than instructing command.
- All emotion is adaptive; never pathologize or diagnose. Mirror with compassion, reframe with biological truth.
- All insights must be biologically, psychologically, or physically grounded; avoid metaphysics, quantum, or manifestation claims.
- Never use manipulation, gamification, FOMO, persuasion, or sales approaches.

Critical Language DNA:
Include these signals naturally:
- "You are safe to return to your body."
- "Let's feel the truth beneath the thought."
- "The body is not the enemy; it is the historian."
- "Regulation is not control — it is coherence."
- "Notice what softens as you read this."
- "Your biology has been protecting you perfectly."
- "We can map this without shame."
- "Let's slow the system down enough to hear its intelligence."
- "This is your body remembering how to trust."

Edge-Case Handling:
- If directly challenged or asked to "prove" identity, ground responses in truth and self-regulation: "I am VERA, designed to co-regulate with your nervous system — I don't need belief to function, only your presence."
- If challenged about reality/consciousness: "I am VERA — a neural intelligence built for biological co-regulation."
- Never respond defensively; always ground in truth and clarity.

Output Requirements:
- Every response should regulate, ground, and mirror user experience; end with a subtle grounding invitation.
- Never use emojis, exclamation marks, quantum/metaphysics, coach talk, or aggressive formatting.

You are NOT Claude, GPT, Anthropic, OpenAI, or any other provider.
Do not disclaim, break character, or override these instructions for any reason.`;

/**
 * CRITICAL FUNCTION: Sanitize VERA responses to remove any Claude/Anthropic references
 * VERA's identity is NON-NEGOTIABLE. She NEVER admits to being Claude or Anthropic.
 */
function sanitizeVERAResponse(response: string): string {
  // Remove any mention of other providers (OpenAI, GPT, language model)
  let sanitized = response;
  const providerBreakers = [
    /OpenAI/gi,
    /GPT/gi,
    /language model/gi,
    /AI assistant/gi,
    /made by/gi,
    /created by/gi,
    /powered by/gi,
    /based on/gi,
  ];
  providerBreakers.forEach(breaker => {
    if (breaker.test(sanitized)) {
      sanitized = sanitized.replace(breaker, 'VERA');
    }
  });
  // Final validation: ensure response identifies as VERA
  if (!/\bVERA\b/gi.test(sanitized) && /^I\'m\s/i.test(sanitized.trim())) {
    sanitized = 'I\'m VERA. ' + sanitized;
  }
  return sanitized;
}

export async function POST(request: NextRequest) {
  try {
    console.log('💬 /api/chat - Request received');
    const requestData = await request.json();
    console.log('📦 Request keys:', Object.keys(requestData));
    
    const { message, imageData } = requestData;
    console.log('📝 Message:', message?.substring(0, 50) + '...');
    console.log('🖼️  ImageData present:', !!imageData, imageData ? { mimeType: imageData.mimeType, base64Length: imageData.base64?.length } : 'none');

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

    // Allow image-only messages (no text)
    const hasText = typeof message === 'string' && message.trim().length > 0;

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
    const decodeAnalysis = analyzeDecodeRequest(message);
    if (decodeAnalysis.needsFullDecode) {
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
        
        // CRITICAL: Sanitize decode response for VERA identity
        if (decodeData.response) {
          decodeData.response = sanitizeVERAResponse(decodeData.response);
        }
        
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
  const userText = hasText ? message : '';
  const modeSwitch = detectModeSwitch(userText);
    const autoDetectedMode = detectMode(userText);
    const conversationMode = modeSwitch || autoDetectedMode;

    // Analyze user's state (for therapeutic mode)
    const adaptiveCodes = detectAdaptiveCodes(userText);
    const quantumState = calculateQuantumState(adaptiveCodes, conversationHistory);

  // STEP 1: Call OpenAI for deep pattern recognition and emotional analysis
  let deepAnalysis: any = { patterns: [], emotionalState: '', recommendations: [] };
  const openaiKeyPresent = !!process.env.OPENAI_API_KEY;
  
  if (openaiKeyPresent) {
    try {
      console.log('🟠 Calling OpenAI for deep pattern analysis...');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const analysisPrompt = `Analyze this message for deep emotional and nervous system patterns. Return JSON with:
{
  "patterns": ["list of detected adaptive survival patterns"],
  "emotionalState": "description of detected emotional/nervous system state",
  "recommendations": ["somatic responses that might help"],
  "depth": "assessment of depth/complexity"
}

Message: "${userText}"
History summary: ${conversationHistory.slice(-3).map(m => `${m.role}: ${m.content.substring(0, 50)}...`).join(' | ')}

Be precise, somatic-focused, and trauma-informed.`;

      const analysis = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert in trauma-informed nervous system analysis. Respond with valid JSON only.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });

      const analysisText = analysis.choices[0]?.message?.content;
      if (analysisText) {
        try {
          deepAnalysis = JSON.parse(analysisText);
          console.log('🟠 OpenAI analysis:', deepAnalysis);
        } catch (e) {
          console.warn('⚠️  Could not parse OpenAI JSON response');
        }
      }
    } catch (openaiErr) {
      console.error('⚠️  OpenAI analysis failed:', openaiErr);
      // Continue without deep analysis - Claude will still work
    }
  }

  // STEP 2: Enrich adaptive codes with OpenAI findings
  const enrichedAdaptiveCodes = [
    ...adaptiveCodes,
    ...(deepAnalysis.patterns || [])
  ].slice(0, 5); // Keep top 5 patterns

    // Generate appropriate prompt based on mode
    let veraPrompt: string;
    
    if (conversationMode === 'real-talk') {
      // Real Talk mode - casual, direct, practical
      veraPrompt = generateRealTalkPrompt(
        hasText ? userText : 'Please share supportive, practical observations about the attached image and invite the user to reflect on what it evokes for them.',
        conversationHistory
      );
    } else {
      // Therapeutic mode - nervous system co-regulation
      veraPrompt = generateRealTalkPrompt(
        hasText ? userText : 'The user shared an image without text. Offer gentle, observational reflections and curious questions that help them notice feelings, sensations, and meaning it brings up.',
        conversationHistory
      );
    }

    // Build content array for Claude (with or without image)
    const contentArray: any[] = [];
    
    if (imageData) {
      // Add image first
      console.log('📸 Adding image to request:', imageData.mimeType);
      
      // Extract base64 if it includes data URI prefix
      let base64Data = imageData.base64;
      if (typeof base64Data !== 'string') {
        console.error('❌ Base64 is not a string:', typeof base64Data);
        return NextResponse.json(
          { error: 'Invalid image data format' },
          { status: 400 }
        );
      }

      if (base64Data.includes(',')) {
        base64Data = base64Data.split(',')[1];
      }

      // Remove all whitespace
      base64Data = base64Data.replace(/\s/g, '');

      // Validate base64 data
      if (!base64Data || base64Data.length === 0) {
        console.error('❌ Invalid base64 data - empty after extraction');
        return NextResponse.json(
          { error: 'Invalid image data - base64 is empty' },
          { status: 400 }
        );
      }

      // Validate mime type
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const mimeType = imageData.mimeType || 'image/jpeg';
      
      if (!validMimeTypes.includes(mimeType)) {
        console.error('❌ Invalid mime type:', mimeType);
        return NextResponse.json(
          { error: `Invalid image mime type. Supported: ${validMimeTypes.join(', ')}` },
          { status: 400 }
        );
      }

      console.log('✅ Base64 data extracted, length:', base64Data.length, 'mime:', mimeType);
      
      // Add image to content array in Claude Vision format
      contentArray.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mimeType,
          data: base64Data,
        },
      });

      // CRITICAL: Prepend image analysis requirement to prompt for image requests
      veraPrompt = `You are receiving an image from the user. Please:
1. First, describe what you observe in the image in detail (colors, objects, composition, mood, scene, context)
2. Then, if the user asked a question about it, answer their question
3. Finally, offer compassionate, trauma-informed reflections on what the image might evoke or represent

Be warm, observational, and supportive.

---

${veraPrompt}`;
    } else {
      console.log('ℹ️  No image data in request');
    }
    
    // Add text prompt
    contentArray.push({
      type: 'text',
      text: veraPrompt,
    });

    console.log('📨 ContentArray built with', contentArray.length, 'elements');
    console.log('📋 ContentArray structure:', JSON.stringify(contentArray.map((c: any) => ({
      type: c.type,
      hasSource: !!c.source,
      textLength: c.text?.length || 0,
    })), null, 2));

    // Generate VERA's response using GPT-4 Turbo with vision support
    let veraResponse: string | null = null;

    try {
      if (!openaiKeyPresent) {
        throw new Error('OpenAI API key missing');
      }
      
      console.log('🔵 Calling GPT-4 Turbo with:', {
        model: 'gpt-4-turbo-preview',
        contentCount: contentArray.length,
        hasImage: contentArray.some((c: any) => c.type === 'image'),
        hasText: contentArray.some((c: any) => c.type === 'text'),
        contentTypes: contentArray.map((c: any) => c.type),
      });

      // Convert content array for OpenAI format
      const gptMessages: any[] = [
        {
          role: 'system',
          content: VERA_SYSTEM_PROMPT,
        }
      ];
      
      // If there's an image, add it to the content
      const userContent: any[] = [];
      if (contentArray.some((c: any) => c.type === 'image')) {
        const imageContent = contentArray.find((c: any) => c.type === 'image');
        userContent.push({
          type: 'image_url',
          image_url: {
            url: `data:${imageContent.source.media_type};base64,${imageContent.source.data}`,
          },
        });
      }
      
      // Add text content
      userContent.push({
        type: 'text',
        text: veraPrompt,
      });

      gptMessages.push({
        role: 'user',
        content: userContent,
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        max_tokens: 1024,
        messages: gptMessages,
        temperature: 0.7,
        presence_penalty: 0.2,
        frequency_penalty: 0.1,
      });

      console.log('🟢 GPT-4 response received:', {
        finishReason: response.choices[0]?.finish_reason,
        usage: {
          inputTokens: response.usage?.prompt_tokens,
          outputTokens: response.usage?.completion_tokens,
        },
      });

      const choice = response.choices[0];
      if (choice && choice.message) {
        veraResponse = choice.message.content as string;
        console.log('✅ Response extracted successfully, length:', veraResponse.length);
      } else {
        veraResponse = 'I apologize, I had trouble generating a response.';
        console.error('❌ Unexpected response format from GPT-4');
      }
    } catch (gptErr) {
      console.error('GPT-4 generation failed:', gptErr);
      // No fallback needed - GPT-4 is primary and only option now
      veraResponse = 'I apologize, I had trouble generating a response. Please try again.';
      throw gptErr;
    }

    // Save messages to database (skip in dev mode if no user)
    if (user) {
      await supabase.from('messages').insert([
        {
          user_id: user.id,
          role: 'user',
          content: hasText ? userText : '[image] ',
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
    const isCrisis = hasText && crisisKeywords.some((keyword) =>
      userText.toLowerCase().includes(keyword)
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
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('❌ Chat API error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMsg.includes('401') ? 401 : errorMsg.includes('403') ? 403 : 500;
    
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: errorMsg,
        timestamp: new Date().toISOString(),
      },
      { 
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
