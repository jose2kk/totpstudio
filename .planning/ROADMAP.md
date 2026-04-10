# Roadmap: TOTP QR Code Generator

## Overview

Three phases from zero to shippable: First, scaffold the Next.js static-export project with Tailwind v4 and theme support locked in correctly from day one. Second, build the TOTP computation engine with live code display and countdown timer. Third, add QR code generation and wire the complete single-page layout into a deployable product. Every phase delivers something independently verifiable.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Next.js static-export project with Tailwind v4 and dark/light theme wired correctly (completed 2026-04-10)
- [ ] **Phase 2: TOTP Engine** - Live TOTP code computation with countdown timer and all secret/parameter controls
- [ ] **Phase 3: QR Code + Complete UI** - QR generation, otpauth URI display, and final responsive single-page layout

## Phase Details

### Phase 1: Foundation
**Goal**: A deployable Next.js skeleton exists with static export, Tailwind v4, shadcn/ui, and theme switching that won't cause hydration errors
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, UI-02
**Success Criteria** (what must be TRUE):
  1. `npm run build` produces a static `out/` directory with no errors
  2. The app deploys to Vercel and loads without hydration warnings in the browser console
  3. User can toggle between dark and light mode; the system default is applied on first load
  4. shadcn/ui components render correctly in both themes
**Plans**: 1 plan
Plans:
- [x] 01-01-PLAN.md — Scaffold project, wire theme system, build skeleton landing page
**UI hint**: yes

### Phase 2: TOTP Engine
**Goal**: Users can enter a secret, configure TOTP parameters, and see a live rotating code with animated countdown — all computed client-side
**Depends on**: Phase 1
**Requirements**: TOTP-01, TOTP-02, TOTP-03, TOTP-04, TOTP-05, TOTP-06, TOTP-07, TOTP-08, TOTP-09, TOTP-10, TOTP-11, UI-04, UI-05
**Success Criteria** (what must be TRUE):
  1. User can type or paste a base32 secret and see a 6-digit TOTP code appear
  2. User can click "Generate" to get a random valid base32 secret that immediately produces a code
  3. The TOTP code rotates automatically at the configured period and matches a reference authenticator app
  4. The countdown progress bar animates green → yellow → red and resets on each code rotation
  5. No network requests are made and page reload produces no pre-filled data
**Plans**: 2 plans
Plans:
- [ ] 02-01-PLAN.md — Install dependencies, scaffold shadcn components, add Geist Mono font, create TOTP utility module
- [ ] 02-02-PLAN.md — Build TOTPGenerator component and wire into page
**UI hint**: yes

### Phase 3: QR Code + Complete UI
**Goal**: Users can scan a QR code with any authenticator app and see the complete single-page tool working responsively on mobile and desktop
**Depends on**: Phase 2
**Requirements**: QR-01, QR-02, QR-03, QR-04, QR-05, QR-06, UI-01, UI-03
**Success Criteria** (what must be TRUE):
  1. User can scan the QR code with Google Authenticator, Authy, or Microsoft Authenticator and the app adds the account correctly
  2. The raw `otpauth://totp/` URI is displayed below the QR code and can be copied to clipboard
  3. A visible warning appears when SHA-256 or SHA-512 is selected noting limited authenticator app support
  4. All inputs, the QR code, and the live TOTP code are visible together on a single page without scrolling on a 1280px desktop viewport
  5. The layout is usable on a 390px mobile viewport (iPhone 14) with no horizontal overflow
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/1 | Complete   | 2026-04-10 |
| 2. TOTP Engine | 0/2 | Not started | - |
| 3. QR Code + Complete UI | 0/? | Not started | - |
