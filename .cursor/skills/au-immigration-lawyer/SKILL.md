---
name: au-immigration-lawyer
description: Domain knowledge for Australian immigration lawyer assistant platform. Use when building features for visa cases, AI drafting, client portal, or migration law workflows.
---

# Australian Immigration Lawyer Platform

## Domain Context

This platform serves **registered migration lawyers** assisting clients with Australian visa applications via the Department of Home Affairs.

### Supported Visa Types (MVP)
- **Partner 820/801** — onshore partner visa (temporary + permanent pathway)
- **TSS 482** — Temporary Skill Shortage, employer-sponsored
- **Student 500** — international student visa (GTE required)

### Key Terminology
- **Intake** — structured client questionnaire collecting facts for drafting
- **Checklist** — visa-specific required documents with verification workflow
- **Draft** — AI-assisted document requiring lawyer approval before use
- **Agent** — in-app AI assistant with a specialised skill (not autonomous legal advice)
- **Lodgement** — submitting application to Home Affairs (out of MVP scope)

## Compliance Constraints (CRITICAL)

1. **Never invent client facts** — use `[NEEDS CLIENT INPUT]` for missing data
2. **Never guarantee visa approval** — outcomes depend on Home Affairs assessment
3. **AI output requires lawyer review** — all drafts default to `DRAFT` status
4. **Not legal advice** — system assists document preparation, not client representation
5. **PII handling** — passport, relationship evidence; minimise logging; RBAC on all case access

## Architecture Quick Reference

- Auth: Dev mode (`AUTH_MODE=dev`) or Clerk (`AUTH_MODE=clerk`)
- AI: `lib/ai/context-builder.ts` + `lib/ai/prompts/`
- Agents: `lib/agents/agent-registry.ts` + `lib/agents/skills/`
- Cases: Prisma models in `prisma/schema.prisma`

See also: `agents.md`, `ui-patterns.md`, `compliance.md` in this folder.
