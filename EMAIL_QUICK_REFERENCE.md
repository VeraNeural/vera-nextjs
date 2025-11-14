# 📧 SUPABASE EMAIL COLLECTION - QUICK REFERENCE

## ✅ Status: READY

Your Supabase is now collecting all user emails. Here's everything you need to know:

---

## 🎯 Where Emails Go

| Storage | Location | Purpose |
|---------|----------|---------|
| **Supabase Auth** | `auth.users` table | Primary authentication |
| **Custom Table** | `users` table | Trial tracking & subscription |

---

## 📊 Flow (10 seconds)

1. User lands on landing page
2. Clicks "Start Free Trial" → Goes to `/login`
3. Enters email → Form sends to `/api/auth/magic-link`
4. **✅ EMAIL STORED** in Supabase
5. Magic link emailed via Resend
6. User clicks link → Logged into `/chat-exact`

---

## 🔧 Environment (VERIFIED)

```
✅ SUPABASE_URL: https://dscuttqnroyqigunymxh.supabase.co
✅ SUPABASE_SERVICE_ROLE_KEY: Configured
✅ RESEND_API_KEY: Configured
✅ STRIPE_PRICES: All configured
✅ BUILD: npm run build → ✅ SUCCESS
✅ DEV: npm run dev → ✅ RUNNING on :3001
```

---

## 📱 View Collected Emails

### Option 1: Dashboard (Easiest)
→ https://app.supabase.com/project/dscuttqnroyqigunymxh/auth/users

### Option 2: SQL Query
```sql
SELECT email, created_at FROM users ORDER BY created_at DESC;
```

### Option 3: API
```bash
curl http://localhost:3001/api/health/supabase
# Returns: {"ok": true, "reachable": true}
```

---

## 🚀 Deploy to Production

```bash
# Everything is ready - just push
git push origin master

# Vercel will auto-deploy
# Monitor at: https://vercel.com/VeraNeural/vera-nextjs
```

---

## ✨ What Happens at Each Step

### Landing Page (index.html)
- 4-phase animation sequence
- "Start Free Trial" button links to login
- **Files**: `public/index.html`

### Login (MagicLinkForm)
- Email input field
- Sends to `/api/auth/magic-link`
- Shows "Check your email" after submit
- **Files**: `src/app/login/page.tsx`, `src/components/auth/MagicLinkForm.tsx`

### Email Capture
- Email verified and stored
- Magic link generated
- Beautiful branded email sent
- **Files**: `src/app/api/auth/magic-link/route.ts`
- **Storage**: `auth.users` + `users` table

### Magic Link Click
- Token verified
- Session created
- User logged in
- Redirected to chat
- **Files**: `src/app/api/auth/callback/route.ts`

### Chat (Logged In)
- User can chat with VERA
- Email tied to messages
- Trial timer running (48 hours)
- **Files**: `src/app/chat-exact/page.tsx`

---

## 🔐 Database Schema

```sql
users table:
├── id (UUID) - Links to auth.users
├── email (TEXT) - ← YOUR COLLECTED EMAIL
├── subscription_status - trialing | active | canceled
├── trial_start (TIMESTAMP)
├── trial_end (TIMESTAMP, +48 hours)
├── created_at (TIMESTAMP)
└── stripe_customer_id (for payments)
```

---

## 📋 API Endpoints

```
POST /api/auth/magic-link
  → Captures email, sends magic link, stores in DB

GET /api/auth/callback?token_hash={token}&type=email
  → Verifies token, creates session, logs user in

GET /api/health/supabase
  → Returns Supabase connection status
```

---

## ⚠️ If Something Goes Wrong

### Build fails
```bash
npm run build
# If it fails, check:
cat .env.local | grep STRIPE
# Make sure all 4 STRIPE_PRICE_* are set
```

### Email not captured
1. Check Supabase dashboard for auth users
2. Check `/api/health/supabase` endpoint
3. Check `.env.local` has SUPABASE_SERVICE_ROLE_KEY

### Email not delivered
1. Check Resend dashboard for bounce
2. Check spam folder
3. Verify RESEND_API_KEY in `.env.local`

---

## 📈 Metrics to Track

- **Total signups**: Count in `auth.users` table
- **Trial users**: Count where `subscription_status = 'trialing'`
- **Conversions**: Count where `subscription_status = 'active'`
- **Email deliverability**: Check Resend dashboard

---

## 🎯 You're All Set!

✅ Supabase configured
✅ Emails being captured
✅ Magic link working
✅ Build ready
✅ Ready to deploy

**Monitor live at**: https://app.supabase.com/project/dscuttqnroyqigunymxh/auth/users

---

**Test It**: Sign up at https://www.veraneural.ai/login and watch the email appear instantly!
