import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { User, Session } from '@/types/auth';
import type { Message } from '@/types/chat';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

// Define MagicLink type locally since it's not in the types files
interface MagicLink {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

let cachedServiceClient: SupabaseClient | null | undefined;

export function createServiceClientOptional(): SupabaseClient | null {
  if (cachedServiceClient !== undefined) {
    return cachedServiceClient;
  }

  if (!env.supabase.serviceRoleKey) {
    if (env.app.debugLogs) {
      logger.debug('[db] Service role key missing; privileged Supabase client unavailable');
    }
    cachedServiceClient = null;
    return cachedServiceClient;
  }

  cachedServiceClient = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedServiceClient;
}

// ==================== USERS ====================

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = createServiceClientOptional();
  if (!supabase) {
    logger.warn('[db] getUserByEmail skipped: service role unavailable');
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    logger.error('[db] getUserByEmail error', error instanceof Error ? error : { error });
    return null;
  }

  return data;
}

export async function createUser(email: string): Promise<User | null> {
  const supabase = createServiceClientOptional();
  if (!supabase) {
    logger.warn('[db] createUser skipped: service role unavailable');
    return null;
  }

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
    logger.error('[db] createUser error', error instanceof Error ? error : { error });
    return null;
  }

  return data;
}

export async function updateUserSubscription(
  userId: string,
  customerId: string,
  subscriptionId: string
): Promise<boolean> {
  const supabase = createServiceClientOptional();
  if (!supabase) {
    logger.warn('[db] updateUserSubscription skipped: service role unavailable');
    return false;
  }

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
    logger.error('[db] updateUserSubscription error', error instanceof Error ? error : { error });
    return false;
  }

  return true;
}

// ==================== SESSIONS ====================

export async function createSession(userId: string): Promise<Session | null> {
  const supabase = createServiceClientOptional();
  if (!supabase) {
    logger.warn('[db] createSession skipped: service role unavailable');
    return null;
  }

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
    logger.error('[db] createSession error', error instanceof Error ? error : { error });
    return null;
  }

  return data;
}

export async function getSessionByToken(token: string): Promise<(Session & { user: User }) | null> {
  const supabase = createServiceClientOptional();
  if (!supabase) {
    logger.warn('[db] getSessionByToken skipped: service role unavailable');
    return null;
  }

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
    logger.error('[db] getSessionByToken error', error instanceof Error ? error : { error });
    return null;
  }

  return {
    ...data,
    user: data.user as unknown as User,
  };
}

export async function deleteSession(token: string): Promise<boolean> {
  const supabase = createServiceClientOptional();
  if (!supabase) {
    logger.warn('[db] deleteSession skipped: service role unavailable');
    return false;
  }

  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('token', token);

  if (error) {
    logger.error('[db] deleteSession error', error instanceof Error ? error : { error });
    return false;
  }

  return true;
}

// ==================== MAGIC LINKS ====================

export async function createMagicLink(email: string): Promise<MagicLink | null> {
  const supabase = createServiceClientOptional();
  if (!supabase) {
    logger.warn('[db] createMagicLink skipped: service role unavailable');
    return null;
  }

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
    logger.error('[db] createMagicLink error', error instanceof Error ? error : { error });
    return null;
  }

  return data;
}

export async function getMagicLink(token: string): Promise<MagicLink | null> {
  const supabase = createServiceClientOptional();
  if (!supabase) {
    logger.warn('[db] getMagicLink skipped: service role unavailable');
    return null;
  }

  const { data, error } = await supabase
    .from('magic_links')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error) {
    logger.error('[db] getMagicLink error', error instanceof Error ? error : { error });
    return null;
  }

  return data;
}

export async function markMagicLinkUsed(token: string): Promise<boolean> {
  const supabase = createServiceClientOptional();
  if (!supabase) {
    logger.warn('[db] markMagicLinkUsed skipped: service role unavailable');
    return false;
  }

  const { error } = await supabase
    .from('magic_links')
    .update({ used: true })
    .eq('token', token);

  if (error) {
    logger.error('[db] markMagicLinkUsed error', error instanceof Error ? error : { error });
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
  const supabase = createServiceClientOptional();
  if (!supabase) {
    logger.warn('[db] saveMessage skipped: service role unavailable');
    return null;
  }

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
    logger.error('[db] saveMessage error', error instanceof Error ? error : { error });
    return null;
  }

  return data;
}

export async function getMessages(userId: string, limit = 50): Promise<Message[]> {
  const supabase = createServiceClientOptional();
  if (!supabase) {
    logger.warn('[db] getMessages skipped: service role unavailable');
    return [];
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    logger.error('[db] getMessages error', error instanceof Error ? error : { error });
    return [];
  }

  return data.reverse();
}