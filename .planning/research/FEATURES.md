# Feature Research

**Domain:** TOTP QR Code Generator (developer/QA tool)
**Researched:** 2026-04-10
**Confidence:** HIGH (cross-referenced 6+ live tools, RFC 6238, Google Key URI spec)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Base32 secret input | Every TOTP tool starts here; it's the primary input | LOW | Must accept lowercase too and normalize |
| Live TOTP code display | The entire point of the tool; users need to see the code | LOW | Must auto-refresh when period expires |
| Countdown timer | Users need to know how much time remains before rotation | LOW | All surveyed tools show this; missing it feels broken |
| Copy code to clipboard | Developers paste the code into test flows constantly | LOW | Click/tap on code itself is the expected UX pattern |
| Algorithm selector (SHA1/SHA256/SHA512) | Expected by developers; SHA1 is default per RFC 6238 | LOW | Note: Google Authenticator ignores non-SHA1 settings |
| Digit count selector (6 or 8) | Standard config option per otpauth URI spec | LOW | Default 6 |
| Period selector (30s or 60s) | Standard config option; 30s is default | LOW | Default 30 |
| Standard defaults pre-filled | SHA1 + 6 digits + 30s matches Google Authenticator | LOW | Without defaults, first-time users are confused |
| QR code from otpauth:// URI | The core differentiator vs totp.danhersam.com; scanner apps expect this format | MEDIUM | Must use standard `otpauth://totp/Label?secret=...&issuer=...` format |
| Issuer and account label inputs | Required for a meaningful QR code; apps display these labels | LOW | Issuer name appears in authenticator app UI |
| QR code scannable by major apps | Google Authenticator, Authy, Microsoft Authenticator must work | MEDIUM | Test against all three during development |
| Client-side only, no data transmitted | Security-sensitive tool; users will not trust server-round-trips | LOW | This is a hard prerequisite for trust |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Random secret generation | Developers testing new TOTP integrations need a quick test secret; copying from an app is cumbersome | LOW | Use `crypto.getRandomValues()` for cryptographically strong secrets; output base32 |
| Show/hide secret toggle | Secrets are sensitive; shoulder-surfing is a real concern at a desk; users expect password-field behavior | LOW | Eye icon pattern is universally understood |
| Visual countdown progress bar | Color-coded bar (green → yellow → red) gives faster cognitive signal than raw seconds; seen in best-in-class tools (toolv.com, 1024tools.com) | LOW | Yellow at ~33%, red at ~10s |
| Dark/light theme with system default | Developers spend hours in dark mode; no dark mode = tool feels half-finished in 2025 | LOW | `prefers-color-scheme` + manual toggle; shadcn/ui makes this trivial |
| Responsive mobile layout | QA engineers often have the tool open on desktop while scanning with their phone; layout must not break | LOW | Single-column flow works well on mobile |
| Inline otpauth:// URI display | Advanced users want to verify the URI being encoded; shows transparency; enables manual entry fallback | LOW | Read-only text field below QR code |
| Copy secret to clipboard | Developers often need to paste the secret into a `.env` or config file while testing | LOW | Separate copy button next to secret field |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Save/persist secrets (localStorage) | Users want to return to previously tested secrets | Storing TOTP secrets in localStorage is a security risk; anyone with brief physical access can extract all secrets; creates false sense of security; contradicts the ephemeral/privacy-first value prop | Explicitly document that secrets are ephemeral; users should store secrets in their password manager |
| QR code image download/export | Users want to save the QR for later | Saved QR images are a security liability — any image file containing a TOTP secret can be used to impersonate the user; misaligns with the privacy-first posture | Provide the otpauth:// URI in a copyable text field so users can store it safely in a credential manager |
| HOTP (counter-based) support | HOTP is part of the RFC family; some tools support it | HOTP is rarely used in practice; adds UI complexity (counter input) with near-zero practical demand for this tool's target users; developers testing 2FA almost universally use TOTP | Label clearly as TOTP-only; add a note if users ask |
| Multi-secret management / saved accounts | Some tools (authgear, toolv.com) allow saving 10 accounts | Turns a focused developer tool into a half-baked authenticator app; creates scope creep into a domain (credential management) that requires serious security hardening | One secret at a time; keep the tool sharp and focused |
| Code verification input field | Seems like a good "round-trip" test | The tool is a generator, not a verifier; adding an input field conflates two separate concerns; verification belongs in the target application under test | Display the generated code prominently; developers compare it in their app manually |
| QR code scanning/import (camera or file) | Some tools support scanning an existing QR to decode it | Adds significant complexity (camera permissions, file parsing); most users arrive with a secret string, not a QR to decode; out of scope for this generator tool | Manual secret input is sufficient for the target use case |
| Shareable URL with secret in fragment | 1024tools.com does this for collaboration | Even with fragment-only storage, sharing a URL containing a TOTP secret is a bad practice the tool should not encourage | No URL sharing; secrets stay in the browser session only |

## Feature Dependencies

```
[Secret Input]
    └──required by──> [TOTP Code Display]
    └──required by──> [QR Code Generation]
    └──required by──> [otpauth URI Display]

[Algorithm + Digits + Period Config]
    └──required by──> [TOTP Code Display]  (must match server config)
    └──required by──> [QR Code Generation]  (encoded in URI)

[Issuer + Account Label Input]
    └──required by──> [QR Code Generation]  (otpauth URI needs label field)

[TOTP Code Display]
    └──requires──> [Countdown Timer]  (code and timer are semantically paired)

[Countdown Timer]
    └──enhances──> [Visual Progress Bar]  (bar is a presentation of timer data)

[Random Secret Generation]
    └──enhances──> [Secret Input]  (populates input field)

[Show/Hide Toggle]
    └──enhances──> [Secret Input]  (UI control on the same field)

[Copy Code]
    └──requires──> [TOTP Code Display]

[Copy Secret]
    └──requires──> [Secret Input]
```

