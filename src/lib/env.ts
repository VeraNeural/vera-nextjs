import { z } from 'zod';

const inProd = process.env.NODE_ENV === 'production';

const optionalStripeString = inProd
  ? z.string().min(1, 'required in production')
  : z.string().optional().default('');

// Allow missing values in development; only require in production.
const debugLogsSchema = z
  .union([z.string(), z.boolean()])
  .optional()
  .transform(v => v === '1' || v === 'true' || v === true)
  .pipe(z.boolean())
  .default(false);

const EnvSchema = z.object({
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  app: z
    .object({
      // Set APP_DEBUG_LOGS=1 or true to enable verbose logs.
      debugLogs: debugLogsSchema,
      // App URL for redirects (from NEXT_PUBLIC_APP_URL)
      url: z.string().url().optional().default('http://localhost:3000'),
    })
    .default({ debugLogs: false, url: 'http://localhost:3000' }),
  supabase: z.object({
    url: z.string().url(),
    serviceRoleKey: z.string(),
  }),
  stripe: z.object({
    secretKey: inProd ? z.string().min(1) : z.string().optional().default(''),
    webhookSecret: inProd ? z.string().min(1) : z.string().optional().default(''),
    prices: z.object({
      starter: optionalStripeString,
      pro: optionalStripeString,
      annual: optionalStripeString,
      enterprise: optionalStripeString,
    }),
  }),
});

let parsed = EnvSchema.safeParse({
  nodeEnv: process.env.NODE_ENV,
  app: {
    debugLogs: process.env.APP_DEBUG_LOGS,
    url: process.env.NEXT_PUBLIC_APP_URL,
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    prices: {
      starter: process.env.STRIPE_PRICE_STARTER,
      pro: process.env.STRIPE_PRICE_PRO,
      annual: process.env.STRIPE_PRICE_ANNUAL,
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
    },
  },
});

if (!parsed.success) {
  // In dev, do NOT throw hard – just log and keep defaults
  if (inProd) {
    const errorMessage = parsed.error.errors
      .map(e => `${e.path.join('.') || 'env'}: ${e.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${errorMessage}`);
  } else {
    // Soft log
    console.warn(
      '[env] Non-fatal validation issues (dev only):\n' +
        parsed.error.errors
          .map(e => `${e.path.join('.') || 'env'}: ${e.message}`)
          .join('\n')
    );
    // Re-parse with relaxed defaults (already applied by schema)
    parsed = EnvSchema.safeParse({
      nodeEnv: process.env.NODE_ENV,
      app: { debugLogs: process.env.APP_DEBUG_LOGS, url: process.env.NEXT_PUBLIC_APP_URL },
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        prices: {
          starter: process.env.STRIPE_PRICE_STARTER,
          pro: process.env.STRIPE_PRICE_PRO,
          annual: process.env.STRIPE_PRICE_ANNUAL,
          enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
        },
      },
    }) as typeof parsed;
  }
}

if (!parsed.success) {
  throw new Error('Environment validation failed unexpectedly');
}

export const env = parsed.data;
