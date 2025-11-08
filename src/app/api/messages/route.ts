// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAccessStatus } from '@/lib/access';

// POST: Save a message to a thread
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Enforce subscription/trial access
    const access = await getAccessStatus(supabase as any, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: 'subscription_required',
          message: 'Your trial has ended. Please subscribe to send messages.',
          trialEnded: true,
        },
        { status: 403 }
      );
    }

    const { thread_id, role, content } = await request.json();

    if (!thread_id || !role || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        thread_id,
        user_id: user.id,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Transform snake_case to camelCase for frontend
    const transformedMessage = {
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.created_at,
      imageData: message.image_data,
      isSaved: message.is_saved,
    };

    return NextResponse.json({ message: transformedMessage });
  } catch (error) {
    console.error('Message save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Fetch saved messages
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const savedOnly = searchParams.get('saved') === 'true';

    let query = supabase
      .from('messages')
      .select('*, threads(title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (savedOnly) {
      query = query.eq('is_saved', true);
    }

    // Enforce subscription/trial access
    const access = await getAccessStatus(supabase as any, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: 'subscription_required',
          message: 'Your trial has ended. Please subscribe to view messages.',
          trialEnded: true,
        },
        { status: 403 }
      );
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
