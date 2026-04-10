# Pitfalls Research

**Domain:** TOTP QR Code Generator (client-side Next.js webapp)
**Researched:** 2026-04-10
**Confidence:** HIGH — findings verified against RFC specs, official Google Authenticator wiki, Next.js docs, and live GitHub issue threads.

---

## Critical Pitfalls

### Pitfall 1: Base32 Padding Characters Breaking Authenticator App Scanning

**What goes wrong:**
The generated `otpauth://` URI includes trailing `=` padding characters in the `secret` parameter. iOS Google Authenticator silently rejects the QR code. The user scans successfully but gets no account added, or the codes generated are wrong.

**Why it happens:**
JavaScript base32 encoding libraries follow RFC 3548 and output padded strings by default (e.g., `JBSWY3DPEHPK3PXP====`). Developers pass this directly into the URI without stripping padding. Google's Key Uri Format spec explicitly states: "The padding specified in RFC 3548 section 2.2 is not required and should be omitted." This is a real, documented failure mode in KeePassXC and multiple other tools.

**How to avoid:**
Strip all trailing `=` characters from the base32 secret before constructing the URI. In JavaScript: `secret.replace(/=+$/, '')`. Use a library that outputs unpadded base32 by default, or sanitize the output. Verify the URI by parsing it back and confirming the raw byte sequence survives intact.

**Warning signs:**
- Authenticator app scans the QR code with no error but no account appears
- Codes are generated but never match during verification
- The `secret` parameter in the URI ends with `=` characters

**Phase to address:**
TOTP core implementation phase — treat this as a required test: generate a secret, build the URI, confirm no `=` in the secret param, scan with Google Authenticator.

---

### Pitfall 2: T Counter Not Encoded as 64-bit Big-Endian Integer

**What goes wrong:**
The HMAC input (the time counter T = `floor(unix_timestamp / period)`) is not packed as an 8-byte big-endian integer. The resulting HMAC is computed over wrong bytes, producing codes that never match any authenticator app output — all codes fail for all users consistently.

**Why it happens:**
RFC 6238 Section 4 mandates: "The T is represented as an 8-byte big-endian unsigned integer." Developers using `Buffer.from(T.toString())` or encoding T as a 4-byte integer produce completely wrong HMAC inputs. This is frequently missed when rolling a custom implementation or using an unmaintained library.

**How to avoid:**
Use a well-maintained library (`otpauth` npm package) that has RFC-compliant byte packing. If implementing manually, use a `DataView` with `setUint32` in two 4-byte chunks (high-word first, low-word second) to produce the 8-byte big-endian buffer. Verify output against RFC 6238 Appendix B test vectors before shipping.

**Warning signs:**
- Codes generated never match Google Authenticator for the same secret
- Codes change correctly on timer, but values are wrong
- Works with one library but not another

**Phase to address:**
TOTP core implementation phase — run the RFC 6238 Appendix B test vectors as unit tests before any UI work.

---

### Pitfall 3: otpauth URI Label Encoding: Spaces as `+` Instead of `%20`

**What goes wrong:**
The issuer name or account label contains spaces (e.g., "My Company" or "alice smith"). The code uses `encodeURIComponent()` incorrectly or uses form-style encoding, producing `My+Company` instead of `My%20Company`. Authenticator apps display the account name as "My+Company" (literal plus signs in the display name). The TOTP codes still work, but the UX is broken.

**Why it happens:**
RFC 1866 specifies that `+` encodes spaces only in HTML form submissions. The `otpauth://` label segment is a URI path component, not a query string. `encodeURIComponent()` correctly uses `%20` for spaces, but developers sometimes use custom encoding or confuse form encoding with URI encoding. The Google spec uses `%20` in its examples but does not explicitly forbid `+`, causing library-level inconsistency.

**How to avoid:**
Always use `encodeURIComponent()` for both the issuer prefix in the label and the `issuer` query parameter. Never use `encodeURI()` on label components (it does not encode special URI characters). Test the QR code scan result with a real authenticator app, checking the displayed account name.

