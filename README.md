# Ascend

Ascend turns real-life self-improvement into a hunter progression system. Daily habits become quests; completed quests award server-verified XP, raise one of five attributes, extend streaks, and move the hunter through ranks E–S.

The interface is deliberately built as a cohesive “System” rather than a generic dashboard: holographic panels, animated stat bars, rank emblems, ambient scan lines, quest-complete overlays, responsive mobile navigation, and subtle audio feedback all reinforce the same fiction.

## Product surface

- Daily, custom, and weekly dungeon quests
- Server-authoritative XP, levels, ranks, and stat rewards
- Optimistic quest feedback with React Query
- Independent STR, VIT, INT, AGI, and PER progression
- Discipline meter and restorative Penalty Zone
- Streak heatmap, XP trend, and stat radar analytics
- Achievement case, unlockable titles, hunter profile, avatar control
- Dark/light themes and muteable Web Audio feedback
- Installable PWA shell with offline fallback
- Protected daily-reset cron endpoint
- Responsive command center for phone, tablet, and desktop

## Architecture

The hosted portfolio build uses the Sites Vinext runtime, React Server Components, Tailwind CSS, Framer Motion, Zustand, React Query, Recharts, and a D1/Drizzle persistence schema. The repository also includes the complete Neon/Postgres Prisma schema requested for a Vercel deployment, including Auth.js adapter models and indexed game entities.

Game rules live in `lib/game-logic`. They are pure functions with no framework or database dependency, so rank boundaries and the XP curve are easy to test and tune.

### Why XP is server-authoritative

The browser sends only the quest identifier. Reward values are resolved against server-owned quest definitions, and the server returns the new hunter state. Clients never submit an XP award, level, rank, or stat increase. This keeps optimistic interaction fast without turning the browser into a trusted game engine.

For a multi-user Vercel deployment, connect the provided Prisma schema to Neon and move the route-local showcase state into a transaction:

1. Verify the authenticated user.
2. Lock/read the active quest and current `UserStats`.
3. Reject duplicate completion logs.
4. Apply the pure progression engine.
5. Write `QuestLog`, `UserStats`, `StatHistory`, and unlocked achievements atomically.

## Local setup

Requirements: Node.js 22.13 or newer.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful commands:

```bash
npm run test
npm run test:logic
npm run lint
npm run db:generate
```

## Data model

The Prisma design covers Auth.js-compatible users, accounts and sessions, `UserStats`, quests and immutable completion logs, stat history, achievements, and penalty logs. High-frequency ownership and time-series lookups are indexed, while child records cascade with their owning user or quest.

The D1 schema in `db/schema.ts` mirrors the hosted showcase model. Generate checked-in SQL migrations with `npm run db:generate`.

## Environment variables

See `.env.example` for Neon, Auth.js Google OAuth, Uploadthing, and cron values. Keep secrets in the hosting provider’s encrypted environment configuration; never commit `.env.local`.

## Deployment

The source is ready for the included Sites publishing workflow. The Prisma schema and environment contract are also structured for a Vercel + Neon production target.

The daily reset route is `GET /api/cron/daily-reset` and expects `Authorization: Bearer $CRON_SECRET` when the secret is configured.
