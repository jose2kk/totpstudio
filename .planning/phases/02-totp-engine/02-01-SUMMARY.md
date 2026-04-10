---
phase: 02-totp-engine
plan: "01"
subsystem: totp-utilities
tags: [dependencies, shadcn, fonts, utilities, tdd]
dependency_graph:
  requires: []
  provides:
    - otplib installed for TOTP engine (Plan 02-02)
    - react-qr-code installed for QR rendering (Phase 03)
    - shadcn Input component for secret text field (Plan 02-02)
    - shadcn Toggle/ToggleGroup for parameter selectors (Plan 02-02)
    - Geist Mono font via --font-geist-mono CSS variable (Plan 02-02)
    - validateBase32 utility for input validation (Plan 02-02)
    - formatCode utility for display grouping (Plan 02-02)
    - getCountdownState utility for timer/progress bar (Plan 02-02)
    - copyToClipboard utility for copy button (Plan 02-02)
  affects: []
tech_stack:
  added:
    - otplib 13.4.0 (TOTP engine, ESM, uses @noble/hashes)
    - react-qr-code 2.0.18 (QR SVG rendering)
    - tsx (devDependency, TypeScript test runner)
  patterns:
    - TDD with node assert + tsx for pure utility functions
    - shadcn CLI scaffolding for base-ui primitive wrappers
    - next/font/google with CSS variable for Tailwind font-mono mapping
key_files:
  created:
    - src/lib/totp.ts
    - src/lib/__tests__/totp.test.ts
    - src/components/ui/input.tsx
    - src/components/ui/toggle.tsx
    - src/components/ui/toggle-group.tsx
  modified:
    - package.json
    - src/app/layout.tsx
decisions:
  - "tsx installed as devDependency for TypeScript test execution — Node 20.11.1 lacks --experimental-strip-types (Node 22+ feature)"
  - "otplib loads as ESM only — node require() fails, but Next.js/browser ESM import works correctly"
  - "geistMono.variable applied to body className alongside inter.className — both font systems coexist"
metrics:
  duration: "~20 minutes"
  completed_date: "2026-04-10"
  tasks_completed: 2
  files_created: 5
  files_modified: 2
---

# Phase 02 Plan 01: Dependencies, Components, and TOTP Utilities Summary

**One-liner:** Installed otplib + react-qr-code, scaffolded shadcn Input/ToggleGroup, added Geist Mono font, and created pure TOTP utility functions with TDD (21/21 tests passing).

## What Was Built

### Dependencies Installed
- **otplib 13.4.0** — TOTP engine for Phase 02-02. ESM-only package, uses `@noble/hashes` (security audited). Browser-compatible.
- **react-qr-code 2.0.18** — QR SVG renderer for Phase 03. No issues with React 19.
- **tsx** (devDependency) — TypeScript test runner. Needed because Node 20.11.1 does not support `--experimental-strip-types`.

### shadcn Components Scaffolded
- `src/components/ui/input.tsx` — wraps `@base-ui/react/input`, has `data-slot="input"` attribute
- `src/components/ui/toggle.tsx` — wraps `@base-ui/react` Toggle primitive (ToggleGroup dependency)
- `src/components/ui/toggle-group.tsx` — wraps `@base-ui/react` ToggleGroup primitive

### Font Setup
- `src/app/layout.tsx` updated to import `Geist_Mono` from `next/font/google`
- Instantiated with `variable: "--font-geist-mono"` — satisfies the `globals.css` mapping `--font-mono: var(--font-geist-mono)`
- Body `className` now includes both `inter.className` and `geistMono.variable`

### TOTP Utility Module (`src/lib/totp.ts`)
Four pure, stateless utility functions:

1. **`validateBase32(value)`** — RFC 4648 base32 validation via `/^[A-Z2-7]+=*$/i`. Returns `null` for empty (no error per D-03) or valid input. Returns `"Invalid base32 secret"` for invalid non-empty input.

2. **`formatCode(code, digits)`** — Splits code into two halves: `"482039"` → `"482 039"`, `"48203951"` → `"4820 3951"`. Falls back to `"--- ---"` / `"---- ----"` when code is empty or wrong length (D-07).

3. **`getCountdownState(period)`** — Returns `{ secondsRemaining, progress, timeStep, barColor }` using wall-clock `Date.now()`. Colors: green >66%, yellow 33-66%, red ≤33% (D-10).

4. **`copyToClipboard(text)`** — `navigator.clipboard.writeText` wrapper. Returns `true`/`false` (T-02-02).

## Test Results

All 21 tests pass via `npx tsx src/lib/__tests__/totp.test.ts`:

```
validateBase32: 7/7 PASS
formatCode:     5/5 PASS
getCountdownState: 7/7 PASS
copyToClipboard: 2/2 PASS
21 passed, 0 failed
```

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 99c4d2b | feat | Install deps and scaffold shadcn components with Geist Mono |
| 4151964 | test | Add failing tests for TOTP utility functions (RED) |
| a134379 | feat | Implement TOTP utility module with pure helper functions (GREEN) |

## Deviations from Plan

### Auto-fixed Issues

None.

### Deviations

**1. [Rule 3 - Blocking] tsx installed as devDependency**
- **Found during:** Task 2 setup
- **Issue:** Node 20.11.1 does not support `--experimental-strip-types` (requires Node 22+). No test runner was available in the project.
- **Fix:** Installed `tsx` as a devDependency to run TypeScript tests via `npx tsx`.
- **Files modified:** `package.json`, `package-lock.json`
- **Commit:** 4151964 (included in test commit)

## Threat Surface Scan

No new network endpoints, auth paths, or file access patterns introduced. `src/lib/totp.ts` contains pure client-side functions — no server surface, no external calls.

T-02-01 mitigated: `validateBase32` uses RFC 4648 regex `/^[A-Z2-7]+=*$/i`.
T-02-02 accepted: `copyToClipboard` uses standard browser clipboard API.

## Known Stubs

None — no stub data or placeholder values in any file created by this plan.

## Self-Check: PASSED
