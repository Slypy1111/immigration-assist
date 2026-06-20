# UI Patterns — ImmigrationAssist

## Design Tokens
- Primary: `#1e3a5f` (navy — trust)
- Accent: `#0d9488` (teal — action)
- Use CSS vars: `var(--primary)`, `var(--accent)`, `var(--muted)`, `var(--border)`

## Lawyer Workspace
- **Sidebar layout** — `LawyerSidebar` with Dashboard + Cases
- **Dashboard** — stat cards, Needs Attention list, recent cases
- **Case detail** — workflow stepper, tabbed sections with badge counts
- **Empty states** — `EmptyState` component with icon + CTA

## Client Portal
- **Guided accordion flow** — intake → documents → messages
- Minimise tabs; show progress ring at top
- Plain language; avoid legal jargon

## Components
- `CaseWorkflowStepper` — 5 stages: INTAKE → COLLECTING → DRAFTING → REVIEW → READY
- `AgentHub` — agent cards + chat panel
- `ToastProvider` — wrap app root for action feedback

## Do Not
- Use marketing-style hero text inside tool pages
- Hide critical actions behind more than 2 clicks
- Show AI output without disclaimer banner
