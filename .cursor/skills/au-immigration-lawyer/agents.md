# In-App Agent Extension Guide

## Adding a New Agent

1. Create skill file: `lib/agents/skills/my-agent.ts`
2. Export `AgentSkill` object with:
   - `id`, `name`, `icon` (Lucide name), `description`
   - `systemPrompt` — role, constraints, output format
   - `disclaimer` — use `AGENT_DISCLAIMER` from `types.ts`
   - `allowedRoles` — `["LAWYER", "PARALEGAL"]` typically
   - `starterPrompts` — 2-3 clickable suggestions
3. Register in `lib/agents/skills/index.ts` exports
4. Add to `ALL_AGENTS` in `lib/agents/agent-registry.ts`
5. Add icon to `ICONS` map in `components/agents/agent-hub.tsx` if new

## Prompt Rules

- Reference case context only (intake, checklist, documents)
- Australian English, professional tone
- Flag missing info as `[NEEDS CLIENT INPUT]`
- End advisory responses with disclaimer reminder

## API

`POST /api/agents/chat` — `{ caseId, agentId, message }` → text stream

Uses `buildAgentCaseContext()` and agent's `systemPrompt`.