**Warning signs:**
- Scanned account names show literal `+` characters where spaces should be
- Issuer shows as `My+Org` in the authenticator app

**Phase to address:**
QR code generation phase — add a smoke test: input "My Company" as issuer, scan result, confirm display name is "My Company".

---

### Pitfall 4: Issuer Appears in Label Prefix AND Query Parameter — Mismatch Breaks Old Apps

**What goes wrong:**
The issuer string in the label prefix (`otpauth://totp/IssuerName:account`) differs from the `issuer=` query parameter, or one of them is missing. Old authenticator apps (including some versions of Google Authenticator) rely only on the label prefix; newer apps use the `issuer` parameter. A mismatch causes different display names across apps, or accounts showing up with no issuer name.

**Why it happens:**
The Google Key URI Format spec says both should be present and match, but many tutorials only show one of the two. The spec itself has ambiguity about what happens when they disagree, and there is no formal RFC governing this.

**How to avoid:**
Include issuer in both places, with identical values:
`otpauth://totp/{issuer}:{account}?secret={secret}&issuer={issuer}&algorithm=SHA1&digits=6&period=30`
URL-encode both instances with `encodeURIComponent()`. If issuer is empty, omit the `issuer:` prefix from the label entirely — don't leave a dangling colon.

**Warning signs:**
- Account shows in authenticator without an issuer/service name
- Different apps show different names for the same QR code

**Phase to address:**
QR code generation phase — test with Google Authenticator, Authy, and Microsoft Authenticator using issuer names with spaces and special characters.

---

### Pitfall 5: SHA-256 / SHA-512 Selected by User but Ignored by Most Authenticator Apps

**What goes wrong:**
The app offers SHA-256 or SHA-512 as selectable algorithm options. A user configures SHA-256, the app generates the correct SHA-256 TOTP codes. The user scans the QR code. Google Authenticator and Microsoft Authenticator both silently ignore the `algorithm=SHA256` parameter and use SHA-1 internally, generating different codes. The scanned account is permanently misconfigured with no error shown to the user.

**Why it happens:**
Google Authenticator's Key URI Format spec says `algorithm` is currently ignored on Android. This is a documented behavior. Microsoft Authenticator exhibits the same behavior. Only Authy and hardware tokens like YubiKey fully support non-default algorithms.

**How to avoid:**
Two options:
1. Show a prominent warning when SHA-256 or SHA-512 is selected: "Most authenticator apps (Google Authenticator, Microsoft Authenticator) ignore this parameter and use SHA-1. Only use non-SHA-1 if you control both the server and client."
2. Default to SHA-1 and disable the others unless the user explicitly opts in with an acknowledged warning.

**Warning signs:**
- User reports "codes don't work" after scanning — this is the most likely cause if they selected a non-default algorithm
- No error from the authenticator app during scan — the failure is silent

**Phase to address:**
UI/UX phase — add warning copy next to the algorithm selector before first ship.

---

### Pitfall 6: Dark Mode Hydration Mismatch with next-themes

**What goes wrong:**
The app flickers between light and dark on initial load, or Next.js throws a hydration error in the console: "Text content does not match server-rendered HTML." In production builds with `output: export`, the HTML snapshot has one theme class on `<html>`, but the client renders a different one on mount.

**Why it happens:**
`next-themes` reads the user's saved preference from `localStorage` or `prefers-color-scheme` media query — neither is available during server-side rendering or static HTML generation. The server emits `<html class="">` or `<html class="light">` but the client immediately switches to `dark` on mount. React detects the mismatch.

**How to avoid:**
Two required changes:
1. Add `suppressHydrationWarning` to the `<html>` element in `layout.tsx` — this tells React to expect and ignore the theme class difference.
2. Wrap `ThemeProvider` in a client component marked `"use client"`.
3. For the theme toggle button: render it only after `mounted === true` (set via `useEffect`) to avoid the server/client class name mismatch on the button icon.

