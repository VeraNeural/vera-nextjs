import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/service';
import { env } from '@/lib/env';
import { stripe } from '@/lib/stripe/config';
import { getPlanForPriceId } from '@/lib/stripe/plans';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs'; // ensure Node runtime for Stripe webhooks

export async function POST(request: NextRequest) {
  // 1) Require signature first so we don't hit Supabase for unsigned test calls
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 });
  }

  // 2) Read raw body (must be text, not JSON)
  const body = await request.text();

  // 3) Verify Stripe signature; return 400 on failure (not 500)
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.stripe.webhookSecret);
  } catch (err) {
    logger.warn('Invalid Stripe signature', { err });
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  // 4) Service client is optional; if missing, skip DB writes but don't 500
  const supabaseAdmin = createServiceClient();
  const hasServiceClient = !!supabaseAdmin;
  if (!hasServiceClient) {
    logger.warn('SUPABASE_SERVICE_ROLE_KEY not set; skipping DB updates in webhook.');
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (hasServiceClient && userId && session.subscription) {
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;

          const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId);
          const planSlug =
            getPlanForPriceId(subscriptionData.items.data[0]?.price?.id) ?? null;

          await supabaseAdmin!
            .from('users')
            .update({
              subscription_status: 'active' as const,
              stripe_subscription_id: subscriptionData.id,
              subscription_plan: planSlug,
              subscription_current_period_end: new Date(
                (subscriptionData as any).current_period_end * 1000
              ).toISOString(),
              trial_end: null,
            })
            .eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        if (hasServiceClient) {
          const priceId = subscription.items.data[0]?.price?.id;
          const planSlug = getPlanForPriceId(priceId);
          const customerId = subscription.customer as string;

          const { data: user } = await supabaseAdmin!
            .from('users')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (user) {
            await supabaseAdmin!
              .from('users')
              .update({
                subscription_status: subscription.status,
                subscription_plan: planSlug,
              })
              .eq('id', user.id);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        if (hasServiceClient) {
          const customerId = subscription.customer as string;

          const { data: user } = await supabaseAdmin!
            .from('users')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (user) {
            await supabaseAdmin!
              .from('users')
              .update({
                subscription_status: 'canceled',
                subscription_id: null,
                subscription_plan: null,
              })
              .eq('id', user.id);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (hasServiceClient) {
          const customerId = invoice.customer as string;

          const { data: user } = await supabaseAdmin!
            .from('users')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (user) {
            await supabaseAdmin!
              .from('users')
              .update({ subscription_status: 'past_due' })
              .eq('id', user.id);
          }
        }
        break;
      }

      default:
        // ignore other event types
        break;
    }

    // Always acknowledge receipt to Stripe
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error('Stripe webhook handler error', error instanceof Error ? error : { error });
    // Still return 200 to Stripe to avoid retries if the error is non-critical,
    // or change to 500 if you specifically want Stripe to retry.
    return NextResponse.json({ error: 'handler_error' }, { status: 200 });
  }
}