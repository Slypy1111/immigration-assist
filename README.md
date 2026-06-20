# ImmigrationAssist

Australian immigration lawyer assistant platform — case CRM, client portal, document checklists, AI agents, and AI-assisted draft generation.

**For lawyers:** open the shared link in your browser — no Docker, Node, or local install required.

## Features

- **Lawyer CRM**: Sidebar workspace, dashboard with "Needs Attention", case workflow stepper
- **Client Portal**: Guided 3-step flow (intake → documents → messages)
- **AI Assistants**: 4 specialist agents (Document Drafter, Checklist Advisor, Client Comms Coach, Readiness Reviewer)
- **Document Checklists**: Visa-specific templates with verification workflow
- **AI Drafting**: Generate relationship statements, GTE, employer letters
- **Dual Auth**: Dev Auth for demos, Clerk for production

## Quick Start (Deployer / IT — local development)

Lawyers do **not** run these steps. Share the deployed URL instead (see [Deploy to Vercel](#deploy-to-vercel)).

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- A [Neon](https://neon.tech) PostgreSQL database (free tier)

### 1. Install & configure

```bash
npm install
cp .env.example .env
```

Edit `.env`:

- Set `DATABASE_URL` to your Neon connection string
- Keep `AUTH_MODE=dev` and `MOCK_AI=true` for local demos

### 2. Initialize database

```bash
npm run setup
```

This runs `prisma generate`, `prisma migrate deploy`, and seeds visa templates.

Optional demo case:

```bash
npm run db:simulate
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000/dev-login](http://localhost:3000/dev-login) → **Enter as Lawyer**.

**Windows one-liner:** `powershell -ExecutionPolicy Bypass -File scripts/setup.ps1`

## Deploy to Vercel (share link with lawyers)

1. Push this repo to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variables (same as `.env`):
   - `DATABASE_URL` — Neon production connection string
   - `AUTH_MODE` — `dev` (internal demo) or `clerk` (real accounts)
   - `MOCK_AI=true` for demos without OpenAI cost
   - `NEXT_PUBLIC_APP_URL` — `https://your-app.vercel.app`
4. Deploy — `npm run build` runs migrations automatically
5. Share `https://your-app.vercel.app` and [Lawyer Guide](/help) with your team

### File uploads on Vercel

Vercel has no persistent disk. For **client document uploads** in production, configure S3 or Cloudflare R2 in `.env` (`S3_*` variables). Without S3, intake, messages, and AI drafts still work; uploads are for local dev only.

## Lawyer & client access

| Role | How to sign in |
|------|----------------|
| Lawyer | Open app URL → Dev Login → **Enter as Lawyer** (demo) or Clerk sign-in (production) |
| Client | Same URL → **Enter as Client** (must be invited on a case first) |

See in-app guide: `/help`

## Production Auth (Clerk)

1. Create app at [clerk.com](https://clerk.com)
2. Copy keys to Vercel env / `.env`:
   ```env
   AUTH_MODE=clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
3. Restart / redeploy → sign in at `/sign-in`

Invalid keys? Visit `/setup/clerk` for instructions.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_MODE` | No | `dev` (default) or `clerk` |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL (Vercel domain) |
| `MOCK_AI` | No | `true` = mock AI (no API cost) |
| `S3_*` | Vercel uploads | Object storage for document uploads |

## Optional: local PostgreSQL via Docker

Only if you prefer Docker over Neon (not required for lawyers):

```bash
docker compose up -d
# DATABASE_URL=postgresql://lawyer:lawyer_dev_password@localhost:5432/lawyer?schema=public
npm run setup
```

## Scripts

```bash
npm run dev          # Start dev server
npm run setup        # DB migrate + seed
npm run build        # Production build (includes migrate)
npm run test         # Unit + integration tests
npm run test:e2e     # Playwright E2E tests
npm run db:simulate  # Demo case with lawyer + client data
```

## Disclaimer

AI-generated drafts require lawyer review. This platform does not guarantee visa approval and does not submit applications to the Department of Home Affairs.
