# VERA Trial & Subscription System - Implementation Complete

## ✅ What's Been Built

### 1. Database Schema (`supabase-subscription-migration.sql`)
- Trial tracking fields: `trial_start`, `trial_end` (48 hours default)
- Subscription fields: `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`, `subscription_plan`
- Subscription period tracking: `subscription_current_period_end`
- Helper function: `is_user_access_active(user_id)` checks if user has valid access
- Performance indexes on trial_end, subscription_status, stripe_customer_id

### 2. Stripe Integration

#### API Endpoints Created:
- **`/api/stripe/create-checkout`** - Creates Stripe checkout session for monthly/yearly plans
- **`/api/stripe/webhook`** - Handles Stripe events (payment success, subscription updates, cancellations)
- **`/api/stripe/portal`** - Opens Stripe customer portal for subscription management

#### Configuration (`src/lib/stripe/config.ts`):
- Stripe initialization with API version 2025-10-29.clover
- Price IDs from environment variables (STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY)

### 3. Trial Protection

#### Chat API Protection (`src/app/api/chat/route.ts`):
- Checks subscription_status and trial_end before allowing messages
- Returns 403 error with `subscription_required` flag when trial expired
- Development mode bypass for testing

#### Client-Side Handling (`src/hooks/useChat.ts`):
- Detects trial expiration errors from API
- Sets `trialExpired` state to trigger modal
- Prevents further messages until subscription

### 4. User Interface Components

#### `TrialExpiredModal.tsx`:
- Beautiful modal with pricing options ($12/mo, $99/yr)
- Shows features included with subscription
- Direct upgrade button to pricing page
- Cannot be dismissed when trial expired

#### `SubscriptionManagement.tsx`:
- Shows current subscription status
- Trial countdown if active
- Upgrade options with pricing cards
- "Manage Billing" button for active subscribers (opens Stripe portal)

#### Pricing Page (`src/app/pricing/page.tsx`):
- Protected route (requires authentication)
- Shows SubscriptionManagement component
- Clean, beautiful gradient background

### 5. Trial Initialization

#### Magic Link Callback (`src/app/api/auth/magic-link/callback/route.ts`):
- Automatically creates user record on first sign-in
- Sets `trial_end` to 48 hours from sign-up
- Sets initial `subscription_status` to 'trialing'

## 🔄 User Flow

### New User Journey:
1. **Sign Up** → Receives magic link email
2. **Click Link** → Authenticated & trial_end set to +48 hours
3. **Use VERA** → Full access to all features for 48 hours
4. **Trial Countdown** → TrialBanner shows time remaining
5. **Trial Expires** → Chat blocked with TrialExpiredModal
6. **Subscribe** → Stripe checkout → Webhook activates subscription
7. **Full Access** → Unlimited usage with active subscription

### Subscription Flow:
1. User clicks "Upgrade" or "Subscribe" button
2. Redirected to `/pricing` page
3. Chooses Monthly ($12) or Yearly ($99)
4. Redirected to Stripe Checkout
5. Completes payment
6. Webhook receives `checkout.session.completed`
7. Database updated: `subscription_status = 'active'`, trial_end cleared
8. User redirected back to dashboard with full access

### Subscription Management:
1. Active subscribers see "Manage Billing" button
2. Opens Stripe Customer Portal
3. Can update payment method, view invoices, cancel subscription
4. Cancellations handled via webhook → database updated

## 🔐 Security Features

### Multi-Layer Protection:
1. **Email Verification** - Magic link authentication (built-in)
2. **Stripe Payment Fingerprinting** - Stripe automatically detects duplicate customers
3. **Database Constraints** - Unique constraints on stripe_customer_id and email
4. **Server-Side Validation** - All access checks done server-side in API routes

### Trial Abuse Prevention:
- Email must be unique (Supabase auth enforces this)
- Stripe customer ID linked to email (prevents duplicate payments)
- Trial period strictly enforced in database function
- No client-side bypass possible (checks in API)

## 📋 Setup Checklist

### 1. Run Database Migration
```sql
-- Execute in Supabase SQL Editor
-- Copy/paste contents from supabase-subscription-migration.sql
```

### 2. Configure Environment Variables
```bash
# Stripe (Required)
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
STRIPE_PRICE_MONTHLY=price_xxx
STRIPE_PRICE_YEARLY=price_xxx

# Note: STRIPE_WEBHOOK_SECRET added after deployment
```

