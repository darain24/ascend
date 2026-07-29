# Ascend

Ascend turns real-life self-improvement into a hunter progression system. Habits become quests; completed quests award server-verified XP, raise five independent attributes, extend streaks, and move the hunter from Rank E to Rank S.

## Run locally

Requirements:

- Node.js 20 or newer
- npm 10 or newer

Install and start the development server:

```bash
cp .env.example .env.local
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

Every account begins at Level 1 with zero XP, no quests, no activity history, and no unlocked rewards. Copy `.env.example` to `.env.local` before connecting external services.

- `NEXT_PUBLIC_APP_URL`: canonical application URL
- `DATABASE_URL`: pooled Neon Postgres connection
- `DIRECT_URL`: direct Neon connection used by Prisma migrations
- `AUTH_SECRET`: Auth.js signing secret
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`: Google OAuth credentials
- `UPLOADTHING_TOKEN`: Uploadthing server token
- `CRON_SECRET`: protects the daily-reset endpoint

Never commit `.env.local`.

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

- Next.js 14 App Router and TypeScript
- Tailwind CSS
- Framer Motion
- Zustand and React Query
- Recharts
- Prisma schema for Neon Postgres
- Pure, unit-tested XP and rank engine in `lib/game-logic`
- Installable PWA shell

Quest completion is calculated from the user’s current journey snapshot. The API validates the submitted quest reward and calculates XP, rank, level, discipline, and attribute changes.
