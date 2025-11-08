-- ========================================
-- DIAGNOSTIC: Check if ANY data exists
-- ========================================

-- Check if auth.users table has any signups
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- Check if public.users table has any records
SELECT COUNT(*) as total_public_users FROM users;

-- Check if threads table has any data
SELECT COUNT(*) as total_threads FROM threads;

-- Check if messages table has any data
SELECT COUNT(*) as total_messages FROM messages;

-- ========================================
-- If auth.users > 0 but public.users = 0:
-- Users signed up but callback didn't create records
-- ========================================

-- See which auth users DON'T have public.users records
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE WHEN u.id IS NULL THEN '❌ MISSING' ELSE '✅ EXISTS' END as status
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
ORDER BY au.created_at DESC;

-- ========================================
-- Check RLS Policies (why public.users might not show)
-- ========================================

-- View all RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- ========================================
-- Test: Disable RLS temporarily to see all data
-- ========================================
-- WARNING: Only for debugging! Re-enable after

-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- 
-- SELECT 
--   id,
--   email,
--   subscription_status,
--   trial_end,
--   created_at
-- FROM users
-- ORDER BY created_at DESC;
--
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Manual Fix: Create missing user records
-- ========================================
-- If auth.users exist but public.users is empty:

-- INSERT INTO users (id, email, subscription_status, trial_start, trial_end, created_at)
-- SELECT 
--   au.id,
--   au.email,
--   'trialing' as subscription_status,
--   au.created_at as trial_start,
--   au.created_at + INTERVAL '48 hours' as trial_end,
--   au.created_at
-- FROM auth.users au
-- LEFT JOIN users u ON au.id = u.id
-- WHERE u.id IS NULL;

-- ========================================
-- Check Service Role Permissions
-- ========================================

-- This query shows if service role has INSERT permission
-- If this returns 0, service role can't insert users
SELECT COUNT(*) as service_role_can_insert
FROM information_schema.table_privileges
WHERE grantee = 'authenticated' 
  AND table_name = 'users'
  AND privilege_type = 'INSERT';

-- ========================================
-- Check auth.users directly
-- ========================================

SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- If users ARE in public.users, check details
-- ========================================

SELECT 
  id,
  email,
  subscription_status,
  trial_start,
  trial_end,
  created_at,
  EXTRACT(EPOCH FROM (trial_end - NOW())) / 3600 as hours_remaining
FROM users
ORDER BY created_at DESC
LIMIT 10;