**Warning signs:**
- Theme flash visible on page load in production
- React hydration warning in browser console
- Theme toggle shows wrong icon on first render

**Phase to address:**
Project setup/scaffolding phase — configure this correctly before building any UI components.

---

### Pitfall 7: setInterval Drift When Browser Tab Is Hidden

**What goes wrong:**
The countdown timer and live TOTP code stop updating correctly when the user switches to another tab. The displayed code becomes stale. On Chrome, `setInterval` in background tabs is throttled to fire at most once per second regardless of the specified interval, and in some cases it's throttled further (once per minute for tabs inactive for more than a few minutes).

**Why it happens:**
Browsers throttle timers in background/hidden tabs to save CPU. This is documented browser behavior. An interval set to `500ms` for smooth countdown animation will fire at `~1000ms` intervals in a background tab, causing visible lag or missed code rotations.

**How to avoid:**
Use the Page Visibility API (`document.addEventListener('visibilitychange', ...)`) to recalculate the countdown and current TOTP code immediately when the tab becomes visible again. Compute the remaining time from `Date.now()` directly (epoch mod period) rather than decrementing a counter via `setInterval`. This makes the display self-correcting: `secondsRemaining = period - (Math.floor(Date.now() / 1000) % period)`.

**Warning signs:**
- Countdown shows wrong number of seconds after returning to the tab
- TOTP code has expired but the UI still shows it
- Timer catches up visibly after tab switch

**Phase to address:**
TOTP core implementation phase — compute countdown from wall clock, not from interval counter.

---

### Pitfall 8: Next.js Static Export Silently Drops Server-Only Features

**What goes wrong:**
Setting `output: 'export'` in `next.config.ts` disables: Route Handlers that access `Request`, cookies, redirects, rewrites, headers, Server Actions, Incremental Static Regeneration, `next/image` default optimization loader, Middleware, and Draft Mode. If any of these are accidentally introduced, the build may succeed locally (with a dev server) but fail on `next build` or produce silent no-ops in the exported HTML.

**Why it happens:**
`next dev` runs a Node.js server and does not enforce static export constraints. A developer adds a Route Handler or Server Action during local development, tests it, and everything works — the constraint only surfaces at `next build` or after deployment.

**How to avoid:**
Verify `next.config.ts` has `output: 'export'` set from day one. Audit every file: no `route.ts` Route Handlers, no `"use server"` Server Actions, no `next/image` without `unoptimized: true` in config. For this project, image optimization is not needed at all — add `images: { unoptimized: true }` as a precaution. Keep all logic in `"use client"` components using Web Crypto API.

**Warning signs:**
- `next build` error: "Page could not be rendered statically"
- `next/image` warnings during build about missing loader config
- A feature that works with `next dev` silently does nothing after deployment

