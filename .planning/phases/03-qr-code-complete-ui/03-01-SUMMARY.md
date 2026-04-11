---
phase: 03-qr-code-complete-ui
plan: 01
subsystem: totp-generator
tags: [qr-code, otpauth-uri, responsive-layout, totp, shadcn]
dependency_graph:
  requires: [02-02]
  provides: [complete-ui]
  affects: [src/components/totp-generator.tsx, src/lib/totp.ts]
tech_stack:
  added: []
  patterns: [useMemo-for-uri, grid-cols-1-md-grid-cols-2, default-export-qr-code]
key_files:
  created: []
  modified:
    - src/lib/totp.ts
    - src/lib/__tests__/totp.test.ts
    - src/components/totp-generator.tsx
decisions:
  - "Import QRCode as default from react-qr-code (not QRCodeSVG which is from qrcode.react)"
  - "buildOtpauthUri extracted to src/lib/totp.ts as pure utility for testability"
  - "uri computed via useMemo with [secret, issuer, account, algorithm, digits, period] dependencies"
  - "SHA warning placed inside Algorithm div block, contextually adjacent to the control"
  - "Two-column grid uses md: breakpoint (768px) for desktop/mobile reflow"
metrics:
  duration_minutes: 12
  completed_date: "2026-04-11T03:41:58Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
---

# Phase 03 Plan 01: QR Code + Complete UI Summary

## One-liner

Two-column responsive TOTP generator with `buildOtpauthUri` utility (padding-stripping, SHA-256 warning, `otpauth://` URI display + copy) and react-qr-code SVG rendering via `currentColor`/transparent for theme compatibility.

## What Was Built

### Task 1: buildOtpauthUri utility and tests

Added `buildOtpauthUri(params: OtpauthUriParams): string | null` to `src/lib/totp.ts`. The function:
- Strips base32 `=` padding before calling `generateURI` (prevents `%3D` encoding that breaks authenticator scanning)
- Returns `null` for empty/blank secrets
- Passes `issuer`, `label` (account), `algorithm`, `digits`, `period` to otplib's `generateURI`
- Imports `generateURI` and `HashAlgorithm` from `otplib` at the top of the utility file

Added 8 new test cases to `src/lib/__tests__/totp.test.ts` covering: URI prefix, padding strip, empty secret null return, SHA-256 algorithm token, SHA-1 default omission, empty issuer omission, non-default digits/period, and URL-encoded issuer with spaces.

All 29 tests pass (exit code 0).

### Task 2: Two-column layout + QR features in TOTPGenerator

Restructured `src/components/totp-generator.tsx` from a single-column `space-y-6` stack into:

- **Full-width:** Secret input with eye/copy/dice adornments (preserved exactly)
- **`grid grid-cols-1 md:grid-cols-2 gap-4`** two-column grid:
  - **Left column:** Algorithm/Digits/Period toggles, SHA-256/512 amber warning (`role="alert"`), TOTP code display + copy, countdown progress bar
  - **Right column:** Issuer input (`placeholder="Acme Corp"`), Account input (`placeholder="alice@example.com"`), QR code (192px SVG, level M, transparent bg, currentColor fg) or empty state placeholder, `otpauth://` URI display (monospace, truncated) + copy button

New additions:
- `issuer` and `account` `useState('')` for QR identity fields
- `uriCopied` `useState(false)` for URI copy feedback
- `uri` computed via `useMemo` over all relevant dependencies
- `QRCode` (default import from `react-qr-code`)
- `QrCode` icon (from `lucide-react`) for empty state
- `buildOtpauthUri` import from `@/lib/totp`
- `useMemo` added to React import line

All existing functionality preserved: secret validation, algorithm/digits/period toggles, TOTP code generation, countdown bar, copy buttons with check-mark feedback.

`npm run build` succeeds with zero TypeScript errors, static export generates `out/` directory.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all features are fully wired. The QR code renders live from actual state, issuer/account inputs update the URI reactively, and the URI display reflects the actual `otpauth://` string.

## Threat Flags

No new security surface beyond the plan's threat model. The issuer/account inputs are free-text with no execution or storage pathway, passed through `generateURI` which handles URL-encoding. The URI display is read-only DOM text. All client-side.

## Self-Check: PASSED

- `src/lib/totp.ts` contains `export function buildOtpauthUri` — FOUND
- `src/lib/totp.ts` contains `export interface OtpauthUriParams` — FOUND
- `src/lib/totp.ts` contains `import { generateURI } from 'otplib'` — FOUND
- `src/lib/totp.ts` contains `.replace(/=/g, '')` — FOUND
- `src/lib/__tests__/totp.test.ts` contains `buildOtpauthUri` — FOUND
- `src/lib/__tests__/totp.test.ts` contains `otpauth://totp/` — FOUND
- `src/lib/__tests__/totp.test.ts` contains `padded` — FOUND
- `npx tsx src/lib/__tests__/totp.test.ts` exits with code 0 — VERIFIED (29 passed, 0 failed)
- `src/components/totp-generator.tsx` contains `import QRCode from 'react-qr-code'` — FOUND
- `src/components/totp-generator.tsx` contains `import { buildOtpauthUri` — FOUND
- `src/components/totp-generator.tsx` contains `import { QrCode` (lucide) — FOUND
- `src/components/totp-generator.tsx` contains `grid grid-cols-1 md:grid-cols-2` — FOUND
- `src/components/totp-generator.tsx` contains `md:border-l md:border-border` — FOUND
- `src/components/totp-generator.tsx` contains `useMemo` — FOUND
- `src/components/totp-generator.tsx` contains `buildOtpauthUri(` — FOUND
- `src/components/totp-generator.tsx` contains `size={192}` — FOUND
- `src/components/totp-generator.tsx` contains `level="M"` — FOUND
- `src/components/totp-generator.tsx` contains `bgColor="transparent"` — FOUND
- `src/components/totp-generator.tsx` contains `fgColor="currentColor"` — FOUND
- `src/components/totp-generator.tsx` contains `aria-label="QR code for authenticator app"` — FOUND
- `src/components/totp-generator.tsx` contains `text-amber-500` — FOUND
- `src/components/totp-generator.tsx` contains `role="alert"` — FOUND
- `src/components/totp-generator.tsx` contains `SHA-256 and SHA-512 are not supported` — FOUND
- `src/components/totp-generator.tsx` contains `placeholder="Acme Corp"` — FOUND
- `src/components/totp-generator.tsx` contains `placeholder="alice@example.com"` — FOUND
- `src/components/totp-generator.tsx` contains `aria-label="Copy URI"` — FOUND
- `src/components/totp-generator.tsx` contains `otpauth:// URI` — FOUND
- `src/components/totp-generator.tsx` contains `uriCopied` — FOUND
- `npm run build` exits with code 0 and out/ directory exists — VERIFIED