### Dependency Notes

- **Config (algorithm/digits/period) required by both TOTP display and QR code:** These must be consistent — if a user changes period to 60s, both the live code and the QR code must reflect that. They share a single source of state.
- **Issuer/label required by QR generation:** Without them the otpauth URI is technically valid but useless — authenticator apps display blank account entries.
- **Countdown timer and code display are coupled:** Displaying a code without a timer means users don't know if the code is about to expire. They always render together.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Secret input field (with show/hide toggle) — primary input; without it nothing works
- [ ] Random secret generator button — enables instant testing without a real secret
- [ ] Algorithm / digits / period selectors with standard defaults (SHA1/6/30s) — required for correct TOTP computation
- [ ] Issuer name and account label inputs — required for a useful QR code
- [ ] Live TOTP code with auto-rotation — core output
- [ ] Countdown timer with visual progress bar — makes the tool trustworthy and usable
- [ ] Copy code to clipboard — removes friction from the main workflow
- [ ] QR code from otpauth:// URI — the primary differentiator over totp.danhersam.com
- [ ] Inline otpauth:// URI display (read-only, copyable) — transparency + manual entry fallback
- [ ] Dark/light theme with system default — expected in 2025; shadcn/ui makes this low-cost
- [ ] Responsive single-page layout — QA engineers use desktop + phone simultaneously
- [ ] Client-side only, zero persistence — non-negotiable for trust

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Copy secret to clipboard — common workflow; deferred only to keep v1 focused
- [ ] Animated progress bar color transition (green → yellow → red) — nice polish; add after core UX is validated

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Service presets (GitHub, AWS, etc.) — saves issuer/label typing; only worthwhile if users request it
- [ ] Offline PWA / service worker — useful if repeated visits prove common; overkill for v1

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Secret input + show/hide | HIGH | LOW | P1 |
| Random secret generation | HIGH | LOW | P1 |
| Algorithm/digits/period config | HIGH | LOW | P1 |
| Live TOTP code + auto-rotation | HIGH | LOW | P1 |
| Countdown timer | HIGH | LOW | P1 |
| Copy code to clipboard | HIGH | LOW | P1 |
| QR code generation | HIGH | MEDIUM | P1 |
| Issuer + account label inputs | HIGH | LOW | P1 |
| otpauth:// URI display | MEDIUM | LOW | P1 |
| Dark/light theme | MEDIUM | LOW | P1 |
| Responsive layout | MEDIUM | LOW | P1 |
| Visual progress bar (color-coded) | MEDIUM | LOW | P2 |
| Copy secret to clipboard | MEDIUM | LOW | P2 |
| Service presets | LOW | LOW | P3 |
| Offline PWA | LOW | MEDIUM | P3 |

## Competitor Feature Analysis

| Feature | totp.danhersam.com | toolv.com | 1024tools.com | deepnetsecurity.com | Our Approach |
|---------|-------------------|-----------|---------------|---------------------|--------------|
| Live TOTP code | Yes | Yes | Yes | No (on-demand only) | Yes |
| Countdown timer | Yes (text) | Yes (progress bar) | Yes (progress bar) | No | Progress bar + seconds |
| QR code output | No | Yes | Yes | Yes | Yes — core feature |
| otpauth URI display | No | No | Yes | Yes | Yes |
| Random secret gen | No | No | No | Yes (16/20/32 chars) | Yes |
| Show/hide secret | No | Yes | Yes | No | Yes |
| Copy code | Yes (clipboard icon) | Yes | Yes | No | Yes |
| Copy secret | No | No | No | No | Yes (v1.x) |
| Algorithm selector | No | Yes | No | Yes | Yes |
| Digits selector | Yes | Yes | No | Yes | Yes |
| Period selector | Yes | Yes | No | Yes | Yes |
| Dark mode | No | No | No | No | Yes — differentiator |
| Multi-account save | No | Yes (local) | No | No | No — anti-feature |
| QR download | No | No | No | Yes (PNG) | No — anti-feature |
| Mobile responsive | Partial | Yes | Yes | Partial | Yes |

## Sources

- [totp.danhersam.com](https://totp.danhersam.com/) — baseline reference tool
- [Authgear TOTP Authenticator](https://www.authgear.com/tools/totp-authenticator) — feature reference
- [toolv.com TOTP Generator](https://toolv.com/en/app/totp-generator) — best-in-class UX reference
- [1024tools.com 2FA tool](https://1024tools.com/en/2fa) — otpauth URI display, shareable URL pattern (anti-feature example)
- [Deepnet Security OTP QR Generator](https://www.deepnetsecurity.com/tools/otp-qr-generator/) — QR + URI generation reference
- [Stefan Sundin 2fa-qr](https://stefansundin.github.io/2fa-qr/) — advanced QR generator with service presets
- [FreeOTP QR Generator](https://freeotp.github.io/qrcode.html) — reference for extended algorithm support
- RFC 6238 — TOTP standard
- Google Authenticator Key URI Format — otpauth:// URI spec

---
*Feature research for: TOTP QR Code Generator*
*Researched: 2026-04-10*
