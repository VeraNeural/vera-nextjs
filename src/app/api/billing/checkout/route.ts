// src/app/api/billing/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';
import { stripe } from '@/lib/stripe/config';
import { getPriceIdForPlan, isPlanSlug } from '@/lib/stripe/plans';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const origin = new URL(request.url).origin;
    const { plan } = await request.json();

    if (!isPlanSlug(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const priceId = getPriceIdForPlan(plan);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/?upgrade=success`,
      cancel_url: `${origin}/?upgrade=cancel`,
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      metadata: {
        user_id: user.id,
        plan,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
  logger.error('Checkout error (legacy billing endpoint)', error instanceof Error ? error : { error });
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
