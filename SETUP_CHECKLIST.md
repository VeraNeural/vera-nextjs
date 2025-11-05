# VERA Setup Checklist

Use this checklist to get VERA fully functional. Check off each item as you complete it.

## Phase 1: Database Setup

### Supabase Configuration
- [ ] Create Supabase project at https://supabase.com
- [ ] Copy Project URL and save it
- [ ] Copy Anon/Public Key from Settings → API
- [ ] Copy Service Role Key (keep this secret!)
- [ ] Run `supabase-schema.sql` in SQL Editor:
  1. Go to SQL Editor in Supabase dashboard
  2. Click "New Query"
  3. Paste entire contents of `supabase-schema.sql`
  4. Click "Run"
  5. Verify tables created: users, threads, messages, user_preferences

- [ ] Verify RLS policies are enabled (check each table in Table Editor)

## Phase 2: Email Setup (Magic Links)

### Resend Configuration
- [ ] Create account at https://resend.com
- [ ] Add and verify your domain (or use test domain for dev)
- [ ] Create API key from dashboard
- [ ] Copy API key for .env.local
- [ ] Test email sending (optional):
  ```bash
  curl -X POST https://api.resend.com/emails \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"from":"onboarding@resend.dev","to":"your@email.com","subject":"Test","html":"<p>It works!</p>"}'
  ```

### Update Magic Link Email Template (Optional)
- [ ] Edit `src/app/api/auth/magic-link/route.ts`
- [ ] Customize email HTML/design
- [ ] Update "from" email address to match your domain

## Phase 3: Payment Setup

### Stripe Configuration
- [ ] Create Stripe account at https://stripe.com
- [ ] Get API keys from Developers → API Keys
  - [ ] Copy Publishable Key (starts with `pk_test_`)
  - [ ] Copy Secret Key (starts with `sk_test_`)

- [ ] Create subscription products:
  1. Go to Products → Create Product
  2. Product 1: "VERA Monthly"
     - Pricing: Recurring, Monthly
     - Price: $XX.XX per month
     - [ ] Copy Price ID (starts with `price_`)
  3. Product 2: "VERA Annual" (optional)
     - Pricing: Recurring, Yearly
     - Price: $XX.XX per year
     - [ ] Copy Price ID

- [ ] Set up webhook for local development:
  ```bash
  # Install Stripe CLI if not already done
  stripe login
  
  # Forward webhooks to local server
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  
  # Copy the webhook signing secret (starts with whsec_)
  ```
  - [ ] Save webhook secret for .env.local

- [ ] For production: Create webhook endpoint in Stripe dashboard
  - URL: `https://yourdomain.com/api/stripe/webhook`
  - Events to listen: 
    - `checkout.session.completed`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_failed`

## Phase 4: Environment Configuration

### Create .env.local file
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Fill in all variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=___________________________
NEXT_PUBLIC_SUPABASE_ANON_KEY=___________________________
SUPABASE_SERVICE_ROLE_KEY=___________________________

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend
RESEND_API_KEY=___________________________

# Stripe
STRIPE_SECRET_KEY=___________________________
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=___________________________
STRIPE_WEBHOOK_SECRET=___________________________

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=___________________________
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=___________________________

# OpenAI (if using)
OPENAI_API_KEY=___________________________
```

## Phase 5: Local Development

### Start Development Environment
- [ ] Install dependencies: `npm install`
- [ ] Start dev server: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Verify homepage loads without errors

### Test Magic Link Authentication
- [ ] Navigate to `/login`
- [ ] Enter your email address
- [ ] Submit form
- [ ] Check email inbox for magic link
- [ ] Click magic link
- [ ] Verify redirect to `/chat`
- [ ] Check browser console for errors
- [ ] Verify user created in Supabase → Table Editor → users
- [ ] Verify `trial_end` is 48 hours from now

### Test Sidebar Functionality
- [ ] Click "New Thread" button → creates new conversation
- [ ] Send a message in chat
- [ ] Verify message appears
- [ ] Refresh page → thread should persist
- [ ] Click thread in sidebar → loads conversation
- [ ] Test theme toggle (Light/Dark/Deep)
- [ ] Test all user menu buttons:
  - [ ] Profile Management
  - [ ] Settings
  - [ ] Saved Messages
  - [ ] Delete Account
  - [ ] Logout

### Test Trial System
- [ ] Login with new account
- [ ] Verify trial badge shows in header
- [ ] Check trial countdown timer
- [ ] Verify access to all features during trial

### Test Stripe Payment (Test Mode)
Option 1: Wait for trial to expire naturally (48 hours)
Option 2: Manually update trial_end in database to trigger payment flow

- [ ] Trial expires → payment modal appears
- [ ] Click "Upgrade" or payment button
- [ ] Redirected to Stripe Checkout
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify redirect back to app
- [ ] Check Supabase user record:
  - [ ] `subscription_status` = 'active'
  - [ ] `stripe_customer_id` is populated
  - [ ] `subscription_id` is populated
- [ ] Verify full access granted
- [ ] Trial badge should disappear

## Phase 6: Functionality Testing

### Thread Management
- [ ] Create multiple threads
- [ ] Switch between threads
- [ ] Delete a thread
- [ ] Verify thread list updates in sidebar

### Message Saving
- [ ] Send messages in a thread
- [ ] Save a message (implement save button)
- [ ] Go to "Saved Messages"
- [ ] Verify saved messages appear
- [ ] Delete a saved message

### Theme Persistence
- [ ] Change theme to "Deep"
- [ ] Refresh page
- [ ] Verify theme persists
- [ ] Change to "Light"
- [ ] Close browser and reopen
- [ ] Verify theme still "Light"

## Phase 7: Production Deployment

### Pre-Deployment
- [ ] Update Supabase redirect URLs:
  - Add production URL to Supabase → Authentication → URL Configuration
- [ ] Create production Stripe webhook:
  - Endpoint: `https://yourdomain.com/api/stripe/webhook`
  - Copy new webhook secret
- [ ] Update Resend sender domain (if using custom domain)

### Deploy to Vercel
- [ ] Push code to GitHub
- [ ] Connect repo to Vercel
- [ ] Add all environment variables in Vercel dashboard
- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Update `STRIPE_WEBHOOK_SECRET` to production webhook secret
- [ ] Deploy!

### Post-Deployment Testing
- [ ] Test magic link on production
- [ ] Test trial signup
- [ ] Test payment flow with live Stripe keys (when ready)
- [ ] Verify email delivery
- [ ] Test all features

## Common Issues & Solutions

### Magic Link Not Arriving
- Check Resend dashboard for delivery status
- Verify sender domain is configured
- Check spam folder
- Confirm `RESEND_API_KEY` is correct in .env.local

### Database Errors
- Verify RLS policies are enabled
- Check Supabase logs in dashboard
- Confirm `SUPABASE_SERVICE_ROLE_KEY` is correct
- Test connection with Supabase client

### Stripe Webhook Not Working
- Verify Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Check webhook secret matches in .env.local
- Look for errors in Stripe dashboard → Developers → Webhooks
- Verify endpoint URL is correct

### Theme Not Persisting
- Implement `user_preferences` API endpoints
- Save theme choice to database
- Load theme on app mount

### Session Not Persisting
- Check Supabase auth configuration
- Verify cookies are enabled in browser
- Check for CORS issues
- Confirm auth callback is working

## Need Help?

- Check console for errors (F12 in browser)
- Review Supabase logs in dashboard
- Check Stripe webhook logs
- Review Resend delivery logs

## Status Tracking

Progress: __ / __ tasks completed

Notes:
_____________________________________________
_____________________________________________
_____________________________________________
