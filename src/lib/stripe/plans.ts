import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import type { PlanSlug } from '@/types/subscription';

export const PLAN_PRICE_MAP: Record<PlanSlug, string> = {
  starter: env.stripe.prices.starter,
  pro: env.stripe.prices.pro,
  annual: env.stripe.prices.annual,
  enterprise: env.stripe.prices.enterprise,
};

const PRICE_PLAN_MAP: Record<string, PlanSlug> = Object.fromEntries(
  Object.entries(PLAN_PRICE_MAP).map(([plan, priceId]) => [priceId, plan as PlanSlug])
);

export function isPlanSlug(value: unknown): value is PlanSlug {
  return typeof value === 'string' && value in PLAN_PRICE_MAP;
}

export function getPriceIdForPlan(plan: PlanSlug): string {
  const priceId = PLAN_PRICE_MAP[plan];
  if (!priceId) {
    logger.error('Stripe price id missing for plan', { plan });
    throw new Error(`Stripe price id missing for plan: ${plan}`);
  }
  return priceId;
}

export function getPlanForPriceId(priceId: string | null | undefined): PlanSlug | null {
  if (!priceId) return null;
  return PRICE_PLAN_MAP[priceId] ?? null;
}
