-- ========================================
-- 🎉 SEE ALL 13 USERS WITH DETAILS
-- ========================================

SELECT 
  email,
  subscription_status,
  trial_end,
  created_at,
  EXTRACT(EPOCH FROM (trial_end - NOW())) / 3600 as hours_remaining,
  CASE 
    WHEN subscription_status = 'trialing' AND trial_end > NOW() THEN '✅ ACTIVE TRIAL'
    WHEN subscription_status = 'trialing' AND trial_end <= NOW() THEN '⏰ TRIAL EXPIRED'
    WHEN subscription_status = 'active' THEN '💳 PAID'
    ELSE subscription_status
  END as status_label
FROM users
ORDER BY created_at DESC;

-- ========================================
-- BREAKDOWN BY STATUS
-- ========================================

SELECT 
  subscription_status,
  COUNT(*) as user_count,
  COUNT(CASE WHEN trial_end > NOW() THEN 1 END) as active_trials,
  COUNT(CASE WHEN trial_end <= NOW() THEN 1 END) as expired_trials
FROM users
GROUP BY subscription_status
ORDER BY user_count DESC;

-- ========================================
-- ACTIVE TRIALS (Still have time)
-- ========================================

SELECT 
  email,
  trial_end,
  EXTRACT(EPOCH FROM (trial_end - NOW())) / 3600 as hours_remaining,
  ROUND(EXTRACT(EPOCH FROM (trial_end - NOW())) / 86400, 1) as days_remaining
FROM users
WHERE subscription_status = 'trialing'
  AND trial_end > NOW()
ORDER BY trial_end ASC;

-- ========================================
-- EXPIRED TRIALS (Past 48 hours)
-- ========================================

SELECT 
  email,
  trial_end,
  EXTRACT(EPOCH FROM (NOW() - trial_end)) / 3600 as hours_expired_ago,
  ROUND(EXTRACT(EPOCH FROM (NOW() - trial_end)) / 86400, 1) as days_expired_ago
FROM users
WHERE subscription_status = 'trialing'
  AND trial_end <= NOW()
ORDER BY trial_end DESC;

-- ========================================
-- PAID USERS
-- ========================================

SELECT 
  email,
  subscription_plan,
  subscription_current_period_end,
  created_at
FROM users
WHERE subscription_status = 'active'
ORDER BY created_at DESC;

-- ========================================
-- USER SIGNUP TIMELINE (Last 30 days)
-- ========================================

SELECT 
  DATE(created_at) as signup_date,
  COUNT(*) as new_signups,
  COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as converted,
  COUNT(CASE WHEN subscription_status = 'trialing' THEN 1 END) as still_trial
FROM users
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;

-- ========================================
-- DETAILED USER LIST (All columns)
-- ========================================

SELECT 
  email,
  subscription_status,
  subscription_plan,
  trial_start,
  trial_end,
  subscription_current_period_end,
  created_at,
  EXTRACT(EPOCH FROM (trial_end - NOW())) / 3600 as hours_remaining
FROM users
ORDER BY created_at DESC;
