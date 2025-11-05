# 🧪 VERA End-to-End Testing Guide

## Pre-Test Setup Checklist

### ✅ Database Migration
```sql
-- Run in Supabase SQL Editor:
-- Execute: supabase-subscription-migration.sql
-- Verify: SELECT * FROM users LIMIT 1; (check new columns exist)
-- Test function: SELECT is_user_access_active('some-uuid');
```

### ✅ Environment Variables
```env
# Copy to .env.local (verify all are set)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_MONTHLY=
STRIPE_PRICE_YEARLY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### ✅ Audio Files
```
Place your Freesound downloads in:
public/sounds/
  - rain.mp3
  - ocean.mp3
  - forest.mp3
  - wind.mp3
  - fire.mp3
  - night.mp3
```

---

## 🎯 Test Plan

### Test 1: Fresh User Signup & Trial
**Objective**: Verify trial is created correctly

1. **Clear browser data** (or use incognito)
2. Navigate to `/login`
3. Enter email: `test+trial1@yourdomain.com`
4. Check email for magic link
5. Click magic link → Should redirect to chat

**✅ Verify**:
- User lands on chat page
- Can send messages
- Check database:
  ```sql
  SELECT id, email, trial_start, trial_end, subscription_status 
  FROM users 
  WHERE email = 'test+trial1@yourdomain.com';
  ```
- `trial_start` = NOW()
- `trial_end` = NOW() + 48 hours
- `subscription_status` = 'trialing'

---

### Test 2: Core Chat Features
**Objective**: Test all chat modes and features

#### A. Basic Therapeutic Chat
1. Type: "I'm feeling anxious about work"
2. **✅ Verify**: VERA responds with therapeutic mode
3. **✅ Verify**: Message saved to database
4. **✅ Verify**: Thread created with title

#### B. Real Talk Mode (Auto-Detection)
1. Type: "Can you help me with my resume?"
2. **✅ Verify**: Auto-switches to Real Talk mode
3. **✅ Verify**: Response is casual/practical (not therapeutic)

#### C. Decode Mode
1. Type: "I need a deep decode of my patterns"
2. **✅ Verify**: Routes to OpenAI
3. **✅ Verify**: Response has structured decode format

#### D. Voice Input (STT)
1. Click microphone button
2. Allow browser microphone access
3. Speak: "Can you hear me?"
4. **✅ Verify**: Text appears in input field
5. **✅ Verify**: Can send voice-transcribed message

#### E. Voice Output (TTS)
1. Send any message
2. Click speaker button on VERA's response
3. **✅ Verify**: Audio plays through ElevenLabs
4. **✅ Verify**: No "asterisk asterisk" (markdown stripped)

#### F. Image Upload
1. Click attachment button
2. Select an image file
3. **✅ Verify**: Image preview shows
4. Add message: "What do you see in this image?"
5. Send
6. **✅ Verify**: Claude Vision analyzes the image
7. **✅ Verify**: Image displays in message bubble

#### G. Ambient Sounds
1. Click nature/leaf icon
2. **✅ Verify**: Audio plays from local file
3. **✅ Verify**: Icon shows playing state
4. Click again
5. **✅ Verify**: Audio stops

---

### Test 3: Trial Protection
**Objective**: Verify chat blocks after trial expires

1. Open database
2. Update trial_end to past:
   ```sql
   UPDATE users 
   SET trial_end = NOW() - INTERVAL '1 hour'
   WHERE email = 'test+trial1@yourdomain.com';
   ```
3. Refresh page
4. Try to send message
5. **✅ Verify**: TrialExpiredModal appears
6. **✅ Verify**: Cannot send messages
7. **✅ Verify**: API returns 403 with `subscription_required`

---

### Test 4: Stripe Checkout Flow
**Objective**: Test subscription purchase (TEST MODE)

#### A. Monthly Subscription
1. Click "Upgrade" or "Continue with VERA" in modal
2. Should redirect to `/pricing`
3. Click "Subscribe Monthly" button
4. **✅ Verify**: Redirects to Stripe Checkout
5. **✅ Verify**: Shows "$12.00 / month"
6. Use test card: `4242 4242 4242 4242`
7. Expiry: `12/30`, CVC: `123`
8. Complete payment
9. **✅ Verify**: Redirects back to `/dashboard` (or chat)
10. **✅ Verify**: Can send messages again

#### B. Check Database After Payment
```sql
SELECT 
  email,
  subscription_status,
  subscription_plan,
  stripe_customer_id,
  stripe_subscription_id,
  trial_end,
  subscription_current_period_end
