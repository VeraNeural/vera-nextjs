import { createClient } from '@supabase/supabase-js';
import type { User, Session } from '@/types/auth';
import type { Message } from '@/types/chat';

// Define MagicLink type locally since it's not in the types files
interface MagicLink {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==================== USERS ====================

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('[db] getUserByEmail error:', error);
    return null;
  }

  return data;
}

export async function createUser(email: string): Promise<User | null> {
  const trialEnd = new Date();
  trialEnd.setHours(trialEnd.getHours() + 48);

  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      subscription_status: 'trial',
      trial_end: trialEnd.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[db] createUser error:', error);
    return null;
  }

  return data;
}

export async function updateUserSubscription(
  userId: string,
  customerId: string,
  subscriptionId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_status: 'active',
      trial_end: null,
    })
    .eq('id', userId);

  if (error) {
    console.error('[db] updateUserSubscription error:', error);
    return false;
  }

  return true;
}

// ==================== SESSIONS ====================

export async function createSession(userId: string): Promise<Session | null> {
  const token = require('nanoid').nanoid(64);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[db] createSession error:', error);
    return null;
  }

  return data;
}

export async function getSessionByToken(token: string): Promise<(Session & { user: User }) | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      user:users(*)
    `)
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) {
    console.error('[db] getSessionByToken error:', error);
    return null;
  }

  return {
    ...data,
    user: data.user as unknown as User,
  };
}

export async function deleteSession(token: string): Promise<boolean> {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('token', token);

  if (error) {
    console.error('[db] deleteSession error:', error);
    return false;
  }

  return true;
}

// ==================== MAGIC LINKS ====================

export async function createMagicLink(email: string): Promise<MagicLink | null> {
  const token = require('nanoid').nanoid(32);
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  const { data, error } = await supabase
    .from('magic_links')
    .insert({
      email,
      token,
      expires_at: expiresAt.toISOString(),
      used: false,
    })
    .select()
    .single();

  if (error) {
    console.error('[db] createMagicLink error:', error);
    return null;
  }

  return data;
}

export async function getMagicLink(token: string): Promise<MagicLink | null> {
  const { data, error } = await supabase
    .from('magic_links')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) {
    console.error('[db] getMagicLink error:', error);
    return null;
  }

  return data;
}

export async function markMagicLinkUsed(token: string): Promise<boolean> {
  const { error } = await supabase
    .from('magic_links')
    .update({ used: true })
    .eq('token', token);

  if (error) {
    console.error('[db] markMagicLinkUsed error:', error);
    return false;
  }

  return true;
}

// ==================== MESSAGES ====================

export async function saveMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      user_id: userId,
      role,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('[db] saveMessage error:', error);
    return null;
  }

  return data;
}

export async function getMessages(userId: string, limit = 50): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[db] getMessages error:', error);
    return [];
  }

  return data.reverse();
}