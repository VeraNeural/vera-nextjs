// src/app/api/billing/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let event: Stripe.Event;
  try {
    const raw = await request.text();
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const svc = createServiceClient();

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.user_id;
      const plan = session.metadata?.plan || null;

      if (userId) {
        await svc
          .from('users')
          .update({
            subscription_status: 'active',
            subscription_plan: plan,
          })
          .eq('id', userId);
      }
    }

    // Handle subscription created or updated
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id || null;
      const cpe = (sub as any).current_period_end as number | null;
      const periodEnd = cpe ? new Date(cpe * 1000).toISOString() : null;

      let plan: 'monthly' | 'annual' | null = null;
      const priceId = sub.items.data[0]?.price?.id;

      if (priceId) {
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY) plan = 'monthly';
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL) plan = 'annual';
      }

      if (userId) {
        await svc
          .from('users')
          .update({
            subscription_status: 'active',
            subscription_plan: plan,
            subscription_current_period_end: periodEnd,
          })
          .eq('id', userId);
      }
    }

    // Handle subscription deleted
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id || null;

      if (userId) {
        await svc
          .from('users')
          .update({
            subscription_status: 'canceled',
          })
          .eq('id', userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';