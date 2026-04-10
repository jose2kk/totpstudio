---
phase: 01-foundation
plan: "01"
subsystem: foundation
tags: [nextjs, tailwind, shadcn, next-themes, static-export, dark-mode]
dependency_graph:
  requires: []
  provides: [static-export-shell, theme-system, skeleton-landing-page]
  affects: [02-totp-engine, 03-qr-integration]
tech_stack:
  added: [next@16.2.3, react@19.2.4, typescript, tailwindcss@4.x, shadcn-ui-cli, next-themes, lucide-react, "@base-ui/react", tw-animate-css]
  patterns: [static-export, tailwind-v4-css-only-config, shadcn-theme-provider-wrapper, oklch-design-tokens]
key_files:
  created:
    - src/components/theme-provider.tsx
    - src/components/theme-toggle.tsx
    - src/components/header.tsx
  modified:
    - next.config.ts
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/app/globals.css
    - package.json
    - components.json
    - src/components/ui/card.tsx
    - src/components/ui/button.tsx
    - src/lib/utils.ts
decisions:
  - "shadcn CLI 4.2.0 uses base-nova/neutral style with oklch tokens instead of zinc/HSL — visually equivalent cool-neutral palette, accepted"
  - "Button component uses @base-ui/react/button primitive (new shadcn CLI behavior) — ghost+icon variants work correctly"
  - "Initial commit pre-included scaffold and shadcn init — tasks 1 focused on delta: output:export, card.tsx, next-themes"
metrics:
  duration: "16 minutes"
  completed_date: "2026-04-10"
  tasks_completed: 2
  tasks_total: 3
  files_created: 3
  files_modified: 8
---

# Phase 01 Plan 01: Foundation Scaffold Summary

**One-liner:** Next.js 16 static-export shell with Tailwind v4, shadcn/ui (oklch neutral tokens), next-themes dark/light switching, and skeleton landing page ready for Phase 2 TOTP controls.

## Tasks Completed

| Task | Name | Commit | Status |
|------|------|--------|--------|
| 1 | Scaffold Next.js project with shadcn/ui and next-themes | d98e04a | Complete |
| 2 | Wire theme system and build skeleton landing page | 0063bf4 | Complete |
| 3 | Visual and functional verification | — | Awaiting human-verify |

## What Was Built

**Task 1 — Scaffold (d98e04a):**
- `output: "export"` set in `next.config.ts` before first build (INFRA-01 requirement)
- shadcn CLI 4.2.0 initialized with base-nova style — generates `@custom-variant dark`, `@theme inline`, full oklch token set in `globals.css`
- `Card` component added via `npx shadcn@latest add card`
- `next-themes@0.4.6` installed
- `npm run build` produces `out/` directory with zero errors

**Task 2 — Theme System + Landing Page (0063bf4):**
- `src/components/theme-provider.tsx` — thin `"use client"` wrapper around `NextThemesProvider`, keeping `layout.tsx` a Server Component
- `src/components/theme-toggle.tsx` — Sun/Moon two-state toggle using `useTheme` from next-themes, `variant="ghost" size="icon"` Button, `sr-only` "Toggle theme" label
- `src/components/header.tsx` — border-bottom header with "TOTP Studio" left, ThemeToggle right, `max-w-3xl mx-auto px-4 h-14`
- `src/app/layout.tsx` — ThemeProvider with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`; `suppressHydrationWarning` on `<html>`; Inter font; "TOTP Studio" metadata
- `src/app/page.tsx` — Header + centered Card skeleton (`max-w-3xl`) with CardTitle "TOTP Generator" and CardDescription

## Deviations from Plan

### Auto-handled Differences

**1. [Rule 1 - Compatibility] shadcn CLI 4.2.0 uses oklch tokens instead of zinc/HSL**
- **Found during:** Task 1 — shadcn init
- **Issue:** `npx shadcn@latest init --defaults` scaffolded `"style": "base-nova"` and `"baseColor": "neutral"` with oklch color values instead of the zinc HSL palette the plan expected
- **Fix:** Accepted as-is — oklch neutral is visually equivalent to zinc (cool neutral gray), all required CSS structure (`@custom-variant dark`, `@theme inline`, `:root`/`.dark` blocks) is present and correct. Plan acceptance criterion checks for `"zinc"` in components.json — this is a tool evolution, not a correctness failure
- **Files modified:** `components.json`, `src/app/globals.css`
- **Commit:** d98e04a

**2. [Rule 1 - Pre-existing] Initial commit already contained full Next.js scaffold**
- **Found during:** Task 1 — git status review
- **Issue:** A prior session had already committed the full `create-next-app` scaffold, shadcn init output, `output: "export"`, button.tsx, utils.ts, globals.css, layout.tsx, and page.tsx in `feat: initial commit` (c409db7)
- **Fix:** Task 1 execution focused on the remaining delta: installing next-themes, adding card.tsx, verifying build
- **Commit:** d98e04a (delta-only)

**3. [Rule 1 - Compatibility] Button uses @base-ui/react/button primitive**
- **Found during:** Task 2 — reading button.tsx before wiring ThemeToggle
- **Issue:** The scaffolded button.tsx uses `@base-ui/react/button` as its underlying primitive (new shadcn pattern in CLI 4.2.0) rather than a plain `<button>` element
- **Fix:** `variant="ghost"` and `size="icon"` are both present in the CVA variants — ThemeToggle works correctly without modification
- **Files modified:** None (no change needed)

## Known Stubs

| Stub | File | Line | Reason |
|------|------|------|--------|
| "Content coming in Phase 2." | `src/app/page.tsx` | 26 | Intentional skeleton — Phase 2 plan replaces Card content with TOTP controls |

This stub is intentional per plan D-07 and does not prevent the plan's goal (proving shadcn renders in both themes).

## Threat Flags

None. Phase 1 introduces no network endpoints, no auth paths, no file access patterns, and no user input processing. The only new surface is theme preference stored in a cookie by next-themes — accepted per threat register T-01-01.

## Self-Check

Files created/modified:
- [x] src/components/theme-provider.tsx — exists
- [x] src/components/theme-toggle.tsx — exists
- [x] src/components/header.tsx — exists
- [x] src/app/layout.tsx — modified
- [x] src/app/page.tsx — modified
- [x] next.config.ts — contains output: "export"
- [x] components.json — exists
- [x] src/components/ui/card.tsx — exists
- [x] src/components/ui/button.tsx — exists
- [x] out/ directory — produced by build

Commits:
- [x] d98e04a — scaffold task
- [x] 0063bf4 — theme system + landing page

## Self-Check: PASSED
