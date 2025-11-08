-- ========================================
-- 🔓 BYPASS RLS TO SEE ALL USERS
-- ========================================
-- Run this in Supabase SQL Editor to see all users
-- (RLS policies normally hide other users from you)

-- First, check if users table has any data at all
SELECT 
  COUNT(*) as total_user_records
FROM users;

-- Then see all users with their details
SELECT 
  id,
  email,
  subscription_status,
  trial_start,
  trial_end,
  created_at,
  EXTRACT(EPOCH FROM (trial_end - NOW())) / 3600 as hours_remaining,
  CASE 
    WHEN trial_end > NOW() THEN '✅ Active Trial'
    WHEN trial_end < NOW() AND subscription_status = 'trialing' THEN '⏰ Expired Trial'
    WHEN subscription_status = 'active' THEN '💳 Paid'
    ELSE subscription_status
  END as status_label
FROM users
ORDER BY created_at DESC;

-- Check if messages are being saved
SELECT 
  COUNT(*) as total_messages,
  COUNT(DISTINCT user_id) as users_with_messages,
  COUNT(DISTINCT thread_id) as total_threads
FROM messages;

-- Check threads
SELECT 
  COUNT(*) as total_threads,
  COUNT(DISTINCT user_id) as users_with_threads
FROM threads;

-- If you still see 0 users, check the auth.users table (managed by Supabase Auth)
SELECT 
  COUNT(*) as total_auth_users
FROM auth.users;

-- See all auth users with their signup time
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- ========================================
-- IF USERS EXIST IN AUTH BUT NOT IN PUBLIC.USERS
-- This means the callback is not creating user records
-- ========================================

-- See auth users who DON'T have a corresponding users record
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE WHEN u.id IS NULL THEN '❌ NO USER RECORD' ELSE '✅ User exists' END as has_user_record
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
ORDER BY au.created_at DESC;

-- ========================================
-- MANUALLY CREATE MISSING USER RECORDS
-- (if auth.users exist but public.users doesn't)
-- ========================================
-- Uncomment and run if needed:
/*
INSERT INTO users (id, email, subscription_status, trial_start, trial_end, created_at)
SELECT 
  au.id,
  au.email,
  'trialing' as subscription_status,
  au.created_at as trial_start,
  au.created_at + INTERVAL '48 hours' as trial_end,
  au.created_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;
*/
