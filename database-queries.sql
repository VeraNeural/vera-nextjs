-- Quick Database Queries for Testing
-- Copy/paste these into Supabase SQL Editor as needed

-- ========================================
-- ⚠️ CAN'T SEE USERS? HERE'S WHY + FIX
-- ========================================
-- RLS (Row Level Security) policies hide other users from you!
-- Run this to see ALL users (bypasses RLS):

SELECT 
  id,
  email,
  subscription_status,
  trial_end,
  created_at,
  EXTRACT(EPOCH FROM (trial_end - NOW())) / 3600 as hours_remaining
FROM users
ORDER BY created_at DESC;

-- If this STILL shows 0 users, check if auth.users exist:
SELECT COUNT(*) as users_in_auth FROM auth.users;

-- If auth.users > 0 but public.users = 0, users weren't created by callback.
-- See DEBUG_USERS.sql for fix.

-- ========================================
-- CHECK USER TRIAL STATUS
-- ========================================
-- Replace 'your-email@domain.com' with test email
SELECT 
  id,
  email,
  trial_start,
  trial_end,
  subscription_status,
  subscription_plan,
  stripe_customer_id,
  stripe_subscription_id,
  created_at,
  -- Calculate hours remaining in trial
  EXTRACT(EPOCH FROM (trial_end - NOW())) / 3600 as hours_remaining
FROM users 
WHERE email = 'your-email@domain.com';

-- ========================================
-- MANUALLY EXPIRE TRIAL (for testing)
-- ========================================
UPDATE users 
SET trial_end = NOW() - INTERVAL '1 hour'
WHERE email = 'your-email@domain.com';

-- ========================================
-- RESET TRIAL (give another 48 hours)
-- ========================================
UPDATE users 
SET 
  trial_end = NOW() + INTERVAL '48 hours',
  subscription_status = 'trialing',
  stripe_subscription_id = NULL
WHERE email = 'your-email@domain.com';

-- ========================================
-- CHECK ALL ACTIVE TRIALS
-- ========================================
SELECT 
  email,
  trial_end,
  EXTRACT(EPOCH FROM (trial_end - NOW())) / 3600 as hours_remaining,
  subscription_status
FROM users 
WHERE subscription_status = 'trialing'
  AND trial_end > NOW()
ORDER BY trial_end ASC;

-- ========================================
-- CHECK ALL ACTIVE SUBSCRIPTIONS
-- ========================================
SELECT 
  email,
  subscription_status,
  subscription_plan,
  stripe_customer_id,
  subscription_current_period_end
FROM users 
WHERE subscription_status = 'active'
ORDER BY created_at DESC;

-- ========================================
-- CHECK USER'S MESSAGES
-- ========================================
SELECT 
  m.id,
  m.role,
  LEFT(m.content, 100) as content_preview,
  m.created_at,
  t.title as thread_title
FROM messages m
JOIN threads t ON m.thread_id = t.id
WHERE t.user_id = (SELECT id FROM users WHERE email = 'your-email@domain.com')
ORDER BY m.created_at DESC
LIMIT 20;

-- ========================================
-- TEST ACCESS FUNCTION
-- ========================================
-- Replace UUID with actual user ID from users table
SELECT is_user_access_active('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'::uuid);

-- ========================================
-- FIND USER BY EMAIL AND TEST ACCESS
-- ========================================
SELECT 
  u.email,
  u.subscription_status,
  u.trial_end,
  is_user_access_active(u.id) as has_access,
  CASE 
    WHEN is_user_access_active(u.id) THEN '✅ Can use VERA'
    ELSE '❌ Access blocked'
  END as access_status
FROM users u
WHERE u.email = 'your-email@domain.com';

-- ========================================
-- SIMULATE SUBSCRIPTION ACTIVATION
-- (for testing without Stripe)
-- ========================================
UPDATE users 
SET 
  subscription_status = 'active',
  subscription_plan = 'month',
  stripe_customer_id = 'cus_test_' || SUBSTR(MD5(RANDOM()::text), 1, 14),
  stripe_subscription_id = 'sub_test_' || SUBSTR(MD5(RANDOM()::text), 1, 14),
  subscription_current_period_end = NOW() + INTERVAL '1 month',
  trial_end = NULL
WHERE email = 'your-email@domain.com';

-- ========================================
-- CANCEL SUBSCRIPTION (for testing)
-- ========================================
UPDATE users 
SET 
  subscription_status = 'canceled',
  stripe_subscription_id = NULL
WHERE email = 'your-email@domain.com';

-- ========================================
-- DELETE TEST USER (clean up)
-- ========================================
-- WARNING: This deletes all user data!
DELETE FROM users WHERE email = 'your-email@domain.com';

-- ========================================
-- VIEW RECENT SIGNUPS
-- ========================================
SELECT 
  email,
  created_at,
  trial_end,
  subscription_status,
  EXTRACT(EPOCH FROM (trial_end - NOW())) / 3600 as hours_remaining
FROM users 
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- COUNT USERS BY STATUS
-- ========================================
SELECT 
  subscription_status,
  COUNT(*) as user_count
FROM users 
GROUP BY subscription_status
ORDER BY user_count DESC;

-- ========================================
-- FIND EXPIRED TRIALS
-- ========================================
SELECT 
  email,
  trial_end,
  subscription_status,
  created_at
FROM users 
WHERE trial_end < NOW()
  AND subscription_status = 'trialing'
ORDER BY trial_end DESC;