### 3. Create Stripe Products
1. Go to Stripe Dashboard → Products
2. Create "VERA Monthly" - $12/month recurring
3. Create "VERA Yearly" - $99/year recurring
4. Copy Price IDs to environment variables

### 4. Deploy to Vercel
```bash
vercel --prod
```

### 5. Configure Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET` environment variable
5. Redeploy to Vercel

## 🧪 Testing

### Test Trial Flow:
1. Clear browser data / use incognito
2. Sign up with new email
3. Verify trial_end set in database (NOW() + 48 hours)
4. Use chat normally
5. Manually update trial_end to past date in database
6. Try to send message → Should show TrialExpiredModal

### Test Subscription Flow:
1. Click "Upgrade" button
2. Use Stripe test card: `4242 4242 4242 4242`
3. Expiry: Any future date
4. CVC: Any 3 digits
5. Complete checkout
6. Verify webhook received in Stripe Dashboard → Webhooks → Events
7. Check database: subscription_status should be 'active'
8. Trial_end should be null
9. Chat should work without restrictions

### Test Subscription Management:
1. Active subscriber clicks "Manage Billing"
2. Should open Stripe Customer Portal
3. Can view invoices, update payment, cancel subscription
4. Cancel subscription
5. Verify webhook updates subscription_status to 'canceled'
6. Chat access should be blocked

## 📊 Database Schema

```sql
users table:
- id (UUID, primary key)
- email (TEXT, unique)
- stripe_customer_id (TEXT, unique)
- stripe_subscription_id (TEXT, unique)
- subscription_status (TEXT: 'trialing' | 'active' | 'canceled' | 'past_due' | 'expired')
- subscription_plan (TEXT: 'monthly' | 'yearly' | NULL)
- trial_start (TIMESTAMPTZ, default NOW())
- trial_end (TIMESTAMPTZ, default NOW() + 48 hours)
- subscription_current_period_end (TIMESTAMPTZ)
```

## 🎯 Key Files Modified/Created

### New Files:
- `src/lib/stripe/config.ts` - Stripe initialization
- `src/app/api/stripe/portal/route.ts` - Customer portal endpoint
- `src/components/subscription/SubscriptionManagement.tsx` - Subscription UI
- `src/components/trial/TrialExpiredModal.tsx` - Trial expiration modal
- `src/app/pricing/page.tsx` - Pricing/subscription page
- `supabase-subscription-migration.sql` - Database migration
- `SETUP.md` - Complete setup instructions

### Modified Files:
- `src/app/api/chat/route.ts` - Added trial/subscription checks
- `src/app/api/stripe/webhook/route.ts` - Enhanced webhook handling
- `src/hooks/useChat.ts` - Added trialExpired state
- `src/app/page.tsx` - Added TrialExpiredModal
- `src/app/api/auth/magic-link/callback/route.ts` - Already had trial initialization

## 💰 Pricing Structure

- **Free Trial**: 48 hours, full access
- **Monthly Plan**: $12/month
- **Yearly Plan**: $99/year (save $45 or 31%)

## 🚀 Next Steps

1. **Run migration** in Supabase SQL Editor
2. **Add Stripe keys** to Vercel environment variables
3. **Create Stripe products** and get price IDs
4. **Deploy to Vercel**
5. **Configure webhook** in Stripe Dashboard
6. **Test with real payment** (use test mode first)

## ⚠️ Important Notes

- **Development Mode**: Chat API bypasses auth when NODE_ENV=development
- **Webhook Secret**: Must be configured after deployment for webhook verification
- **Service Role Key**: Never expose in client-side code, only used in webhook handler
- **Test Mode**: Use Stripe test keys for development
- **Production**: Switch to live Stripe keys and test thoroughly

## 📞 Support

If users encounter issues:
1. Check Stripe webhook events for payment confirmation
2. Verify database subscription_status matches Stripe dashboard
3. Check trial_end timestamp in database
4. Review API logs for error messages

## ✨ Features Complete

✅ 48-hour trial on signup
✅ Trial countdown display
✅ Chat blocking after expiration
✅ Beautiful trial expired modal
✅ Stripe checkout integration
✅ Webhook payment processing
✅ Subscription management UI
✅ Customer portal access
✅ Monthly & yearly pricing
✅ Trial abuse prevention
✅ Automatic trial clearing on subscription
✅ Database migration script
✅ Complete documentation

**System is production-ready after running migration and configuring Stripe!**
