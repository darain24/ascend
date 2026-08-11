# Ascend

Ascend is a Solo Leveling-inspired self-improvement system. Signed-in hunters create real-life quests, earn server-verified XP, improve five attributes, build streaks, unlock skills and equipment, join guilds, and damage shared raid bosses.

Every new account starts at Level 1 with zero XP, zero attributes, no quests, no activity history, and no unlocked rewards.

## Run locally

Requirements:

- Node.js 20 or newer
- npm 10 or newer
- PostgreSQL/Neon with direct and pooled connection URLs

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Stop the server with `Ctrl+C`.

The seed command creates only shared skill and equipment definitions. It does not create users, quests, activity, or demo progress.

## Test locally

```bash
npm run lint
npm run test:logic
npm run build

npx playwright install chromium
npm run test:e2e
```

The browser suite creates a unique temporary account, verifies a clean starting state, completes a real database-backed quest, checks AI quest persistence and raid replay protection, deletes the account, and confirms cleanup. Run it only against local or staging databases.

Test the optimized server locally with:

```bash
npm run build
npm start
```

## Architecture

- Next.js 16 App Router, React 19, and TypeScript
- Auth.js with credentials, optional Google OAuth, encrypted JWT sessions, and Prisma adapter
- Prisma and PostgreSQL/Neon with `pgvector`
- React Query and Zustand; PostgreSQL is authoritative for account progression
- Groq server routes for quest generation, narration, reports, and Ask the System
- Pusher private channels for authenticated guild and raid updates
- Web Push with service workers and VAPID
- Framer Motion, Tailwind CSS, and Recharts

Auth.js protects the application and resolves user identity on the server. Database routes never accept a user ID from the browser. Quest rewards are loaded from the stored quest, multipliers and progression are calculated transactionally, and each XP-affecting action creates an audit record.

## Implemented production integrations

### Accounts

- Server-backed signup and credentials login
- Optional Google OAuth
- bcrypt password hashing with cost 12
- Authenticated profile, email, GitHub username, and local-file avatar updates
- Authenticated password changes
- One-time password-reset links stored as SHA-256 hashes and expiring after 30 minutes
- Account-isolated application hydration with no previous-user data flash

### Progression

- Server-created quests and server-verified completion
- Level, rank, attribute, streak, class, skill, and rebirth persistence
- Milestone equipment rewards and one-equipped-item-per-type enforcement
- 84-day heatmap and analytics sourced from persisted quest logs
- JSON and CSV exports scoped to the signed-in user

### System, guilds, and raids

- PostgreSQL journal storage with vector embeddings
- AI quest review before persistence
- Weekly Hunter Reports
- Guild creation, invite joining, roster display, and private Pusher channels
- Scheduled raid creation scaled to guild size
- Automatic raid damage from completed quests
- Unique raid/quest-log constraint preventing repeated damage
- GitHub push webhooks that verify HMAC signatures and complete matching code quests
- Per-user notification-center events and Web Push subscriptions

### Operations and security

- Rate limits on sensitive account, AI, and progression routes
- Append-only progression audit records
- Session-restricted admin dashboard with counts, level distribution, job history, and error history
- Cron endpoints protected by `CRON_SECRET`
- Generic password-reset responses that do not reveal account existence

## Database migrations

Migrations are stored in:

- `prisma/migrations/20260729160000_ascend_v2`
- `prisma/migrations/20260731100000_production_auth`

Use migrations for shared or production databases:

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
```

Use `npm run db:push` only for disposable development databases.

## Manual setup required

Codex does not deploy this project. Complete these external steps yourself:

1. **PostgreSQL/Neon**
   - Create a database.
   - Put the pooled connection in `DATABASE_URL`.
   - Put the direct connection in `DIRECT_URL`.
   - Run `npm run db:deploy` and `npm run db:seed`.
   - Confirm the `vector` extension is permitted.

2. **Auth.js**
   - Generate `AUTH_SECRET` with `openssl rand -base64 32`.
   - Credentials login works without an OAuth provider.
   - For Google, create OAuth credentials and add `http://localhost:3000/api/auth/callback/google` plus `https://YOUR_DOMAIN/api/auth/callback/google` as authorized redirect URIs.
   - Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

3. **Password-reset email**
   - Verify a sending domain in Resend.
   - Create a Resend API key.
   - Set `RESEND_API_KEY` and `EMAIL_FROM`.
   - Set `REQUIRE_EMAIL_VERIFICATION=true` in production after email delivery is verified.
   - Without Resend, local development prints the reset URL only in the server terminal.

4. **Groq**
   - Create a Groq API key.
   - Set `GROQ_API_KEY` and optionally change `GROQ_MODEL`.
   - Never expose the key through a `NEXT_PUBLIC_` variable.

5. **Pusher**
   - Create a Channels application.
   - Set `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, and `PUSHER_CLUSTER`.
   - Set `NEXT_PUBLIC_PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_CLUSTER` to the same public key and cluster.

6. **Web Push**
   - Run `npx web-push generate-vapid-keys`.
   - Set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
   - Set `VAPID_SUBJECT` to a monitored `mailto:` address.

7. **GitHub code quests**
   - Generate a strong `GITHUB_WEBHOOK_SECRET`.
   - Add `https://YOUR_DOMAIN/api/webhooks/github` as a repository webhook.
   - Select JSON and push events.
   - Use the same secret in GitHub and Ascend.
   - Enter the repository sender’s GitHub username in the Ascend profile.

8. **Admin**
   - Create or sign up with the intended administrator account.
   - Set `ADMIN_EMAIL` to that exact account email.

9. **Scheduled jobs**
   - Set a strong `CRON_SECRET`.
   - Configure authenticated GET requests with `Authorization: Bearer YOUR_CRON_SECRET`:
     - `/api/cron/daily-reset` hourly so each user is processed at local midnight
     - `/api/cron/push-reminders` hourly so reminders arrive during the user’s local evening
     - `/api/cron/weekly-report` weekly
     - `/api/cron/weekly-raid` weekly
   - Use Vercel Cron or Render Cron Jobs.

10. **Production URLs**
    - Set `NEXT_PUBLIC_APP_URL` to the exact HTTPS origin.
    - Update Google callbacks and GitHub webhook URLs to that same origin.

## Recommended production layout

- Vercel: the only Ascend web deployment
- Neon: PostgreSQL
- Render: four Cron Jobs defined by `render.yaml`

Do not deploy a second web copy to Render. See `docs/PRODUCTION.md` for release and rollback procedures.

## Vercel configuration

- Framework preset: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Add all required `.env.example` values in Project Settings.
- Run `npm run check:env` with the production values before deployment.
- Run `npm run db:deploy` and `npm run db:seed` from a trusted local terminal or CI job before serving traffic.

## Render configuration

Create a Blueprint from `render.yaml` after the repository exists. Set `APP_URL` to the final Vercel HTTPS origin and set `CRON_SECRET` to exactly the same value used by Vercel. Each Render Cron Job is a separately billed service; confirm current pricing before creating the Blueprint.

Before a public release, use a separate staging database and run the complete verification suite. Never run E2E tests against production users or production raid fixtures.
# ascend