**Phase to address:**
Project setup/scaffolding phase — configure static export constraints before writing any feature code.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `speakeasy` npm package | Quick TOTP generation | Unmaintained (last update 7+ years ago), known base32 length bugs for non-multiple-of-8 secrets | Never — use `otpauth` instead |
| Rolling custom base32 decoder | No dependency | Subtle bugs with padding, non-standard input, case sensitivity | Never — use a tested library |
| Decrementing a counter in `setInterval` for countdown | Simple code | Becomes stale after tab switch; accumulates drift | Never for TOTP; use wall-clock math |
| Omitting `issuer` query parameter | Shorter URI | Old authenticator apps don't show issuer name | Never — include both label prefix and query param |
| Not stripping `=` padding from base32 | One fewer step | iOS Google Authenticator rejects the QR code | Never |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google Authenticator | Setting algorithm=SHA256 expecting it to be respected | Default to SHA1; warn prominently for non-default algorithms; test with real app |
| Authy | Omitting `issuer` parameter | Include `issuer` as both label prefix and query parameter |
| Microsoft Authenticator | URI with `+` encoding for spaces | Always use `%20` via `encodeURIComponent()` |
| QR code library (qrcode.react / react-qr-code) | Generating QR code on server (SSR) | Mark QR code component as `"use client"`, render only after mount |
| next-themes | Missing `suppressHydrationWarning` on `<html>` | Add attribute to `<html>` in `layout.tsx`; wrap ThemeProvider in a client component |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-importing HMAC key on every TOTP calculation | CPU spike every 30 seconds | Cache the imported `CryptoKey` object; re-import only when secret changes | Noticeable on lower-end mobile immediately |
| Re-computing QR code SVG on every keystroke | Input lag while typing issuer/label | Debounce QR code regeneration by ~300ms | Any device during fast typing |
| `setInterval` at 100ms for smooth countdown | Unnecessary CPU drain | 1-second intervals are sufficient for a countdown display | Always wasteful; imperceptible to users |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing entered secret in `localStorage` as a convenience | Secret persists across sessions, contradicting the app's ephemeral-by-design privacy model | Explicitly do not persist. The PROJECT.md constraint is "no data persistence" — enforce it in code review |
| Console-logging the TOTP secret during debugging | Secret visible in browser devtools, screen recordings | Remove all `console.log` calls that include the secret before merge |
| Generating cryptographically weak random secrets | Predictable TOTP secrets during testing | Use `crypto.getRandomValues()` (Web Crypto) for random secret generation, not `Math.random()` |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing algorithm/digits/period options without explaining app compatibility | User selects SHA-256, scans QR code, codes never work — no indication why | Show inline compatibility notes: "SHA-1 — supported by all apps", "SHA-256 — not supported by Google/Microsoft Authenticator" |
| Countdown timer resets to wrong value after tab switch | User sees timer jump, thinks app is broken | Compute remaining seconds from `Date.now()` epoch math, not from a decrementing counter |
| QR code is too small or low contrast in dark mode | Mobile camera fails to scan | Enforce minimum QR code size (200×200px), use high-contrast colors — black modules on white background regardless of theme |
| No feedback when secret input is invalid base32 | User enters a hex string or lowercase secret, gets wrong codes with no error | Validate on input: only A-Z and 2-7 characters; strip spaces, uppercase silently; show an error for invalid characters |
| Empty issuer/label producing a bare `otpauth://totp/:secret?...` URI | Authenticator shows account with no name | If issuer is empty, omit the prefix and show placeholder text explaining the QR will use account name only |

---

## "Looks Done But Isn't" Checklist

