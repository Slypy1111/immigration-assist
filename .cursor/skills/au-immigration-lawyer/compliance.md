# Compliance — Immigration Law Software

## AI & Document Drafting
- All AI drafts: status `DRAFT` until lawyer `approve`
- Export footer: "AI-assisted draft — lawyer review required"
- Prompts must include no-fabrication and no-guarantee rules

## Data & Privacy (APP-oriented)
- Collect minimum PII necessary for visa preparation
- Files: presigned URLs or local `uploads/`; never public buckets
- Audit sensitive access where feasible
- Support case data export/deletion (future)

## Authentication
- Dev Auth: local only, never enable in production
- Clerk: required for production deployments
- Role separation: LAWYER/PARALEGAL vs CLIENT

## Email
- Client invites and reminders via Resend
- No sensitive document content in email body — link to portal only

## Regulatory Note
Migration lawyers in Australia may be registered with OMARA. This software is a **practice tool**, not a substitute for registered migration advice.
