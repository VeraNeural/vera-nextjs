# VERA Analytics SQL Queries

**Database Schema**: PostgreSQL on Supabase  
**Tables**: users, threads, messages, user_preferences  
**Last Updated**: 2024

---

## 🎯 User & Subscription Overview

### Active Subscriptions Count
```sql
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as paid_subscribers,
  COUNT(CASE WHEN subscription_status = 'trialing' THEN 1 END) as trial_users,
  COUNT(CASE WHEN subscription_status = 'canceled' THEN 1 END) as cancelled,
  COUNT(CASE WHEN subscription_status = 'past_due' THEN 1 END) as past_due,
  COUNT(CASE WHEN subscription_status = 'expired' THEN 1 END) as expired
FROM users;
```

### Active Trial Users (Not Expired)
```sql
SELECT 
  COUNT(*) as active_trials,
  COUNT(CASE WHEN trial_end > now() + interval '24 hours' THEN 1 END) as "24h_plus_remaining",
  COUNT(CASE WHEN trial_end > now() AND trial_end < now() + interval '24 hours' THEN 1 END) as "under_24h_remaining",
  COUNT(CASE WHEN trial_end <= now() THEN 1 END) as already_expired
FROM users 
WHERE subscription_status = 'trialing';
```

### Trial Status Breakdown
```sql
SELECT 
  subscription_status,
  subscription_plan,
  COUNT(*) as user_count,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM users), 2) as percentage,
  MIN(created_at) as first_user,
  MAX(created_at) as last_user
FROM users
GROUP BY subscription_status, subscription_plan
ORDER BY user_count DESC;
```

### Signup Trend (Last 30 Days)
```sql
SELECT 
  DATE(created_at) as signup_date,
  COUNT(*) as new_signups,
  COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as converted_to_paid,
  COUNT(CASE WHEN subscription_status = 'trialing' THEN 1 END) as still_trialing,
  ROUND(100.0 * COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) / COUNT(*), 2) as conversion_pct
FROM users
WHERE created_at > now() - interval '30 days'
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;
```

### Subscription Plans Breakdown
```sql
SELECT 
  subscription_plan,
  COUNT(*) as subscribers,
  COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as active,
  COUNT(CASE WHEN subscription_status = 'past_due' THEN 1 END) as past_due,
  COUNT(CASE WHEN subscription_status = 'canceled' THEN 1 END) as canceled
FROM users
WHERE subscription_status != 'trialing'
GROUP BY subscription_plan
ORDER BY COUNT(*) DESC;
```

### Trial to Paid Conversion
```sql
SELECT 
  (SELECT COUNT(*) FROM users WHERE subscription_status = 'active') as paid_users,
  (SELECT COUNT(*) FROM users WHERE subscription_status = 'trialing' AND trial_end > now()) as active_trials,
  (SELECT COUNT(*) FROM users WHERE subscription_status = 'trialing' AND trial_end <= now()) as expired_trials,
  (SELECT COUNT(*) FROM users WHERE subscription_status = 'canceled') as canceled,
  ROUND(
    100.0 * (SELECT COUNT(*) FROM users WHERE subscription_status = 'active') / 
    NULLIF((SELECT COUNT(*) FROM users WHERE subscription_status IN ('active', 'canceled', 'expired')), 0),
    2
  ) as conversion_rate_pct;
```

---

## 💬 Chat & Engagement Metrics

### Total Messages by User (Top 20)
```sql
SELECT 
  u.email,
  COUNT(m.id) as total_messages,
  COUNT(CASE WHEN m.role = 'user' THEN 1 END) as user_messages,
  COUNT(CASE WHEN m.role = 'assistant' THEN 1 END) as vera_responses,
  MIN(m.created_at) as first_message,
  MAX(m.created_at) as last_message,
  ROUND(EXTRACT(EPOCH FROM (MAX(m.created_at) - MIN(m.created_at))) / 3600, 2) as hours_active,
  u.subscription_status,
  u.trial_end
FROM messages m
JOIN users u ON m.user_id = u.id
GROUP BY u.id, u.email, u.subscription_status, u.trial_end
ORDER BY COUNT(m.id) DESC
LIMIT 20;
```

### Daily Message Volume (Last 30 Days)
```sql
SELECT 
  DATE(m.created_at) as date,
  COUNT(m.id) as total_messages,
  COUNT(CASE WHEN m.role = 'user' THEN 1 END) as user_messages,
  COUNT(CASE WHEN m.role = 'assistant' THEN 1 END) as vera_responses,
  COUNT(DISTINCT m.user_id) as active_users,
  COUNT(DISTINCT m.thread_id) as threads_started
FROM messages m
WHERE m.created_at > now() - interval '30 days'
GROUP BY DATE(m.created_at)
ORDER BY date DESC;
```

### Active Conversations (Threads)
```sql
SELECT 
  COUNT(*) as total_threads,
  COUNT(CASE WHEN updated_at > now() - interval '24 hours' THEN 1 END) as active_24h,
  COUNT(CASE WHEN updated_at > now() - interval '7 days' THEN 1 END) as active_7d,
  COUNT(CASE WHEN updated_at > now() - interval '30 days' THEN 1 END) as active_30d,
  ROUND(AVG(message_count), 2) as avg_messages_per_thread,
  MAX(message_count) as longest_thread
FROM (
  SELECT 
    t.id,
    t.updated_at,
    COUNT(m.id) as message_count
  FROM threads t
  LEFT JOIN messages m ON t.id = m.thread_id
  GROUP BY t.id, t.updated_at
) subquery;
```

