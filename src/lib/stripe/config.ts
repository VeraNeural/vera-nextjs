import Stripe from 'stripe';
import { env } from '@/lib/env';

export const STRIPE_API_VERSION = '2025-10-29.clover' as const;

export const stripe = new Stripe(env.stripe.secretKey, {
  apiVersion: STRIPE_API_VERSION,
  typescript: true,
});
