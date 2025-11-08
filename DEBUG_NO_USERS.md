# Database Debugging Guide - "Shows No Rows"

## Problem
You see 6 users signed up, but SQL queries return 0 rows.

## Root Causes (in order of likelihood)

### 1. **RLS Policies Blocking You** (Most likely)
Row Level Security policies prevent you from seeing OTHER users' data. Even admin queries are blocked!

**Fix**: Run this in Supabase SQL Editor:
```sql
-- Bypass RLS to see all users
SELECT 
  id,
  email,
  subscription_status,
  trial_end,
  created_at
FROM users
ORDER BY created_at DESC;
```

**If THIS returns 0 rows** → Go to next step

---

### 2. **Users in auth.users but NOT in public.users**
Users signed up in Supabase Auth, but callback didn't create `public.users` records.

**Check this:**
```sql
SELECT COUNT(*) as auth_users FROM auth.users;
SELECT COUNT(*) as public_users FROM users;
```

**Results:**
- If `auth_users = 6` but `public_users = 0` → **Callback bug** (see step 3)
- If both are 0 → **No signups recorded** (see step 4)
- If `public_users = 6` → **Data exists!** (go back to step 1, it's RLS)

---

### 3. **Callback Not Creating User Records**

**Why**: Service role key missing, RLS policy blocks insert, or auth callback errored silently

**Check logs**:
1. Go to **Vercel Dashboard** → Your project
2. Click **Logs** tab
3. Search for: `Failed to create user entry`
4. Look at the error message

**Manual fix** (if needed):
```sql
-- Create missing user records from auth.users
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
WHERE u.id IS NULL;
```

This creates `public.users` records for all auth users missing them.

---

### 4. **No Signups Actually Recorded**

**If both `auth.users` and `public.users` are 0:**

Check these:

**a) Check Supabase project connection**
```javascript
// In browser console on your app:
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Project ID:', new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname);
```

Make sure it matches your actual Supabase project.

**b) Check if signup is actually calling Supabase**
1. Open browser DevTools → Network tab
2. Go to your app and click "Sign up"
3. Look for requests to `supabase.co` or `api.supabase.io`
4. Should see POST to `/auth/v1/otp` or similar

If NO requests to Supabase → **signup form not connected**

**c) Check if emails are being sent**
1. Go to **Supabase Dashboard**
2. Go to **Auth** → **Users** tab
3. Should show users here even if no `public.users` records
4. If nothing here → **Signup never reached Supabase**

---

## Step-by-Step Debugging (Do This Now)

### Step 1: Run diagnostic query
```sql
-- Copy entire DIAGNOSE_DATABASE.sql and run it
-- Look for these results:
```

**Expected if working:**
```
total_auth_users: 6
total_public_users: 6
```

**If you see:**
```
total_auth_users: 6
total_public_users: 0
```
→ **Callback bug**, go to Step 2

**If you see:**
```
total_auth_users: 0
total_public_users: 0
```
→ **No signups recorded**, go to Step 3

---

### Step 2: Check callback errors (if Step 1 shows mismatch)

**Run this query:**
```sql
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE WHEN u.id IS NULL THEN '❌ NO PUBLIC RECORD' ELSE '✅ EXISTS' END as status
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
ORDER BY au.created_at DESC;
```

**If you see users with "NO PUBLIC RECORD":**
- The callback failed silently
- Check Vercel logs: `Failed to create user entry: [error message]`
- Most likely: Service role key not set correctly

**Fix service role key:**
1. Go to **Supabase Dashboard** → **Project Settings** → **API**
2. Copy **Service Role** (not anon key)
3. Go to **Vercel** → Your project → **Settings** → **Environment Variables**
4. Find `SUPABASE_SERVICE_ROLE_KEY`
5. Paste correct key
6. Redeploy: `vercel --prod`

---

### Step 3: Check if signups are being received

**Go to Supabase Dashboard:**
1. Select your project
2. Click **Auth** (left sidebar)
3. Click **Users** tab
4. Should show email addresses of people who signed up

**If Users tab is empty:**
- Signups never reached Supabase
- Check your signup form calls the right Supabase endpoint
- Check API keys are correct in your `.env.local`

**If Users tab shows 6 emails:**
- Go back to Step 1, the data exists but RLS is blocking you

---

## Most Likely Scenario

You probably have data but **RLS policies are blocking you from seeing it**.

**Quick test:**
```sql
-- This should show all users (bypassing your RLS policy)
SELECT COUNT(*) FROM users;
```

**If this returns 0:** Data really doesn't exist (do Step 2/3)  
**If this returns >0:** Data exists but RLS blocking! (do Step 4)

---

## Step 4: Fix RLS (if data exists but hidden)

RLS policies are security features that hide OTHER users from you. Even admin queries are blocked by default.

**Solution**: Use service role to bypass RLS

**In TypeScript (backend):**
```typescript
// Use createServiceClient instead of regular client
const supabase = createServiceClient();
const { data } = await supabase.from('users').select('*');
// This bypasses RLS and shows ALL users
```

**In SQL directly (one-time check):**
```sql
-- Disable RLS temporarily (for debugging only!)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

SELECT COUNT(*) FROM users;

-- Re-enable immediately
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

---

## The Real Solution

Your data probably EXISTS but is just HIDDEN by RLS.

**To see all users from Supabase Dashboard:**
1. Go to **Supabase Dashboard**
2. Click **SQL Editor**
3. Run: `SELECT * FROM users;`

This SQL editor bypasses RLS automatically (you're authenticated as admin).

**If this shows 6 users:**
- ✅ Your data is there!
- The issue is RLS policies on the API
- Not a data problem, just visibility

---

## Quick Checklist

- [ ] Run DIAGNOSE_DATABASE.sql
- [ ] Note results for `total_auth_users` and `total_public_users`
- [ ] Check if they match (both should be 6)
- [ ] If mismatch: Check Vercel logs for callback errors
- [ ] If match but still can't query: It's RLS blocking you
- [ ] Go to Supabase SQL Editor and run query directly
- [ ] If works there: API is working, just RLS restricting
- [ ] If returns 0: Data really doesn't exist, debug signup flow

---

## Need Help?

**Send me:**
1. Results from DIAGNOSE_DATABASE.sql
2. Errors from Vercel logs (if any)
3. What you see in Supabase Dashboard → Auth → Users

Then I can tell you exactly what's wrong and how to fix it!