### Top Conversation Topics (by Thread Title)
```sql
SELECT 
  SUBSTRING(title, 1, 50) as topic,
  COUNT(*) as thread_count,
  ROUND(AVG(msg_count), 1) as avg_messages,
  MIN(created_at) as first_thread,
  MAX(created_at) as last_thread
FROM (
  SELECT 
    t.title,
    t.created_at,
    COUNT(m.id) as msg_count
  FROM threads t
  LEFT JOIN messages m ON t.id = m.thread_id
  GROUP BY t.id, t.title, t.created_at
) subquery
GROUP BY SUBSTRING(title, 1, 50)
ORDER BY COUNT(*) DESC
LIMIT 15;
```

### Saved Messages (User Engagement)
```sql
SELECT 
  COUNT(*) as total_saved,
  COUNT(DISTINCT user_id) as users_who_saved,
  COUNT(CASE WHEN role = 'assistant' THEN 1 END) as saved_vera_responses,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as saved_user_messages,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM messages), 2) as pct_of_all_messages
FROM messages
WHERE is_saved = true;
```

### Message Rate by User (Messages per Hour)
```sql
SELECT 
  u.email,
  COUNT(m.id) as total_messages,
  ROUND(EXTRACT(EPOCH FROM (MAX(m.created_at) - MIN(m.created_at))) / 3600, 2) as hours_active,
  ROUND(COUNT(m.id)::NUMERIC / NULLIF(EXTRACT(EPOCH FROM (MAX(m.created_at) - MIN(m.created_at))) / 3600, 0), 2) as msg_per_hour,
  u.subscription_status,
  u.trial_end
FROM messages m
JOIN users u ON m.user_id = u.id
WHERE m.created_at > now() - interval '7 days'
GROUP BY u.id, u.email, u.subscription_status, u.trial_end
HAVING COUNT(m.id) > 5
ORDER BY msg_per_hour DESC
LIMIT 15;
```

---

## 📊 Retention & Churn Analysis

### Last Activity by User (Churn Risk)
```sql
SELECT 
  u.email,
  u.subscription_status,
  u.trial_end,
  u.created_at as signup_date,
  MAX(m.created_at) as last_active,
  ROUND(EXTRACT(EPOCH FROM (now() - MAX(m.created_at))) / 86400, 1) as days_inactive,
  COUNT(m.id) as lifetime_messages
FROM users u
LEFT JOIN messages m ON u.id = m.user_id
GROUP BY u.id, u.email, u.subscription_status, u.trial_end, u.created_at
ORDER BY last_active DESC NULLS LAST;
```

### Inactive Users (>7 Days)
```sql
SELECT 
  COUNT(*) as inactive_count,
  COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as inactive_paid,
  COUNT(CASE WHEN subscription_status = 'trialing' THEN 1 END) as inactive_trial,
  COUNT(CASE WHEN trial_end < now() THEN 1 END) as inactive_expired_trial
FROM (
  SELECT 
    u.id,
    u.subscription_status,
    u.trial_end,
    MAX(m.created_at) as last_active
  FROM users u
  LEFT JOIN messages m ON u.id = m.user_id
  GROUP BY u.id, u.subscription_status, u.trial_end
  HAVING MAX(m.created_at) < now() - interval '7 days' OR MAX(m.created_at) IS NULL
) subquery;
```

### Daily Active Users (DAU) - Last 30 Days
```sql
SELECT 
  DATE(m.created_at) as date,
  COUNT(DISTINCT m.user_id) as dau,
  COUNT(DISTINCT m.thread_id) as threads_opened,
  COUNT(DISTINCT CASE WHEN m.role = 'user' THEN m.user_id END) as users_who_messaged
FROM messages m
WHERE m.created_at > now() - interval '30 days'
GROUP BY DATE(m.created_at)
ORDER BY date DESC;
```

---

## ⚙️ System & Performance

### Database Table Sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Most Active Hours (Message Timestamps)
```sql
SELECT 
  EXTRACT(HOUR FROM created_at) as hour_of_day,
  COUNT(*) as message_count,
  COUNT(DISTINCT user_id) as active_users,
  ROUND(AVG(LENGTH(content)), 0) as avg_message_length
FROM messages
WHERE created_at > now() - interval '7 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour_of_day;
```

### Activity in Last 24 Hours
```sql
SELECT 
  'New Users' as metric,
  COUNT(*) as count
FROM users
WHERE created_at > now() - interval '24 hours'
UNION ALL
SELECT 
  'Messages Sent',
  COUNT(*)
FROM messages
WHERE created_at > now() - interval '24 hours'
UNION ALL
SELECT 
  'Threads Created',
  COUNT(*)
FROM threads
WHERE created_at > now() - interval '24 hours'
UNION ALL
SELECT 
  'Trials Expired',
  COUNT(*)
FROM users
WHERE subscription_status = 'trialing' 
  AND trial_end < now() 
  AND updated_at > now() - interval '24 hours';
```

---

## 🔍 How to Use These Queries

1. **Open Supabase Dashboard** → Select your project
2. **Navigate to SQL Editor** (left sidebar)
3. **Copy any query** from above and paste into editor
4. **Click "Run"** button (or Cmd/Ctrl + Enter)
5. **View results** in the results panel
6. **Export CSV** (optional) using the download button

### Power Tips

- **Add `LIMIT 10`** to any query to get a quick sample
- **Change `interval '30 days'`** to `interval '7 days'` for recent data only
- **Use `WHERE subscription_status = 'active'`** to filter only paid users
- **Sort by `COUNT(*) DESC`** to see top results first
- **Copy results to Google Sheets** for charting and sharing
