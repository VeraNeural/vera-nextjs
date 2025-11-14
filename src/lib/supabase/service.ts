import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Service role client - bypasses RLS, use with caution!
export function createServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY is not set; falling back to client-only capabilities.');
    return null;
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
