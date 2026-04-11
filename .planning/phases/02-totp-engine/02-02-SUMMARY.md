---
phase: 02-totp-engine
plan: "02"
subsystem: totp-ui
tags: [totp, react, client-side, ui, countdown, clipboard, shadcn]
dependency_graph:
  requires:
    - 02-01 (otplib, shadcn Input/ToggleGroup, validateBase32/formatCode/getCountdownState/copyToClipboard)
  provides:
    - TOTPGenerator component rendering full TOTP UI (Phase 03 adds QR below this)
    - page.tsx wired with live TOTP engine
  affects:
    - src/app/page.tsx (CardContent now renders TOTPGenerator)
tech_stack:
  added: []
  patterns:
    - "'use client' single-component architecture for all TOTP state"
    - "Wall-clock timer: setInterval(1000) + Date.now() not setInterval decrement"
    - "Cancelled flag pattern for async generate() in setInterval cleanup"
    - "Absolute-positioned icon adornments inside relative Input wrapper (pr-24)"
    - "ToggleGroup value={[string]} array wrapper with empty-selection guard"
    - "key={timeStep} + animate-in/fade-in for code rotation fade"
    - "transition-none at period boundary to prevent slow 0→100 bar animation"
key_files:
  created:
    - src/components/totp-generator.tsx
  modified:
    - src/app/page.tsx
decisions:
  - "State types for secondsRemaining/progress/timeStep must be explicitly typed as number — initializing with period (30|60) causes TypeScript to infer SetStateAction<30|60>, breaking runtime setters"
metrics:
  duration: "~15 minutes"
  completed_date: "2026-04-10"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 02 Plan 02: TOTPGenerator Component Summary

**One-liner:** Built complete `TOTPGenerator` client component with secret input adornments, segmented parameter controls, live-rotating TOTP code with fade animation, and color-coded countdown progress bar — wired into page, static build verified.

## What Was Built

### TOTPGenerator Component (`src/components/totp-generator.tsx`)

Single `'use client'` component, 263 lines. Owns all TOTP state and computation.

**Secret input section (D-01, D-02, D-03):**
- Monospace Input, masked by default (`type="password"`)
- Three absolutely-positioned icon buttons inside the field: Eye/EyeOff toggle, Clipboard copy, Dices random generate
- `pr-24` padding prevents text overlap with the 3-button row
- `border-destructive` + inline error text "Invalid base32 secret" on non-empty invalid input
- Empty field shows no error (RESEARCH Pitfall 5 guard)

**Parameter segmented controls (D-05, D-06):**
- Three labeled ToggleGroups with `variant="outline"`: Algorithm (SHA-1/SHA-256/SHA-512), Digits (6/8), Period (30s/60s)
- Defaults: sha1 / 6 / 30 (TOTP-08)
- `value={[string]}` array wrapper per base-ui API; `values.length > 0` guard prevents deselection (RESEARCH Pitfall 1)
- Algorithm item values are lowercase `"sha1"/"sha256"/"sha512"` matching `HashAlgorithm` type (RESEARCH Pitfall 3)

**TOTP code display (D-07, D-08):**
- `formatCode(code, digits)` groups code into halves: "482 039" / "---- ----" (dashes when no valid secret)
- 30px semibold monospace, muted color when no/invalid secret
- `key={timeStep}` triggers React remount + `animate-in fade-in duration-200` on code rotation
- `aria-live="polite"` for screen reader announcements
- Clipboard copy button with Check icon confirmation (1500ms)

**Countdown progress bar (D-09, D-10, D-11):**
- `h-1` bar with `bg-muted` track and colored fill
- Color transitions: green >66%, yellow 33-66%, red ≤33% (RESEARCH Pattern 3)
- `transition-[width] duration-[950ms] ease-linear` on each tick
- `transition-none` when `secondsRemaining === period` (period boundary reset — RESEARCH Pitfall 4)
- `role="progressbar"` with `aria-valuenow/min/max`
- Right-aligned seconds label `{N}s`

**Wall-clock timer (RESEARCH Pattern 2):**
- `useEffect` with `setInterval(compute, 1000)` — derives all state from `Date.now()`
- `cancelled` boolean flag in closure — prevents `setState` on unmounted component (RESEARCH Pitfall 2)
- `clearInterval` in cleanup function
- `generate()` called async, errors caught and surface as secretError

### Page Wiring (`src/app/page.tsx`)

- Added `import { TOTPGenerator } from "@/components/totp-generator"`
- Replaced "Content coming in Phase 2" placeholder with `<TOTPGenerator />`
- All existing structure preserved (Card, CardHeader, CardTitle, CardDescription, Header)

### Build Verification

`npm run build` succeeded. Static export produced `out/` directory. Zero TypeScript errors. Zero ESLint errors.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 4f4a837 | feat | Build TOTPGenerator client component (263 lines) |
| 6e7a035 | feat | Wire TOTPGenerator into page, verify static build |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript type error: secondsRemaining state inferred as `30 | 60`**
- **Found during:** Task 2 build verification (`npm run build`)
- **Issue:** `useState(period)` where `period: 30 | 60` caused TypeScript to infer `SetStateAction<30 | 60>` for `setSecondsRemaining`. Any countdown value (e.g., `29`, `15`, `3`) is assignable to `number` but not to `30 | 60`, causing a type error.
- **Fix:** Changed to `useState<number>(30)` for `secondsRemaining`, `progress`, and `timeStep` to explicitly type as `number`.
- **Files modified:** `src/components/totp-generator.tsx`
- **Commit:** 6e7a035 (included in Task 2 commit)

## Threat Surface Scan

T-02-03 mitigated: Secret in `useState` only — no localStorage/sessionStorage/cookies. State cleared on page unload. Secret masked by default.

T-02-04 mitigated: `validateBase32` regex pre-check runs on every keystroke. `generate()` errors are caught and surfaced as `secretError`. React auto-escapes all rendered values.

T-02-06 mitigated: `cancelled` flag + `clearInterval` in useEffect cleanup prevents stale setState from concurrent async generate() calls on rapid parameter changes.

No new network endpoints, auth paths, file access patterns, or schema changes introduced. All computation is client-side.

## Known Stubs

None — all features are fully wired. TOTP code, countdown bar, copy buttons, and parameter controls all function from real state. No placeholder data.

## Self-Check: PASSED

- src/components/totp-generator.tsx: FOUND
- src/app/page.tsx: FOUND
- out/ directory (static export): FOUND
- Commit 4f4a837 (Task 1): FOUND
- Commit 6e7a035 (Task 2): FOUND
