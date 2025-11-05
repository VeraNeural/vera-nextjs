# VERA - Virtual Embodied Regulation Assistant

A Next.js application providing nervous system regulation support through conversational AI, breathing exercises, journaling, and grounding techniques.

## Features

- 🔐 **Magic Link Authentication** - Passwordless login via email
- 💬 **AI Chat Interface** - Conversation with VERA for nervous system support
- 🫁 **Breathing Exercises** - Guided breathing with visual orb animations
- 📝 **Journaling** - Structured prompts for emotional processing
- 🌍 **Grounding Techniques** - 5-4-3-2-1 sensory grounding
- 🎨 **Multiple Themes** - Light, Dark, and Deep themes
- ⏱️ **48-Hour Free Trial** - Full access for 48 hours after signup
- 💳 **Stripe Integration** - Subscription payments after trial
- 💾 **Thread Management** - Save and organize conversations
- 🔊 **Text-to-Speech** - Optional voice playback

## Tech Stack

- **Framework**: Next.js 16.0.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: Supabase Auth with magic links
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend for magic link delivery
- **Payments**: Stripe for subscriptions
- **AI**: OpenAI API (or your preferred LLM)

## Prerequisites

Before you begin, ensure you have:

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun
- A [Supabase](https://supabase.com) account
- A [Resend](https://resend.com) account (for email)
- A [Stripe](https://stripe.com) account (for payments)
- An OpenAI API key (or alternative LLM provider)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd vera-nextjs
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `supabase-schema.sql`
3. Get your credentials from **Project Settings** → **API**:
   - Project URL
   - Anon/Public key
   - Service Role key (keep secret!)

### 3. Configure Resend

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use their test domain for development)
3. Create an API key from the dashboard

### 4. Set Up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Go to **Developers** → **API Keys** and copy your keys
3. Create products and price IDs:
   - Go to **Products** → **Add Product**
   - Create a monthly and/or annual subscription
   - Copy the Price IDs

4. Set up webhook endpoint:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the webhook signing secret

### 5. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy from .env.local.example
cp .env.local.example .env.local
```

Edit `.env.local` with your actual credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend
RESEND_API_KEY=re_xxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=price_xxx

# OpenAI (or your LLM provider)
OPENAI_API_KEY=sk-xxx
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Test the Magic Link Flow

1. Navigate to `/login`
2. Enter your email
3. Check your inbox for the magic link
4. Click the link to authenticate
5. You should be redirected to `/chat` with a 48-hour trial

### 8. Test Stripe (Optional)

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## Project Structure

```
vera-nextjs/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── threads/       # Conversation management
│   │   │   ├── messages/      # Message storage
│   │   │   └── stripe/        # Payment handling
│   │   ├── chat/              # Main chat page
│   │   ├── login/             # Login page
│   │   ├── globals.css        # Global styles & themes
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── chat/              # Chat UI components
│   │   ├── layout/            # Header, Sidebar
│   │   ├── orb/               # Breathing orb
│   │   └── ui/                # Reusable UI components
│   ├── hooks/
│   │   └── useAuth.ts         # Authentication hook
│   └── lib/
│       └── supabase/          # Supabase client
├── public/                    # Static assets
├── supabase-schema.sql        # Database schema
└── .env.local.example         # Environment template
```

## Key Features Implementation

### Magic Link Authentication
- User enters email → API sends magic link via Resend
- Link contains OTP → Supabase verifies and creates session
- Callback creates user record with 48-hour trial

### Trial System
- Trial starts on first login
- `trial_end` timestamp stored in database
- UI displays countdown timer
- After expiration, prompts for Stripe checkout

### Subscription Flow
- Stripe Checkout for payment
- Webhook updates user status on success
- Access granted based on `subscription_status`

### Thread Management
- Create new conversations
- Load conversation history
- Delete old threads
- Save important messages

## Development Tips

### Hot Reload Issues?
If changes aren't reflecting:
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Supabase RLS Troubleshooting
If queries fail, check Row Level Security policies in Supabase dashboard.

### Stripe Testing
Keep the Stripe CLI running for webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add all environment variables
4. Deploy!

Update these after deployment:
- `NEXT_PUBLIC_APP_URL` → Your production URL
- Stripe webhook endpoint → Your production webhook URL
- Supabase redirect URLs → Add production domain

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Resend Docs](https://resend.com/docs)

## License

Proprietary - All rights reserved
