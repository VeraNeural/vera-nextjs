// src/app/api/stripe/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';
import { stripe } from '@/lib/stripe/config';
import { getPriceIdForPlan, isPlanSlug } from '@/lib/stripe/plans';
import type { PlanSlug } from '@/types/subscription';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const planCandidate = body?.plan;

    if (!isPlanSlug(planCandidate)) {
      return NextResponse.json(
        { error: 'Invalid or unsupported plan' },
        { status: 400 }
      );
    }

    const planSlug: PlanSlug = planCandidate;
    const priceId = getPriceIdForPlan(planSlug);

    // Get or create Stripe customer
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    let customerId = userData?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData?.email || user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${env.app.url}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.app.url}/checkout`,
      metadata: {
        supabase_user_id: user.id,
        plan: planSlug,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logger.error('Checkout error', error instanceof Error ? error : { error });
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