- [ ] **TOTP correctness:** Codes match Google Authenticator for the same secret. Test with a known secret from RFC 6238 Appendix B test vectors.
- [ ] **Base32 padding:** The `secret` in the `otpauth://` URI has no trailing `=` characters.
- [ ] **URI encoding:** Issuer and label with spaces produce `%20`, not `+`. Verify by inspecting the raw URI string before QR encoding.
- [ ] **Dual issuer:** Both the label prefix (`Issuer:account`) and `issuer=` query parameter are present and match.
- [ ] **SHA-1 default:** The algorithm selector defaults to SHA-1, with a visible compatibility warning for SHA-256/SHA-512.
- [ ] **Tab-switch resilience:** Switch to another tab for 2 minutes, return — countdown and code are correct.
- [ ] **Dark mode no-flash:** Hard-reload the page in dark mode preference — no white flash before dark styles apply.
- [ ] **Hydration clean:** Zero hydration warnings in browser console on initial load.
- [ ] **Static export builds:** `next build` completes with no errors about dynamic/server features.
- [ ] **QR code scannability:** Code is scannable from a phone at arm's length — test actual physical scan, not just visual inspection.
- [ ] **Invalid base32 input:** Entering `0`, `1`, `8`, `9`, or lowercase letters shows a validation error.
- [ ] **No localStorage writes:** Open Application tab in DevTools, cycle through inputs — localStorage remains empty throughout.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong TOTP codes (byte encoding bug) | MEDIUM | Replace TOTP library or fix byte packing; run RFC 6238 test vectors; no UI changes needed |
| QR code scanning fails (padding bug) | LOW | Strip `=` from secret in URI builder; single-line fix |
| Hydration mismatch / dark mode flash | LOW | Add `suppressHydrationWarning` to `<html>`; wrap ThemeProvider correctly |
| Static export build failures | LOW-MEDIUM | Audit for server-only features; move logic to client components; add `images: { unoptimized: true }` |
| Stale TOTP codes after tab switch | LOW | Refactor countdown to epoch-based math; requires touching only the timer logic |
| Authenticator shows wrong issuer name | LOW | Fix URI builder to include both label prefix and `issuer` param; verify encoding |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Base32 padding `=` in URI | TOTP core implementation | Parse URI back, assert `secret` param has no `=` |
| T counter not 64-bit big-endian | TOTP core implementation | RFC 6238 Appendix B test vectors pass |
| Spaces encoded as `+` in URI | QR code generation | Scan QR with app, verify displayed name has no `+` |
| Issuer mismatch / missing dual issuer | QR code generation | Test with Google Authenticator and Authy |
| SHA-256/SHA-512 compatibility warning missing | UI/UX build | Visual review of algorithm selector labels |
| Dark mode hydration mismatch | Project setup/scaffolding | Zero hydration warnings in console after hard reload |
| setInterval drift on tab switch | TOTP core implementation | Switch tabs for 60s, return, verify correct countdown |
| Static export incompatible features | Project setup/scaffolding | `next build` completes without errors or warnings |

---

## Sources

- [Google Authenticator Key URI Format — official specification](https://github.com/google/google-authenticator/wiki/Key-Uri-Format)
- [RFC 6238 — TOTP: Time-Based One-Time Password Algorithm](https://datatracker.ietf.org/doc/html/rfc6238)
- [5 Common TOTP Mistakes Developers Make — Authgear](https://www.authgear.com/post/5-common-totp-mistakes)
- [KeePassXC Issue #3255: Trailing = signs in base32 break iOS Google Authenticator](https://github.com/keepassxreboot/keepassxc/issues/3255)
- [Speakeasy Issue #135: Base32 secrets not a multiple of 8 produce incorrect codes](https://github.com/speakeasyjs/speakeasy/issues/135)
- [Strange Encoding Errors in TOTP QR Codes — Terence Eden](https://shkspr.mobi/blog/2022/05/strange-encoding-errors-in-totp-qr-codes/)
- [shadcn/ui Dark Mode for Next.js — official docs](https://ui.shadcn.com/docs/dark-mode/next)
- [shadcn-ui Issue #5552: ThemeProvider creates hydration error in Next.js 15](https://github.com/shadcn-ui/ui/issues/5552)
- [Fixing Hydration Mismatch in Next.js (next-themes)](https://medium.com/@pavan1419/fixing-hydration-mismatch-in-next-js-next-themes-issue-8017c43dfef9)
- [Next.js Static Exports — official docs](https://nextjs.org/docs/app/guides/static-exports)
- [Browser throttling of setInterval in inactive tabs](https://pontistechnology.com/learn-why-setinterval-javascript-breaks-when-throttled/)
- [Overcoming browser throttling of setInterval executions](https://medium.com/@adithyaviswam/overcoming-browser-throttling-of-setinterval-executions-45387853a826)
- [Google Authenticator algorithm=SHA256 issue — Keycloak](https://github.com/keycloak/keycloak/issues/27349)
- [TOTP algorithm parameter ignored — Bitwarden Community](https://community.bitwarden.com/t/totp-algorithm-parameter-sha256-sha512-appears-ignored-generates-sha1-codes-only/95746)
- [draft-linuxgemini-otpauth-uri-02 — IETF Internet Draft](https://datatracker.ietf.org/doc/html/draft-linuxgemini-otpauth-uri-02)

---
*Pitfalls research for: TOTP QR Code Generator webapp*
*Researched: 2026-04-10*
