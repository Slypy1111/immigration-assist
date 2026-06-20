# Deployment Guide (No Docker)

Lawyers use a **browser URL only**. This guide is for the person deploying the app once.

## 1. Neon database (permanent PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a project (region: `ap-southeast-1` recommended for Australia)
3. Copy the **connection string** (pooled or direct)
4. Set in `.env` and Vercel:

```env
DATABASE_URL="postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require"
```

5. Initialize:

```bash
npm run setup
```

## 2. Vercel

1. Push repo to GitHub
2. [vercel.com/new](https://vercel.com/new) → Import repository
3. Framework: Next.js (auto-detected)
4. Environment variables:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | Neon connection string |
| `AUTH_MODE` | `dev` or `clerk` |
| `NEXT_PUBLIC_AUTH_MODE` | same as `AUTH_MODE` |
| `MOCK_AI` | `true` |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` |

5. Deploy — build runs `prisma migrate deploy` automatically

## 3. Share with lawyers

Send them:

- App URL: `https://your-project.vercel.app`
- Guide: `https://your-project.vercel.app/help`
- Login: Dev mode buttons or Clerk accounts

## 4. Document uploads (production)

Configure Cloudflare R2 or AWS S3:

```env
S3_BUCKET=your-bucket
S3_REGION=ap-southeast-2
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
# For R2:
S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com
```

Without S3, uploads work locally (`uploads/` folder) but not on Vercel.

## 5. Optional: claim Prisma temporary DB

If you used `npx create-db`, open `CLAIM_URL` from `.env` before it expires, then migrate to Neon for production.
