# 🚀 VERA Deployment Guide

**Status**: ✅ Ready for Production Deployment

---

## 📋 Pre-Deployment Checklist

- ✅ All TypeScript errors fixed
- ✅ Chat endpoint wired to OpenAI
- ✅ Landing page connected to chat
- ✅ Environment variables configured
- ✅ Database schema ready

---

## 🔗 Deployment Steps (Vercel)

### Option 1: Deploy via GitHub (Recommended)

1. **Commit your changes**:
```bash
cd c:\Users\elvec\Desktop\vera-nextjs
git add -A
git commit -m "feat: deploy VERA with landing page and chat integration"
git push origin hardening-finalize-stripe-logger-fallback
```

2. **Create Pull Request** on GitHub
   - Go to https://github.com/VeraNeural/vera-nextjs
   - Click "Pull requests" → "New pull request"
   - Compare `master` ← `hardening-finalize-stripe-logger-fallback`
   - Click "Create pull request"
   - Merge after checks pass

3. **Vercel Auto-Deploy**
   - Vercel watches your main branch
   - Deployment starts automatically
   - Takes ~3-5 minutes
   - You'll see URL at https://vercel.com/vera-neural

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# You'll get a URL like:
# https://vera-nextjs-git-hardening-finalize-stripe-logger-fallback-evas-projects.vercel.app
```

---

## ✅ What Gets Deployed

### Landing Page Flow
```
veraneural.ai (root)
  ↓
Shows animated landing page
  ↓
"Chat with VERA" button
  ↓
/chat-exact (authenticated users) OR /login (new users)
```

### Routes Live
- `GET /` - Landing page (unauthenticated) → redirects to /chat-exact (authenticated)
- `POST /api/chat` - Chat endpoint (wired to OpenAI GPT-4o-mini)
- `GET /api/health` - System health check
- `GET /login` - Login page
- `GET /chat-exact` - Main chat interface
- `POST /api/billing/checkout` - Stripe checkout
- `POST /api/stripe/webhook` - Stripe webhook

---

## 📊 Your Current Deployment URL

Based on your `.env.local`:
```
NEXT_PUBLIC_APP_URL=https://www.veraneural.ai
```

**Your production site**: https://www.veraneural.ai

---

## 🧪 Verification Steps (After Deployment)

### 1. Check Landing Page
```
https://www.veraneural.ai
```
Should show:
- ✅ Animated breathing orb
- ✅ Demo chat messages
- ✅ "Chat with VERA" button
- ✅ Button links to `/chat`

### 2. Test Unauthenticated Flow
- Visit https://www.veraneural.ai
- Click "Chat with VERA"
- Should redirect to `/login`
- Enter test email
- Check inbox for magic link

### 3. Test Chat Message
- Log in with magic link
- You should land on `/chat-exact`
- Type: "I'm feeling anxious"
- Send message
- Should get **REAL AI RESPONSE** from OpenAI (not echo!)

### 4. Check API Health
```bash
curl https://www.veraneural.ai/api/health
```

Should return:
```json
{
  "ok": true,
  "checks": {
    "config": { "ok": true },
    "supabase": { "ok": true },
    "openai": { "ok": true }
  }
}
```

---

## 🔐 Environment Variables Needed on Vercel

Go to Vercel Dashboard → Settings → Environment Variables

Add these (copy from your `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
ELEVENLABS_API_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
RESEND_API_KEY=...
NEXT_PUBLIC_APP_URL=https://www.veraneural.ai
(and others from .env.local)
```

---

## 📱 Quick Deploy Command

If using Vercel CLI:
```bash
cd c:\Users\elvec\Desktop\vera-nextjs
vercel --prod
```

This will:
1. Build your Next.js app
2. Run tests
3. Deploy to production
4. Give you a URL

---

## 🎯 Expected Deployment URL Format

- **Production**: https://www.veraneural.ai
- **Preview**: https://vera-nextjs-[hash]-evas-projects.vercel.app

---

## ❌ Troubleshooting

### "Chat returns echo instead of AI response"
- Check `OPENAI_API_KEY` is set in Vercel env vars
- Verify API key is valid: https://platform.openai.com/account/billing/overview

### "Landing page doesn't show"
- Check `/public/landing.html` exists
- Verify Next.js is serving static files
- Check Vercel logs for errors

### "Login doesn't work"
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify Resend API key is valid
- Check Supabase auth settings include your domain

### "Chat button doesn't link"
- Verify landing page updated: `/public/landing.html` should have `href="/chat"`
- Rebuild: `npm run build`

---

## 🚀 Ready to Deploy?

**Steps**:
1. ✅ Code is ready (all fixes applied)
2. ⏳ Commit & push to GitHub
3. ⏳ Vercel auto-deploys
4. ⏳ Visit https://www.veraneural.ai
5. ⏳ Test login and chat

**Est. Time**: 5-10 minutes

---

**Questions?** Check:
- Vercel logs: https://vercel.com/vera-neural
- Supabase dashboard: https://app.supabase.com
- OpenAI API status: https://status.openai.com

