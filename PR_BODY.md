## Summary
- Centralize Stripe integration around `src/lib/stripe/config.ts`, initializing one shared client pinned to `2024-06-20`.
- Enforce server-only plan mapping via `src/lib/stripe/plans.ts`; checkout routes accept `PlanSlug` and reject unknown slugs with HTTP 400.
- Consolidate Stripe webhooks under `/api/stripe/webhook` with signature verification; legacy billing webhook is stubbed.
- Replace `console.log` usage in chat with the structured logger (prompt/history/auth redacted, gated by `DEBUG_LOGS`).
- Introduce `createServiceClientOptional()` so service-role Supabase usage is optional with no non-null assertions.
- Preserve `/api/analyze` auth-before-formData flow and rate limiting.

## Env Vars
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_ENTERPRISE`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `DEBUG_LOGS`

## Local Verification
- Static checks: single `constructEvent` usage, checkout never accepts raw price ids, chat fallback does not rethrow.

## Preview Smoke Tests
- `npm run lint`
- `npm run build`
- Trigger Stripe webhook test event against `/api/stripe/webhook`.

## Rollback Plan
- Revert this PR.
