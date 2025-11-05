# Environment Variables Reference

## Required Variables

### Database (Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### AI APIs
```
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
ELEVENLABS_API_KEY=your-elevenlabs-key
ELEVENLABS_VOICE_ID=your-voice-id
```

### Stripe Payment
```
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (get after deploying to Vercel)
STRIPE_PRICE_MONTHLY=price_xxx (monthly subscription price ID)
STRIPE_PRICE_YEARLY=price_xxx (yearly subscription price ID)
```

### App Configuration
```
NEXT_PUBLIC_APP_URL=http://localhost:3000 (or https://your-domain.com in production)
NODE_ENV=development
```

## Setup Instructions

### 1. Database Migration
Run the migration script in your Supabase SQL Editor:
- Open Supabase Dashboard → SQL Editor
- Copy contents from `supabase-subscription-migration.sql`
- Execute the script

### 2. Stripe Setup
1. Go to https://dashboard.stripe.com/
2. Create Products:
   - Monthly: $12/month recurring
   - Yearly: $99/year recurring
3. Copy Price IDs (start with `price_`) to environment variables
4. Copy API keys from Developers → API keys
5. After deploying to Vercel, add webhook:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 3. Trial Protection
The system automatically:
- Creates 48-hour trial when user signs up via magic link
- Blocks chat access after trial expires
- Shows trial banner with countdown
- Allows access with active subscription

### 4. Test Flow
1. Sign up with magic link → Gets 48-hour trial
2. Use VERA during trial
3. Click upgrade button → Stripe checkout
4. Complete payment → Webhook activates subscription
5. Trial cleared, subscription active

## Security Notes
- Never commit `.env.local` to git
- Use different Stripe keys for dev/prod
- Rotate webhook secrets if compromised
- Service role key should ONLY be used server-side
