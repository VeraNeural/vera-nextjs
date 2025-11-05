// src/app/api/auth/delete-account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Delete all user data from database
    // Messages will be cascade deleted via foreign key constraints
    const { error: deleteThreadsError } = await supabase
      .from('threads')
      .delete()
      .eq('user_id', user.id);

    if (deleteThreadsError) {
      console.error('Error deleting threads:', deleteThreadsError);
    }

    // Delete user preferences
    const { error: deletePrefsError } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', user.id);

    if (deletePrefsError) {
      console.error('Error deleting preferences:', deletePrefsError);
    }

    // Delete user record
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (deleteUserError) {
      console.error('Error deleting user:', deleteUserError);
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    // Sign out the user
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
