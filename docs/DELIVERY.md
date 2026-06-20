# Lawyer Delivery Pack

Use this document when sharing ImmigrationAssist with your team.

## Vercel one-click deploy (required for public URL)

This machine cannot reach vercel.com directly. Deploy from your browser:

**[Import on Vercel →](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSlypy1111%2Fimmigration-assist)**

After import, paste the same `DATABASE_URL` from your local `.env` into Vercel Environment Variables, plus:

```
AUTH_MODE=dev
NEXT_PUBLIC_AUTH_MODE=dev
MOCK_AI=true
NEXT_PUBLIC_APP_URL=https://YOUR-PROJECT.vercel.app
```

Then redeploy and verify:

- `https://YOUR-PROJECT.vercel.app/api/health` → `{ "ok": true, "db": "connected" }`
- `https://YOUR-PROJECT.vercel.app/dev-login` → lawyer / client buttons work

Optional: add GitHub secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL` to enable automatic deploys via Actions.

## Production URL

After Vercel deploy, replace `YOUR_VERCEL_URL` below:

| Item | URL |
|------|-----|
| App | `https://YOUR_VERCEL_URL` |
| Dev Login | `https://YOUR_VERCEL_URL/dev-login` |
| Help Guide | `https://YOUR_VERCEL_URL/help` |
| Health Check | `https://YOUR_VERCEL_URL/api/health` |

## How to sign in (demo mode)

1. Open **Dev Login** URL
2. **Lawyer:** click **Enter as Lawyer**
3. **Client:** click **Enter as Client** (same demo case is pre-linked)

No Clerk account or local install required.

## Demo case (current local seed)

| Field | Value |
|-------|-------|
| Title | Demo - Smith Partner Visa 820 |
| Case ID | `cmqm4ac5v0005re6oa7jzbkgw` |
| Lawyer URL | `http://localhost:3000/lawyer/cases/cmqm4ac5v0005re6oa7jzbkgw` |
| Client URL | `http://localhost:3000/client/cases/cmqm4ac5v0005re6oa7jzbkgw` |

After Vercel deploy, replace `localhost:3000` with your Vercel domain in the URLs above.

## Database setup (deployer only)

1. Create free project at [neon.tech](https://neon.tech) (region: ap-southeast-1)
2. Set `DATABASE_URL` in Vercel and local `.env`
3. Run `npm run setup` then `npm run db:simulate`

**Temporary Prisma cloud DB:** If using `npx create-db`, open `CLAIM_URL` in `.env` before expiry (currently in project `.env`) to keep the database free. For long-term production, migrate to [Neon](https://neon.tech).

## Vercel environment variables

```
DATABASE_URL=...
AUTH_MODE=dev
NEXT_PUBLIC_AUTH_MODE=dev
MOCK_AI=true
NEXT_PUBLIC_APP_URL=https://YOUR_VERCEL_URL
```

## Verified flows

- Lawyer: Dashboard → case → Checklist / Drafts / Messages / AI Assistants
- Client: My Cases → 3-step guide (intake, documents, messages)
- Public: `/`, `/help`, `/api/health`

Document uploads on Vercel require S3/R2; intake, messages, and AI drafts work without uploads.

## Disclaimer

AI drafts require lawyer review. No guarantee of visa approval.
