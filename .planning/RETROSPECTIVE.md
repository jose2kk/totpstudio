# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-04-11
**Phases:** 3 | **Plans:** 4

### What Was Built
- Next.js 16 static-export foundation with Tailwind v4, shadcn/ui, and dark/light theme switching
- Complete TOTP engine: secret input (manual + random generation), parameter toggles (algorithm/digits/period), live rotating codes with animated countdown bar
- QR code generation with scannable SVG, issuer/account identity fields, otpauth:// URI display, SHA compatibility warning
- Two-column responsive layout (desktop grid, mobile stack) — all 24 requirements validated

### What Worked
- TDD for utility functions (totp.ts) caught edge cases early — padding strip, SHA-1 default omission
- Single `'use client'` component architecture kept state management simple and avoided RSC boundary complexity
- Phase-by-phase execution with clear dependency chains (Foundation → Engine → UI) made each phase independently verifiable
- Static export (`output: 'export'`) confirmed from day one — no late-stage deployment surprises

### What Was Inefficient
- SUMMARY.md one-liner extraction didn't auto-populate in milestone completion — required manual fix
- Phase 2 ROADMAP checkbox wasn't marked complete by automation (`roadmap_complete: false` in analyze)

### Patterns Established
- Wall-clock timer pattern: `setInterval(1000) + Date.now()` instead of decrement counters — drift-resistant
- `useMemo` for reactive URI computation from multiple state dependencies
- Theme-aware SVG rendering via `fgColor="currentColor"` + `bgColor="transparent"`
- Node assert + tsx as lightweight test runner for pure utility functions (no Jest overhead)
- `key={timeStep}` + CSS animation for code rotation visual feedback

### Key Lessons
1. otplib `generateURI` requires padding-stripped base32 secrets — always `.replace(/=/g, '')` before passing
2. SHA-256/512 are silently ignored by Google Authenticator and Microsoft Authenticator — UX warning is essential
3. `react-qr-code` default export is `QRCode`, not `QRCodeSVG` (that's from the different `qrcode.react` library)
4. shadcn CLI 4.2.0 uses oklch tokens (base-nova/neutral) instead of HSL zinc — visually equivalent, accept the new defaults

### Cost Observations
- Model mix: Sonnet for executor + verifier agents, Opus for orchestration
- 3 phases completed in 2 sessions
- Notable: Single-plan phases (1 and 3) executed fastest — Phase 2 with 2 plans had dependency sequencing overhead

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Learning |
|-----------|--------|-------|--------------|
| v1.0 MVP | 3 | 4 | TDD for utilities, static export from day one, wall-clock timers |

### Recurring Themes
- Client-side purity simplifies deployment but requires careful attention to bundle size and browser API compatibility
- shadcn/ui evolves rapidly — accept new defaults rather than fighting for old patterns
