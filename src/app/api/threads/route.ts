// src/app/api/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

// GET: Fetch all threads for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('📋 GET /api/threads - User:', user?.email || 'not authenticated');

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data: threads, error } = await supabase
      .from('threads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching threads:', error);
      return NextResponse.json(
        { error: 'Failed to fetch threads', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Fetched threads:', threads?.length || 0);
    return NextResponse.json({ threads });
  } catch (error) {
    console.error('❌ Threads API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new thread
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('➕ POST /api/threads - User:', user?.email || 'not authenticated');

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { title, preview } = await request.json();
    console.log('📝 Creating thread:', { title, preview });

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // First check if user exists in users table
    const { data: userExists, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (userCheckError || !userExists) {
      console.error('❌ User not found in users table:', userCheckError);
      
      // Try to create user entry using SERVICE CLIENT (bypasses RLS)
      console.log('🔧 Attempting to create missing user entry with service client...');
      const serviceClient = createServiceClient();
      const { error: insertError } = await serviceClient.from('users').insert({
        id: user.id,
        email: user.email,
        subscription_status: 'trialing',
        trial_start: new Date().toISOString(),
        trial_end: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      });

      if (insertError) {
        console.error('❌ Failed to create user entry:', insertError);
        return NextResponse.json(
          { error: 'User setup failed', details: insertError.message },
          { status: 500 }
        );
      }
      console.log('✅ User entry created');
    }

    const { data: thread, error } = await supabase
      .from('threads')
      .insert({
        user_id: user.id,
        title,
        preview: preview || '',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating thread:', error);
      return NextResponse.json(
        { error: 'Failed to create thread', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Thread created:', thread.id);
    return NextResponse.json({ thread });
  } catch (error) {
    console.error('❌ Thread creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
