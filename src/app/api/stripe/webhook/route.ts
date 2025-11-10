// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { env } from '@/lib/env';
import { stripe } from '@/lib/stripe/config';
import { getPlanForPriceId } from '@/lib/stripe/plans';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createServiceClient();
    if (!supabaseAdmin) {
      logger.error('Stripe webhook handler missing SUPABASE_SERVICE_ROLE_KEY.');
      return NextResponse.json(
        { error: 'Service client unavailable' },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.stripe.webhookSecret
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (userId && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription.id;

          const subscriptionData = await stripe.subscriptions.retrieve(subscriptionId);
          const planSlug = getPlanForPriceId(subscriptionData.items.data[0]?.price?.id) ?? null;

          await supabaseAdmin.from('users').update({
            subscription_status: 'active' as const,
            stripe_subscription_id: subscriptionData.id,
            subscription_plan: planSlug,
            subscription_current_period_end: new Date((subscriptionData as any).current_period_end * 1000).toISOString(),
            trial_end: null,
          }).eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price?.id;
        const planSlug = getPlanForPriceId(priceId);
        const customerId = subscription.customer as string;

        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          await supabaseAdmin.from('users').update({
            subscription_status: subscription.status,
            subscription_plan: planSlug,
          }).eq('id', user.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          await supabaseAdmin.from('users').update({
            subscription_status: 'canceled',
            subscription_id: null,
            subscription_plan: null,
          }).eq('id', user.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          await supabaseAdmin.from('users').update({
            subscription_status: 'past_due',
          }).eq('id', user.id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error', error instanceof Error ? error : { error });
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
