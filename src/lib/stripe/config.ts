// Stripe configuration
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

// Price IDs from your Stripe dashboard
export const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_YEARLY!,
};

// Validate price IDs are set
if (!PRICE_IDS.monthly || !PRICE_IDS.yearly) {
  console.warn('⚠️  Stripe price IDs not set. Add STRIPE_PRICE_MONTHLY and STRIPE_PRICE_YEARLY to .env.local');
}
