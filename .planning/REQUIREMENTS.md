# TOTP QR Code Generator — v1 Requirements

## v1 Requirements

### TOTP Core

- [ ] **TOTP-01**: User can input a TOTP secret (base32-encoded) in a text field
- [ ] **TOTP-02**: User can click a button to randomly generate a base32 secret
- [ ] **TOTP-03**: User can toggle show/hide on the secret field
- [ ] **TOTP-04**: User can copy the secret to clipboard
- [ ] **TOTP-05**: User can configure the hash algorithm (SHA1, SHA256, SHA512)
- [ ] **TOTP-06**: User can configure the number of digits (6 or 8)
- [ ] **TOTP-07**: User can configure the time period (30s or 60s)
- [ ] **TOTP-08**: Standard defaults are pre-filled: SHA1, 6 digits, 30-second period
- [ ] **TOTP-09**: App displays a live TOTP code that rotates automatically based on the configured period
- [ ] **TOTP-10**: App displays an animated countdown progress bar with color coding (green → yellow → red)
- [ ] **TOTP-11**: User can copy the current TOTP code to clipboard

### QR Code

- [ ] **QR-01**: User can input an issuer name for the QR code
- [ ] **QR-02**: User can input an account label for the QR code
- [ ] **QR-03**: App generates a QR code encoding the `otpauth://totp/` URI with all configured parameters
- [ ] **QR-04**: QR code is scannable by authenticator apps (Google Authenticator, Authy, Microsoft Authenticator)
- [ ] **QR-05**: App displays the raw `otpauth://` URI below the QR code (read-only, copyable)
- [ ] **QR-06**: App shows a warning when SHA-256/SHA-512 is selected, noting limited authenticator app support

### UI/UX

- [ ] **UI-01**: Single-page layout with all inputs, QR code, and live TOTP code visible together
- [x] **UI-02**: Dark and light themes with system-aware default and manual toggle
- [ ] **UI-03**: Fully responsive layout that works on mobile devices
- [ ] **UI-04**: All computation happens client-side — no backend, no data transmitted
- [ ] **UI-05**: No data persistence — everything is ephemeral (no localStorage, no cookies)

### Infrastructure

- [x] **INFRA-01**: Next.js with TypeScript and static export (`output: 'export'`)
- [x] **INFRA-02**: shadcn/ui + Tailwind CSS v4 for UI components
- [x] **INFRA-03**: Deployable to Vercel with zero server-side routes

## v2 Requirements (Deferred)

- HOTP (counter-based) support
- QR code download/export as image
- Multi-secret management (tabs or list)
- Code verification input (paste code to validate)
- Import/export configurations

## Out of Scope

- Backend or API endpoints — purely client-side by design
- Data persistence (localStorage, cookies, database) — ephemeral by design
- User authentication or accounts — anonymous tool
- Analytics or tracking — privacy-first

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| TOTP-01 | Phase 2 | Pending |
| TOTP-02 | Phase 2 | Pending |
| TOTP-03 | Phase 2 | Pending |
| TOTP-04 | Phase 2 | Pending |
| TOTP-05 | Phase 2 | Pending |
| TOTP-06 | Phase 2 | Pending |
| TOTP-07 | Phase 2 | Pending |
| TOTP-08 | Phase 2 | Pending |
| TOTP-09 | Phase 2 | Pending |
| TOTP-10 | Phase 2 | Pending |
| TOTP-11 | Phase 2 | Pending |
| QR-01 | Phase 3 | Pending |
| QR-02 | Phase 3 | Pending |
| QR-03 | Phase 3 | Pending |
| QR-04 | Phase 3 | Pending |
| QR-05 | Phase 3 | Pending |
| QR-06 | Phase 3 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 1 | Complete |
| UI-03 | Phase 3 | Pending |
| UI-04 | Phase 2 | Pending |
| UI-05 | Phase 2 | Pending |
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |

---
*Created: 2026-04-10*
