# VERA Analytics Quick Start

**TL;DR**: Run these 3 SQL queries in Supabase to see your current metrics.

---

## 🎯 Right Now: See Your Subscriptions

**Copy & Paste This into Supabase SQL Editor:**

```sql
-- HOW MANY USERS BY STATUS?
SELECT 
  subscription_status,
  COUNT(*) as user_count,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM users), 2) as percentage
FROM users
GROUP BY subscription_status
ORDER BY user_count DESC;
```

**You'll see**: Total paid vs trial vs canceled users

---

## 📈 This Week: See Your Activity

**Copy & Paste:**

```sql
-- MESSAGES THIS WEEK BY DAY
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_messages,
  COUNT(DISTINCT user_id) as active_users
FROM messages
WHERE created_at > now() - interval '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**You'll see**: Message volume trend + daily active users

---

## 👥 Top Chatters: See Your Power Users

**Copy & Paste:**

```sql
-- TOP 10 MOST ACTIVE USERS
SELECT 
  u.email,
  COUNT(m.id) as total_messages,
  u.subscription_status,
  MAX(m.created_at) as last_active
FROM messages m
JOIN users u ON m.user_id = u.id
GROUP BY u.id, u.email, u.subscription_status
ORDER BY COUNT(m.id) DESC
LIMIT 10;
```

**You'll see**: Who's using VERA the most

---

## 🚀 How to Access

1. Go to **https://supabase.com** → Sign in with your account
2. Select **vera-nextjs** project
3. Click **SQL Editor** (left sidebar)
4. Paste any query above
5. Click **Run** (or Ctrl+Enter)
6. **Enjoy your data!**

---

## 📊 Other Useful Queries

### Trial Status (Expiring Soon)
```sql
SELECT 
  COUNT(*) as active_trials,
  COUNT(CASE WHEN trial_end < now() + interval '24 hours' THEN 1 END) as expiring_24h
FROM users
WHERE subscription_status = 'trialing' AND trial_end > now();
```

### Conversion Rate
```sql
SELECT 
  COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as paid_users,
  COUNT(CASE WHEN subscription_status = 'trialing' THEN 1 END) as trial_users,
  ROUND(
    100.0 * COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) / 
    NULLIF(COUNT(*), 0),
    2
  ) as conversion_rate_pct
FROM users;
```

### Signup Trend (Last 7 Days)
```sql
SELECT 
  DATE(created_at) as signup_date,
  COUNT(*) as new_signups
FROM users
WHERE created_at > now() - interval '7 days'
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;
```

### Inactive Users (No Messages in 7 Days)
```sql
SELECT COUNT(*) as inactive_7d_plus
FROM users u
LEFT JOIN messages m ON u.id = m.user_id
GROUP BY u.id
HAVING MAX(m.created_at) < now() - interval '7 days' OR MAX(m.created_at) IS NULL;
```

---

## 🔗 Docs

- **Full SQL Queries**: See `SQL_QUERIES.md` for 25+ advanced queries
- **Performance Analysis**: See `VERA_PERFORMANCE_ANALYSIS.md` for system health & benchmarks
- **Health Check**: Visit `/api/health` on production for real-time status

---

## ⚡ Pro Tips

- **Fastest**: Just run the first 3 queries above = you'll know everything important
- **Export**: Click download icon in Supabase to export as CSV → paste in Google Sheets
- **Automate**: Copy these queries to Google Sheets with `=IMPORTDATA()` for daily updates
- **Share**: Export CSV and send to team/investors
- **Bookmark**: These 3 queries are your go-to metrics dashboard

---

**Questions?** Check the full docs or visit `/api/health` to verify systems are green ✅