FROM users 
WHERE email = 'test+trial1@yourdomain.com';
```

**✅ Expected**:
- `subscription_status` = 'active'
- `subscription_plan` = 'month'
- `stripe_customer_id` = 'cus_...'
- `stripe_subscription_id` = 'sub_...'
- `trial_end` = NULL (cleared)
- `subscription_current_period_end` = 1 month from now

#### C. Check Stripe Dashboard
1. Go to Stripe Dashboard → Payments
2. **✅ Verify**: Payment appears with status "Succeeded"
3. Go to Customers
4. **✅ Verify**: Customer created with correct email
5. Go to Subscriptions
6. **✅ Verify**: Active subscription shows

---

### Test 5: Subscription Management
**Objective**: Test customer portal access

1. Navigate to `/pricing`
2. **✅ Verify**: Shows "Active Subscription" status
3. **✅ Verify**: Shows subscription plan (monthly)
4. **✅ Verify**: Shows renewal date
5. Click "Manage Billing"
6. **✅ Verify**: Opens Stripe Customer Portal
7. **✅ Verify**: Can view invoices
8. **✅ Verify**: Can update payment method
9. Click "Cancel subscription" (in test mode!)
10. Confirm cancellation
11. Return to VERA
12. **✅ Verify**: subscription_status = 'canceled' in database

---

### Test 6: Yearly Subscription
**Objective**: Test yearly plan

1. Create new user: `test+yearly@yourdomain.com`
2. Complete signup
3. Manually expire trial (same SQL as Test 3)
4. Click upgrade → `/pricing`
5. Click "Subscribe Yearly"
6. **✅ Verify**: Stripe shows "$99.00 / year"
7. Complete with test card
8. **✅ Verify**: subscription_plan = 'year' in database

---

### Test 7: Webhook Verification (After Deployment)
**Objective**: Verify webhook receives events

This test requires deployment to Vercel first.

1. Deploy to Vercel
2. Add webhook in Stripe: `https://your-domain.vercel.app/api/stripe/webhook`
3. Complete a test payment
4. Go to Stripe → Webhooks → Your endpoint
5. **✅ Verify**: Shows recent events received
6. **✅ Verify**: `checkout.session.completed` event successful
7. Click event → View webhook logs
8. **✅ Verify**: Response was 200 OK

---

### Test 8: Error Handling
**Objective**: Verify graceful failures

#### A. Network Error
1. Open DevTools → Network tab
2. Set to "Offline"
3. Try to send message
4. **✅ Verify**: Shows error message
5. **✅ Verify**: Message not added to chat
6. **✅ Verify**: Can retry after going online

#### B. API Error
1. Temporarily break ANTHROPIC_API_KEY (add "X" to end)
2. Try to send message
3. **✅ Verify**: Shows error message
4. **✅ Verify**: Doesn't crash app
5. Fix API key

#### C. Stripe Error
1. Use declined test card: `4000 0000 0000 0002`
2. Try to subscribe
3. **✅ Verify**: Stripe shows error
4. **✅ Verify**: Returns to pricing page
5. **✅ Verify**: subscription_status still 'trialing' (not changed)

---

### Test 9: Session Persistence
**Objective**: Verify thread/message persistence

1. Send 3 messages in chat
2. Close browser tab
3. Open new tab → Navigate to app
4. **✅ Verify**: Same conversation loads
5. **✅ Verify**: Messages in correct order
6. **✅ Verify**: Can continue conversation

---

### Test 10: Multiple Devices/Sessions
**Objective**: Test concurrent access

1. Log in on Chrome
2. Log in on Firefox (same user)
3. Send message from Chrome
4. **✅ Verify**: Message appears in database
5. Refresh Firefox
6. **✅ Verify**: Message appears in Firefox
7. Send from Firefox
8. Refresh Chrome
9. **✅ Verify**: Message appears in Chrome

---

## 🐛 Common Issues & Fixes

### Issue: Trial not created on signup
**Check**:
- Callback route has user creation code
- Database migration ran successfully
- User record exists in database

### Issue: Messages not saving
**Check**:
- Thread ID exists
- User authenticated
- Supabase RLS policies allow inserts

### Issue: TTS not working
**Check**:
- ELEVENLABS_API_KEY valid
- ELEVENLABS_VOICE_ID correct
- Browser allows audio autoplay

### Issue: Image upload fails
**Check**:
- File size under 4MB
- ANTHROPIC_API_KEY has vision access
- Base64 encoding working

### Issue: Webhook not receiving events
**Check**:
- Webhook URL correct (https, not http)
- STRIPE_WEBHOOK_SECRET matches dashboard
- Events selected in Stripe webhook config
- Response returning 200 OK

### Issue: Stripe checkout fails
**Check**:
- STRIPE_SECRET_KEY valid (starts with sk_test_)
- Price IDs correct (starts with price_)
- Customer creation working
- NEXT_PUBLIC_APP_URL set correctly

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

[ ] Test 1: Fresh User Signup & Trial
[ ] Test 2A: Basic Therapeutic Chat
[ ] Test 2B: Real Talk Mode
[ ] Test 2C: Decode Mode
[ ] Test 2D: Voice Input (STT)
[ ] Test 2E: Voice Output (TTS)
[ ] Test 2F: Image Upload
[ ] Test 2G: Ambient Sounds
[ ] Test 3: Trial Protection
[ ] Test 4: Stripe Checkout Flow
[ ] Test 5: Subscription Management
[ ] Test 6: Yearly Subscription
[ ] Test 7: Webhook Verification (post-deploy)
[ ] Test 8: Error Handling
[ ] Test 9: Session Persistence
[ ] Test 10: Multiple Devices

Notes:
_________________________________
_________________________________
_________________________________
```

---

## ✅ Production Readiness Checklist

Before going live:

- [ ] All tests pass
- [ ] Webhook configured and tested
- [ ] Switch to Stripe live keys
- [ ] Update NEXT_PUBLIC_APP_URL to production domain
- [ ] Test with real payment (small amount)
- [ ] Verify email delivery works
- [ ] Check error logging (Sentry/LogRocket)
- [ ] Monitor Stripe webhook success rate
- [ ] Set up subscription failure alerts
- [ ] Document customer support procedures

---

## 🚀 Ready to Test!

Start with **Test 1** and work through sequentially. Mark each test as you complete it. Good luck! 🎉
