# 🚀 Quick Start - Testing VERA Now!

## ⚡ Immediate Next Steps (5 minutes)

### 1. Add Stripe Price IDs (2 min)
Open `.env.local` and add these lines:
```env
STRIPE_PRICE_MONTHLY=price_xxx  # Get from Stripe Dashboard → Products
STRIPE_PRICE_YEARLY=price_xxx   # Get from Stripe Dashboard → Products
```

**To get these:**
- Go to https://dashboard.stripe.com/test/products
- Click your Monthly product → Copy the Price ID (starts with `price_`)
- Click your Yearly product → Copy the Price ID
- Paste into .env.local

### 2. Add Audio Files (2 min)
- Copy your Freesound downloads to `public/sounds/`
- Rename them: `rain.mp3`, `ocean.mp3`, `forest.mp3`, `wind.mp3`, `fire.mp3`, `night.mp3`
- (See `public/sounds/README.md` for details)

### 3. Run Database Migration (1 min)
- Open Supabase Dashboard → SQL Editor
- Copy contents of `supabase-subscription-migration.sql`
- Paste and click "Run"
- Should see "Success. No rows returned"

---

## 🧪 Start Testing (10 minutes)

### Run Dev Server
```bash
npm run dev
```

### Test Checklist (Quick Version)

#### ✅ Test 1: Fresh Signup (2 min)
- [ ] Go to http://localhost:3000/login
- [ ] Enter email: `test1@yourdomain.com`
- [ ] Check email → Click magic link
- [ ] Lands on chat page ✓

**Verify in database:**
```sql
SELECT email, trial_end, subscription_status FROM users 
WHERE email = 'test1@yourdomain.com';
```
- Should show trial_end ~48 hours from now

#### ✅ Test 2: Send Messages (2 min)
- [ ] Type: "I'm feeling anxious" → Send
- [ ] VERA responds ✓
- [ ] Click microphone → Speak → Text appears ✓
- [ ] Click speaker on response → Audio plays ✓

#### ✅ Test 3: Image Upload (1 min)
- [ ] Click attachment button
- [ ] Select an image
- [ ] Type: "What's in this image?"
- [ ] Send → VERA describes image ✓

#### ✅ Test 4: Ambient Sounds (30 sec)
- [ ] Click nature/leaf icon
- [ ] Audio plays (if you added files) ✓
- [ ] Click again → Stops ✓

#### ✅ Test 5: Trial Expiration (2 min)
Update in Supabase:
```sql
UPDATE users SET trial_end = NOW() - INTERVAL '1 hour'
WHERE email = 'test1@yourdomain.com';
```
- [ ] Refresh page
- [ ] Try to send message
- [ ] Modal appears: "Your Trial Has Ended" ✓
- [ ] Cannot send messages ✓

#### ✅ Test 6: Stripe Checkout (3 min)
- [ ] Click "Continue with VERA" in modal
- [ ] Redirects to /pricing ✓
- [ ] Click "Subscribe Monthly"
- [ ] Stripe checkout appears ✓
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete payment
- [ ] Redirects back ✓
- [ ] Can send messages again ✓

**Verify in database:**
```sql
SELECT subscription_status, stripe_customer_id, trial_end 
FROM users WHERE email = 'test1@yourdomain.com';
```
- subscription_status = 'active'
- trial_end = NULL
- stripe_customer_id = 'cus_...'

---

## 🎉 If All Tests Pass

You're ready for production! Just need to:
1. Deploy to Vercel
2. Add webhook URL to Stripe
3. Switch to live Stripe keys
4. Go live!

---

## 🐛 If Something Fails

Check the detailed troubleshooting in `TESTING-GUIDE.md`

Common quick fixes:
- **Can't log in**: Check NEXT_PUBLIC_SUPABASE_URL and ANON_KEY
- **Messages don't send**: Check ANTHROPIC_API_KEY
- **TTS doesn't work**: Check ELEVENLABS_API_KEY
- **Stripe checkout fails**: Check STRIPE_SECRET_KEY and Price IDs
- **Audio doesn't play**: Make sure files are in public/sounds/

---

## 📊 Current Status

Run this anytime to check setup:
```bash
node scripts/verify-setup.js
```

---

**Let's go! Start with adding Price IDs, then run the migration, then start testing! 🚀**
