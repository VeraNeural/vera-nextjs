# ✅ SUPABASE EMAIL COLLECTION - VERIFICATION GUIDE

## 🎯 Current Status: **READY TO COLLECT EMAILS**

Your Supabase is now fully configured to collect all user emails. Here's how:

---

## 📊 Email Collection Flow

```
User Lands on Landing Page (index.html)
         ↓
User Clicks "Start Free Trial" Button
         ↓
Redirected to https://www.veraneural.ai/login
         ↓
Enters Email in MagicLinkForm
         ↓
Form POSTs to /api/auth/magic-link
         ↓
✅ EMAIL SAVED IN:
   - Supabase Auth (auth.users table)
   - Custom users table (with trial info)
         ↓
Magic Link Email Sent via Resend
         ↓
User Clicks Magic Link
         ↓
Magic Link Verified at /api/auth/callback
         ↓
✅ SESSION CREATED & USER LOGGED IN
         ↓
Redirected to /chat-exact
```

---

## 🔐 Environment Variables Configured

✅ **SUPABASE_URL**: `https://dscuttqnroyqigunymxh.supabase.co`
✅ **SUPABASE_SERVICE_ROLE_KEY**: Configured in `.env.local`
✅ **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Configured in `.env.local`
✅ **RESEND_API_KEY**: Configured in `.env.local` (for email delivery)

---

## 📧 Where Emails Are Stored

### 1. **Supabase Auth** (Primary)
   - Location: `auth.users` table in Supabase
   - Contains: Email, user ID, created_at, last_sign_in_at
   - Managed by: Supabase Auth system
   - Access: Via dashboard or API

### 2. **Custom Users Table** (Secondary)
   - Location: `public.users` table in Supabase
   - Columns:
     ```
     - id (UUID, links to auth.users.id)
     - email (TEXT, copied from auth)
     - subscription_status (TEXT: 'trialing', 'active', 'canceled')
     - trial_start (TIMESTAMP)
     - trial_end (TIMESTAMP - default +48 hours)
     - created_at (TIMESTAMP)
     ```
   - Purpose: Track subscription and trial status

---

## 🚀 How to Verify Emails Are Being Collected

### **Option 1: Supabase Dashboard** (Easiest)
1. Go to: https://app.supabase.com
2. Select project: `vera-nextjs`
3. Go to **Authentication > Users**
4. You'll see all emails that have signed up
5. Click on a user to see their profile

### **Option 2: Query via API**
```bash
curl -X GET "https://dscuttqnroyqigunymxh.supabase.co/rest/v1/users" \
  -H "Authorization: Bearer SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

### **Option 3: View in Database**
```sql
-- See all emails in custom users table
SELECT id, email, subscription_status, trial_end, created_at 
FROM users 
ORDER BY created_at DESC;

-- See all auth users
SELECT email, created_at, last_sign_in_at 
FROM auth.users 
ORDER BY created_at DESC;
```

---

## 🔑 API Endpoints for Email Handling

### **POST /api/auth/magic-link**
Collects email and sends magic link
- **Request**: `{ "email": "user@example.com" }`
- **Response**: `{ "success": true, "via": "resend" or "supabase" }`
- **Email Storage**: Email stored in both auth and users table

### **GET /api/auth/callback**
Verifies magic link and creates session
- **Params**: `token_hash={token}&type=email`
- **Action**: 
  - Verifies token
  - Creates session
  - Stores user in `users` table with trial dates
  - Redirects to `/chat-exact`

### **GET /api/auth/session**
Returns current user session
- **Returns**: Session data with user email

---

## ✅ Verification Checklist

Run this before launch:

```bash
# 1. Build succeeds with no env errors
npm run build
# Expected: ✅ Compiled successfully

# 2. Dev server starts
npm run dev
# Expected: ✅ Ready in X seconds

# 3. Check Supabase connectivity
curl https://dscuttqnroyqigunymxh.supabase.co
# Expected: ✅ Response from Supabase

# 4. Check auth endpoint
curl -X POST http://localhost:3001/api/health/supabase
# Expected: ✅ Supabase health check response
```

---

## 📈 Monitor Email Collection in Real-Time

### **Supabase Dashboard**
1. https://app.supabase.com/project/dscuttqnroyqigunymxh
2. Click **Authentication** sidebar
3. Click **Users** tab
4. See live list of signups

### **Email Logs**
1. Go to **Authentication > Providers > Email**
2. See all magic link emails sent
3. Check delivery status

### **API Logs**
Check these endpoints for errors:
- `/api/health/supabase` - Supabase status
- `/api/health/resend` - Email service status
- `/api/auth/magic-link` - Error logs if email fails

---

## 🚨 Troubleshooting

### **Email not received?**
1. Check Supabase Auth logs: https://app.supabase.com/project/dscuttqnroyqigunymxh/auth/user
2. Check Resend dashboard for bounce/delivery issues
3. Check spam folder
4. Verify RESEND_API_KEY is correct

### **Email stored but no session created?**
1. Check `/api/auth/callback` logs
2. Verify magic link token is valid (expires in 60 min)
3. Check browser cookies are being set
4. Verify `NEXT_PUBLIC_APP_URL` is correct

### **Database errors?**
1. Check Supabase status: https://status.supabase.com
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Check RLS policies on `users` table
4. Run: `npm run build` to check env validation

---

## 🎯 What's Working

✅ **Environment Variables**: All configured in `.env.local`
✅ **Build Process**: Succeeds with no TypeScript errors
✅ **Magic Link System**: Email generation functional
✅ **Supabase Connection**: Service role key configured
✅ **Email Collection**: Dual storage (Auth + Custom table)
✅ **Trial System**: 48-hour default configured
✅ **Email Service**: Resend API configured

---

## 📝 Database Schema (users table)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  
  -- Subscription
  subscription_status TEXT DEFAULT 'trialing',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Trial
  trial_start TIMESTAMP DEFAULT now(),
  trial_end TIMESTAMP DEFAULT (now() + INTERVAL '48 hours'),
  trial_messages_used INT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own data
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);
```

---

## 🎊 You're All Set!

Your email collection system is **production-ready**. 

**Next Steps:**
1. ✅ Environment variables configured
2. ✅ Build verified
3. ✅ Email system tested
4. Deploy to Vercel
5. Monitor emails at https://app.supabase.com

**To see all collected emails:**
- Go to: https://app.supabase.com/project/dscuttqnroyqigunymxh/auth/users
- Or query: `SELECT email FROM users ORDER BY created_at DESC;`

---

**Questions?** Check the logs at `/api/health/supabase` for real-time diagnostics.
