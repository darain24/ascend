# Ascend

Ascend turns real-life self-improvement into a hunter progression system. Habits become quests; completed quests award server-verified XP, raise five independent attributes, extend streaks, and move the hunter from Rank E to Rank S.

## Run locally

Requirements:

- Node.js 20 or newer
- npm 10 or newer

Install and start the development server:

```bash
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The development server supports hot reload. Stop it with `Ctrl+C`.

## Test locally

Run the game-engine unit tests:

```bash
npm run test:logic
```

Run the full verification suite, including a production build:

```bash
npm test
```

Run linting separately:

```bash
npm run lint
```

Test the production server locally:

```bash
npm run build
npm start
```

Then visit [http://localhost:3000](http://localhost:3000). To use another port:

```bash
npm start -- -p 4000
```

## Environment

Every account begins at Level 1 with zero XP, no quests, no activity history, and no unlocked rewards. Copy `.env.example` to `.env` before connecting external services.

- `NEXT_PUBLIC_APP_URL`: canonical application URL
- `DATABASE_URL`: pooled Neon Postgres connection
- `DIRECT_URL`: direct Neon connection used by Prisma migrations
- `AUTH_SECRET`: Auth.js signing secret
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`: Google OAuth credentials
- `UPLOADTHING_TOKEN`: Uploadthing server token
- `CRON_SECRET`: protects the daily-reset endpoint
- `GROQ_API_KEY` and `GROQ_MODEL`: server-only AI generation
- `PUSHER_*`: private guild realtime channels
- `VAPID_*`: Web Push signing keys
- `GITHUB_WEBHOOK_SECRET`: verifies GitHub webhook payloads
- `ADMIN_EMAIL` and `ADMIN_API_SECRET`: restrict the health dashboard

Never commit `.env` or `.env.local`.

## Database

The Neon/Postgres data model is defined in `prisma/schema.prisma`.

```bash
npm run db:generate
npm run db:migrate
```

Use `npm run db:push` only for disposable development databases where migration history is not required.

## Deploy to Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the repository in Vercel.
3. Keep the detected framework preset as **Next.js**.
4. Add the environment variables from `.env.example`.
5. Set `NEXT_PUBLIC_APP_URL` to the final Vercel or custom-domain URL.
6. Deploy.

Vercel uses:

- Build command: `npm run build`
- Output: Next.js default
- Install command: `npm install`

## Deploy to Render

Create a **Web Service** from the repository with:

- Runtime: Node
- Build command: `npm install && npm run build`
- Start command: `npm start -- -p $PORT`
- Health check path: `/`

Add the environment variables from `.env.example`. Set `NEXT_PUBLIC_APP_URL` to the Render service URL and use Node.js 20 or newer.

## Architecture

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS
- Framer Motion
- Zustand and React Query
- Recharts
- Prisma schema for Neon Postgres
- Pure, unit-tested XP and rank engine in `lib/game-logic`
- Installable PWA shell

Quest completion is calculated from the user’s current journey snapshot. The API validates the submitted quest reward and calculates XP, rank, level, discipline, and attribute changes.

## Ascend v2 systems

### AI, journal, and RAG

The System workspace calls Groq only through server routes. `GROQ_API_KEY` is never included in client bundles. Quest generation uses JSON mode and requires a 3–7 item structured chain; users review and edit the result before saving it.

Quest completion renders its normal notification immediately, then requests a short narration asynchronously. A failed or slow model call never blocks progression. The weekly cron aggregates quest/stat history and recent reflections into `WeeklyReport`.

Journal text is converted to a deterministic local embedding and stored in Neon’s `pgvector` column. Ask-the-System ranks the user’s own reflections by cosine similarity before sending only the most relevant context to Groq. The current browser-local account mode uses the same retrieval logic locally; database-backed journal APIs activate with the Auth.js deployment session.

### Guilds and realtime raids

`Guild` and `GuildMember` support owner/member roles and private invite codes. Guild roster reads include current level, rank, and streak. Pusher uses private guild-scoped channels for join and raid events. Raid contributions are transactionally derived from an owned `QuestLog`; the client cannot submit arbitrary damage. The transaction updates HP, creates `RaidContribution`, and inserts an audit record before broadcasting.

Global and guild leaderboard queries are paginated in groups of 25 and use a 60-second CDN cache with stale-while-revalidate because reads greatly outnumber writes.

### Advanced progression

- Class selection unlocks at level 10. Assassin, Mage, and Tank grant 15% XP to AGI, INT, and VIT quests respectively.
- Skills form a database self-relation. Point cost and prerequisites are validated inside one transaction.
- Titles, avatar frames, and accent skins use `Item`/`UserItem`; equipping an item first unequips other cosmetics of that type.
- Rebirth requires S rank and atomically resets level progression while adding a permanent 5% global XP multiplier.
- Raid damage, multiplier math, prerequisite validation, rebirth, correlations, ETA prediction, embeddings, and webhook signatures are pure unit-tested modules.

### Analytics and exports

The 84-day heatmap, weekly XP chart, and ETA use persisted quest completions rather than seeded values. Correlation insights use transparent day-level co-occurrence rates. Settings exports all locally available progress as JSON or CSV; the authenticated `/api/export` route exports QuestLog, StatHistory, and journals from Neon.

### Security and operations

Every database-backed XP-affecting mutation writes an append-only `AuditLog`. Application code exposes no update/delete operation for this table. The log captures the action, delta, and resulting state, providing a reconstruction trail for anti-cheat review.

AI and quest-completion routes use token-bucket rate limits. The GitHub webhook verifies `X-Hub-Signature-256` with HMAC-SHA256 and a timing-safe comparison before matching a code quest. Push reminders use the service worker and VAPID keys.

`/admin` requires both the configured admin email and a private admin token. It shows recent jobs, errors, and system counts. Never expose `ADMIN_API_SECRET` in a public environment variable.

## Database migration

The initial production migration is in `prisma/migrations/20260729160000_ascend_v2`. Neon must allow the `vector` extension.

```bash
npm run db:generate
npm run db:migrate
```

## E2E tests

Install the Chromium runtime once, then run Playwright:

```bash
npx playwright install chromium
npm run test:e2e
```

The suite covers account creation through first level-up, AI quest review/save, and a database-backed guild raid contribution. The raid test activates when `E2E_DATABASE_USER_ID`, `E2E_RAID_ID`, and `E2E_QUEST_LOG_ID` point to isolated test records.

## Deployment note

The existing interface supports browser-local accounts for zero-configuration localhost testing. Multiplayer, database journal persistence, immutable audits, equipment, skills, rebirth, and server exports require the Neon/Auth.js production identity to supply `x-ascend-user-id` at the trusted server boundary. Do not accept that header directly from an untrusted public proxy; set it from the verified Auth.js session in middleware or route wrappers.
