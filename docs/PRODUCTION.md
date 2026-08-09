# Ascend production runbook

## Architecture

- Vercel serves the Next.js application.
- Neon provides PostgreSQL through pooled `DATABASE_URL` and direct `DIRECT_URL` connections.
- Render Cron Jobs invoke the four authenticated `/api/cron/*` routes.
- Optional providers remain disabled unless their complete environment-variable group is configured.

Do not run a second Ascend web service on Render. Doing so creates configuration drift and can duplicate scheduled work.

## Release procedure

1. Run `npm ci`, `npm run db:generate`, `npm run lint`, `npm test`, `npm run test:e2e`, and `npm audit --audit-level=high`.
2. Apply migrations with `npm run db:deploy` against staging.
3. Test signup, email verification, password reset, account deletion, quests, heatmap, guilds, raids, and every cron route on staging.
4. Back up the production database and confirm point-in-time restore is enabled.
5. Apply migrations to production with `npm run db:deploy` from a trusted terminal or protected deployment job.
6. Deploy Vercel, check `/api/health`, then manually trigger each Render cron once.
7. Roll back the Vercel deployment if smoke tests fail. Database rollback requires a forward corrective migration or a tested Neon restore.

## Required alerts

- `/api/health` is non-200 for two consecutive checks.
- A `JobRun` remains failed or running beyond its expected duration.
- `SystemError` receives password reset, email verification, AI, or cron failures.
- Neon connection usage, storage, or latency approaches the plan limit.

Never log passwords, database URLs, OAuth secrets, email tokens, webhook secrets, push keys, or authorization headers.
