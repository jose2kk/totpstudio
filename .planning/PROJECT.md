# TOTP QR Code Generator

## What This Is

A client-side web application that generates TOTP (Time-based One-Time Password) codes and QR codes for authenticator app scanning. Users can input or randomly generate a secret, configure TOTP parameters, view live rotating codes with a countdown timer, and scan a QR code with any authenticator app (Google Authenticator, Authy, etc.). Similar to totp.danhersam.com but with built-in QR code generation.

## Core Value

Generate accurate, live-updating TOTP codes with scannable QR codes — all client-side, no data leaves the browser.

## Requirements

### Validated (v1.0)

- ✓ App supports dark and light themes with system-aware default and manual toggle — v1.0
- ✓ User can input a TOTP secret (base32-encoded) in a text field — v1.0
- ✓ User can click a button to randomly generate a base32 secret for testing — v1.0
- ✓ User can configure TOTP parameters: algorithm (SHA1/SHA256/SHA512), digits (6/8), period (30s/60s) — v1.0
- ✓ Standard defaults are pre-filled: SHA1, 6 digits, 30-second period — v1.0
- ✓ App displays a live TOTP code that rotates automatically based on the configured period — v1.0
- ✓ App displays a countdown timer showing time remaining until next code rotation — v1.0
- ✓ All computation happens client-side — no backend, no data transmitted — v1.0
- ✓ No data persistence — everything is ephemeral, nothing stored in localStorage or cookies — v1.0
- ✓ User can input issuer name and account label for the QR code — v1.0
- ✓ App generates a QR code encoding the `otpauth://totp/` URI with all configured parameters — v1.0
- ✓ QR code is scannable by authenticator apps (Google Authenticator, Authy, Microsoft Authenticator) — v1.0
- ✓ App is fully responsive and works well on mobile devices — v1.0
- ✓ Single-page layout with all inputs, QR code, and live TOTP code visible together — v1.0

### Active

(None — v1.0 complete)

### Out of Scope

- HOTP (counter-based) support — TOTP only for v1
- QR code download/export — not needed
- Code verification/validation input — keep it simple, just display the generated code
- Backend/API — purely client-side
- Data persistence (localStorage, cookies, database) — ephemeral by design
- Multi-secret management — one secret at a time

## Context

- Shipped v1.0 with ~1,688 LOC TypeScript across 20 source files
- Tech stack: Next.js 16 (static export), React 19, Tailwind v4, shadcn/ui, otplib, react-qr-code
- Inspired by https://totp.danhersam.com/ but with built-in QR code generation
- Target users: developers testing 2FA integrations, QA engineers, or anyone needing to quickly set up TOTP
- QR codes encode the standard `otpauth://totp/` URI format per the Google Authenticator Key URI spec
- All TOTP computation uses standard HMAC-based algorithms (RFC 6238)

## Constraints

- **Tech Stack**: Next.js with TypeScript — mandatory
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Deployment**: Vercel — static/client-side only, no server-side routes or API endpoints
- **No Backend**: All logic runs in the browser
- **No Persistence**: Zero storage of user data

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + TypeScript | User requirement, good Vercel integration | ✓ Phase 01 |
| shadcn/ui + Tailwind | Polished component library with consistent design system | ✓ Phase 01 |
| Client-side only | Privacy-first, no sensitive data leaves browser | ✓ Phase 02 |
| Single-page layout | All context visible at once, simpler UX for a tool | ✓ Phase 03 |
| Standard TOTP defaults (SHA1/6/30s) | Matches Google Authenticator defaults, most common config | ✓ Phase 02 |
| No QR download | Keep scope minimal | ✓ Confirmed |
| otplib for TOTP engine | TypeScript-first, 1.57M downloads, audited @noble/hashes | ✓ Phase 02 |
| react-qr-code for QR | SVG output scales cleanly, theme-aware via currentColor | ✓ Phase 03 |
| Two-column responsive grid | md breakpoint (768px), params left / QR right | ✓ Phase 03 |
| TDD for utilities | Node assert + tsx for pure functions | ✓ Phase 02-03 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-10 after v1.0 milestone*
