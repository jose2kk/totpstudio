# Phase 1: Foundation - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold a deployable Next.js project with static export (`output: 'export'`), Tailwind CSS v4, shadcn/ui, and working dark/light theme switching that produces no hydration errors. This is the shell that all subsequent phases build into.

</domain>

<decisions>
## Implementation Decisions

### Color Theme / Design Tokens
- **D-01:** Use the **zinc** base color palette (shadcn/ui default). Cool neutral gray, clean and professional.
- **D-02:** Use **default shadcn/ui primary colors** — no custom accent color. Dark buttons on light theme, light on dark. Minimal and standard.

### Page Layout Structure
- **D-03:** **Header bar + centered content container** layout. Slim header with app title on the left and theme toggle on the right, then a centered content area below.
- **D-04:** Content container uses **max-w-3xl (~768px)**. Enough breathing room for side-by-side QR + TOTP display in Phase 3 without feeling empty.

### Theme Toggle
- **D-05:** Theme toggle is a **sun/moon icon button in the top-right of the header bar**. Standard placement, consistent with shadcn/ui examples.
- **D-06:** Toggle is **Light/Dark only** (two states). System default applied on first load per UI-02, but the toggle itself just flips between light and dark.

### Skeleton Page Content
- **D-07:** Landing page shows the **header + an empty Card component** in the centered content area. Proves shadcn/ui renders correctly in both themes. Phase 2 replaces the card content.
- **D-08:** App title/branding is **Claude's discretion** — pick something appropriate for a developer utility tool.

### Claude's Discretion
- App title/branding text — choose something concise and fitting for a TOTP developer tool

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Constraints
- `CLAUDE.md` (project root) — Full tech stack specification, version requirements, installation steps, what NOT to use
- `.planning/REQUIREMENTS.md` — Phase 1 requirements: INFRA-01, INFRA-02, INFRA-03, UI-02

### Architecture Decisions (from STATE.md)
- `output: 'export'` must be set from day one — Vercel static deployment
- `suppressHydrationWarning` required on `<html>` for next-themes
- Tailwind v4 uses `@theme` directive in CSS (no `tailwind.config.js`)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — this phase establishes the foundational patterns

### Integration Points
- `next.config.ts` — must include `output: 'export'` for static build
- `app/layout.tsx` — ThemeProvider wrapper, `suppressHydrationWarning` on `<html>`
- `app/globals.css` — Tailwind v4 `@import "tailwindcss"` + `@theme` directive for shadcn/ui tokens

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User wants the default shadcn/ui look and feel, nothing custom.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-10*
