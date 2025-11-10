import Stripe from 'stripe';
import { env } from '@/lib/env';

export const STRIPE_API_VERSION = '2024-06-20' as const;

export const stripe = new Stripe(env.stripe.secretKey, {
  apiVersion: STRIPE_API_VERSION,
  typescript: true,
});
