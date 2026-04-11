# Phase 3: QR Code + Complete UI - Research

**Researched:** 2026-04-10
**Domain:** react-qr-code, otplib URI generation, Tailwind v4 two-column responsive layout
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Two-column layout inside a single Card on desktop. Left column: parameters, TOTP code, countdown. Right column: QR identity fields, QR code, URI. Reflows to single column (stacked) on mobile.
- **D-02:** Secret input spans full width across both columns, above the two-column split.
- **D-03:** Keep max-w-3xl (768px) container width — consistent with Phase 1 decision D-04.
- **D-04:** On mobile (390px), content stacks in natural reading order: secret → parameters → TOTP code → countdown → QR code → URI.
- **D-05:** Issuer and Account Label inputs placed at the top of the right column, above the QR code.
- **D-06:** Both fields are optional with sensible defaults. QR renders immediately when a valid secret exists.
- **D-07:** Inline warning below the algorithm segmented control when SHA-256 or SHA-512 is selected. Small amber/yellow text. Disappears when SHA-1 is selected.
- **D-08:** Raw `otpauth://` URI shown as monospace text with copy button below the QR code. Truncated with overflow-hidden/ellipsis if too long.

### Claude's Discretion

- QR code size within the right column
- Exact breakpoint for two-column → stacked reflow (likely `md:` Tailwind breakpoint)
- Placeholder text for Issuer and Account fields
- Exact warning message wording for SHA-256/SHA-512
- URI text size (text-xs or text-sm)
- Whether to add a subtle divider/separator between the two columns on desktop

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QR-01 | User can input an issuer name for the QR code | D-05/D-06 locked; `<Input>` component reused unchanged |
| QR-02 | User can input an account label for the QR code | D-05/D-06 locked; `<Input>` component reused unchanged |
| QR-03 | App generates a QR code encoding the `otpauth://totp/` URI with all configured parameters | `generateURI` from otplib (already installed); `QRCode` default export from react-qr-code (already installed) |
| QR-04 | QR code is scannable by Google Authenticator, Authy, Microsoft Authenticator | `level="M"`, `size={192}`, strip base32 padding before passing to `generateURI`, use `currentColor`/transparent for theme compat |
| QR-05 | App displays raw `otpauth://` URI below the QR code (read-only, copyable) | Existing `copyToClipboard` + ghost icon-sm button pattern; `<p>` with `font-mono text-xs truncate` |
| QR-06 | App shows a warning when SHA-256/SHA-512 is selected | Inline conditional `<p>` with `text-amber-500`; D-07 locked; `role="alert"` for accessibility |
| UI-01 | Single-page layout with all inputs, QR code, and live TOTP code visible together without scrolling at 1280px | Two-column grid inside existing Card; max-w-3xl unchanged |
| UI-03 | Fully responsive layout — usable on 390px mobile with no horizontal overflow | `grid-cols-1 md:grid-cols-2` reflow; full-width content at < md breakpoint |
</phase_requirements>

---

## Summary

Phase 3 adds QR code generation and wires the final responsive layout into the existing `totp-generator.tsx` component. Both runtime dependencies (`react-qr-code@2.0.18` and `otplib@13.4.0`) are **already installed** in `package.json`. No new npm installs are required.

The primary work is: (1) add `issuer`/`account` state to `TOTPGenerator`, (2) compute the `otpauth://` URI using `generateURI` from otplib, (3) render the QR code using the `QRCode` default export from `react-qr-code`, and (4) restructure the JSX from a single-column `space-y-6` stack into a `grid grid-cols-1 md:grid-cols-2 gap-4` layout with the secret input spanning full width above the grid.

**Primary recommendation:** Extend `totp-generator.tsx` in-place — no new files needed. The layout refactor is a JSX restructure, not a component extraction. All patterns (copy buttons, inputs, ghost icons) are established and must be replicated exactly.

---

## Standard Stack

### Core (All Already Installed)

| Library | Installed Version | Purpose | Status |
|---------|-------------------|---------|--------|
| `react-qr-code` | 2.0.18 | QR code SVG rendering | Installed — no action needed |
| `otplib` | 13.4.0 | `generateURI()` for `otpauth://` URI building | Installed — `generateURI` already importable |
| `lucide-react` | 1.8.0 | `QrCode` icon (empty state), `Clipboard`/`Check` (copy) | Installed |
| `@/components/ui/input` | shadcn | Issuer + Account text inputs | Installed |
| `@/components/ui/button` | shadcn | Ghost icon-sm copy button for URI | Installed |

[VERIFIED: package.json + node_modules inspection]

**Installation:** None required. All dependencies are present.

### react-qr-code Import Clarification

The UI-SPEC mentions `QRCodeSVG` (which is the named export from `qrcode.react`, a different library). The project uses `react-qr-code`, which exports a class component as **default** (`QRCode`) and also as a named export `QRCode`.

Correct import:
```typescript
import QRCode from 'react-qr-code'
// or
import { QRCode } from 'react-qr-code'
```

[VERIFIED: node_modules/react-qr-code/lib/index.js — `exports.QRCode = QRCode; exports.default = QRCode;`]

### react-qr-code Props (Verified Against Types)

```typescript
interface QRCodeProps extends React.SVGProps<SVGSVGElement> {
  value: string;       // The URI to encode
  size?: number;       // defaults to 128 — use 192
  bgColor?: string;    // defaults to "#FFFFFF" — use "transparent"
  fgColor?: string;    // defaults to "#000000" — use "currentColor"
  level?: "L" | "M" | "H" | "Q";  // defaults to "L" — use "M"
  title?: string;
}
```

[VERIFIED: node_modules/react-qr-code/types/index.d.ts]

### otplib generateURI Signature (Verified)

```typescript
generateURI({
  strategy?: 'totp' | 'hotp';  // default: 'totp'
  issuer: string;               // required — pass '' for empty
  label: string;                // required — pass '' for empty
  secret: string;               // base32, NO padding (strip = chars first)
  algorithm?: HashAlgorithm;    // 'sha1' | 'sha256' | 'sha512'
  digits?: number;
  period?: number;
}): string
```

[VERIFIED: node_modules/otplib/dist/functional.d.ts]

---

## Architecture Patterns

### Recommended Project Structure (No New Files)

```
src/
├── components/
│   └── totp-generator.tsx   # Extend in-place: add issuer/account state, QR section, two-column grid
├── lib/
│   └── totp.ts              # No changes needed (generateURI imported directly in component)
└── app/
    └── page.tsx             # No changes needed
```

### Pattern 1: Two-Column Grid with Full-Width Header

The layout restructure wraps the existing content in a grid. The secret input lives above the grid with `col-span-2` (or outside the grid entirely), while the two columns hold left and right content.

```tsx
// Source: CONTEXT.md D-01/D-02, UI-SPEC Layout Contract
<div className="space-y-4">
  {/* Full-width secret input — above the two-column split */}
  <div>{/* secret Input with eye/copy/dice adornments */}</div>

  {/* Two-column grid — reflows to 1 column below md breakpoint */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Left column */}
    <div className="space-y-4">
      {/* Algorithm/Digits/Period toggles */}
      {/* SHA warning (conditional) */}
      {/* TOTP code display + copy */}
      {/* Progress bar + countdown */}
    </div>

    {/* Right column — optional border-l on md+ */}
    <div className="space-y-4 md:pl-4 md:border-l md:border-border">
      {/* Issuer input */}
      {/* Account input */}
      {/* QR code or empty state */}
      {/* URI display + copy */}
    </div>
  </div>
</div>
```

### Pattern 2: URI Generation with Padding Strip

STATE.md decision: "Base32 padding must be stripped before building the otpauth:// URI." Verified: `generateURI` URL-encodes `=` as `%3D` which breaks authenticator app scanning.

```typescript
// Source: verified via node --input-type=module test against otplib 13.4.0
import { generateURI } from 'otplib'

function buildOtpauthUri(params: {
  secret: string
  issuer: string
  account: string
  algorithm: HashAlgorithm
  digits: 6 | 8
  period: 30 | 60
}): string | null {
  if (!params.secret) return null
  const stripped = params.secret.trim().replace(/=/g, '')
  return generateURI({
    issuer: params.issuer,
    label: params.account || 'Account',
    secret: stripped,
    algorithm: params.algorithm,
    digits: params.digits,
    period: params.period,
  })
}
```

Observed URI output behavior (verified):
- SHA-1 is omitted from URI (it is the default) — `?secret=...&issuer=...`
- SHA-256 appears as `&algorithm=SHA256`
- Empty issuer → no `&issuer=` param; label uses just the account value
- Both empty → `otpauth://totp/?secret=...` (renders QR but may not add account name in app)

### Pattern 3: QR Code Render with Empty State

```tsx
// Source: UI-SPEC Interaction Contracts, react-qr-code types/index.d.ts
import QRCode from 'react-qr-code'
import { QrCode } from 'lucide-react'

{uri ? (
  <QRCode
    value={uri}
    size={192}
    level="M"
    bgColor="transparent"
    fgColor="currentColor"
    aria-label="QR code for authenticator app"
    role="img"
  />
) : (
  <div className="size-48 bg-muted rounded-md flex items-center justify-center">
    <QrCode className="size-8 text-muted-foreground" />
  </div>
)}
```

### Pattern 4: SHA Warning (Conditional Inline)

```tsx
// Source: UI-SPEC Interaction Contracts, CONTEXT.md D-07
{(algorithm === 'sha256' || algorithm === 'sha512') && (
  <p className="text-amber-500 text-xs mt-1" role="alert">
    SHA-256 and SHA-512 are not supported by Google Authenticator or Microsoft
    Authenticator. Use SHA-1 for broad compatibility.
  </p>
)}
```

Placement: immediately after the Algorithm ToggleGroup, inside the Algorithm `<div className="space-y-2">` block, before the Digits control.

### Pattern 5: URI Display with Copy Button

```tsx
// Source: UI-SPEC Interaction Contracts, established Phase 2 copy pattern
{uri && (
  <div className="space-y-1">
    <span className="text-sm font-semibold">otpauth:// URI</span>
    <div className="flex items-center gap-1">
      <p
        className="font-mono text-xs text-muted-foreground truncate flex-1"
        title={uri}
      >
        {uri}
      </p>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={async () => {
          const ok = await copyToClipboard(uri)
          if (ok) {
            setUriCopied(true)
            setTimeout(() => setUriCopied(false), 1500)
          }
        }}
        aria-label="Copy URI"
        type="button"
      >
        {uriCopied ? <Check className="size-4" /> : <Clipboard className="size-4" />}
      </Button>
    </div>
  </div>
)}
```

### Anti-Patterns to Avoid

- **Using `QRCodeSVG` as the import name:** The UI-SPEC incorrectly names the component `QRCodeSVG` (that is from `qrcode.react`). This project uses `react-qr-code` which exports `QRCode` (default and named). Using `QRCodeSVG` will cause a runtime error.
- **Passing padded secret to `generateURI`:** `=` padding is URL-encoded as `%3D`, breaking authenticator scanning. Always strip `=` before calling `generateURI`.
- **Omitting `issuer` or `label` params from `generateURI`:** Both are required in the function signature — pass `''` for empty, never `undefined`.
- **Building the URI manually:** Use `generateURI` from otplib. Manual construction risks encoding bugs (e.g., spaces in issuer not encoded, special characters in account label).
- **Extracting a separate `<QRSection>` component:** No split needed for this phase. All state is co-located in `totp-generator.tsx`; splitting would require prop-drilling all TOTP params + issuer/account + URI.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| `otpauth://` URI encoding | Manual string template | `generateURI` from otplib | Handles label/issuer URL-encoding, algorithm token casing (SHA256 not sha256), omits default params (SHA-1, 6 digits, 30s) |
| QR code rendering | Canvas-based or manual SVG | `QRCode` from react-qr-code | Error correction, module sizing, finder patterns — QR encoding is non-trivial to get right |
| Clipboard copy | `document.execCommand('copy')` | Existing `copyToClipboard()` in `src/lib/totp.ts` | Already handles permission errors, returns boolean success |

---

## Common Pitfalls

### Pitfall 1: Wrong Import Name from react-qr-code

**What goes wrong:** Importing `{ QRCodeSVG }` (qrcode.react API) from `react-qr-code` returns `undefined` — the component silently fails to render.

**Why it happens:** The UI-SPEC references `QRCodeSVG` which is the named export from `qrcode.react`, a different library.

**How to avoid:** Use `import QRCode from 'react-qr-code'` (default export) or `import { QRCode } from 'react-qr-code'` (named export). Both work.

**Warning signs:** QR code area is blank; no TypeScript error if using `any`.

### Pitfall 2: Base32 Padding in URI Breaks Authenticator Scanning

**What goes wrong:** Secrets with `=` padding passed to `generateURI` produce URIs like `?secret=JBSWY3DPEHPK3PXP%3D%3D%3D%3D`. Google Authenticator and Authy fail to decode the secret.

**Why it happens:** `generateURI` does not strip padding — it URL-encodes `=` characters.

**How to avoid:** `secret.trim().replace(/=/g, '')` before passing to `generateURI`. The `generateSecret()` function produces unpadded secrets, so this only matters for user-pasted secrets.

**Warning signs:** QR scans successfully (no error) but app shows wrong TOTP codes or refuses to add account.

### Pitfall 3: fgColor "currentColor" Requires SVG Context

**What goes wrong:** `fgColor="currentColor"` on the `QRCode` SVG inherits the nearest ancestor's CSS `color`. If the Card has no explicit `color` set, it defaults to the browser's default (black) — which is fine for light mode but produces black-on-black in dark mode.

**Why it happens:** The QRCode SVG uses `fgColor` as the `fill` on SVG paths. `"currentColor"` means "use CSS `color` property of the parent."

**How to avoid:** The shadcn/ui `Card` component sets `text-card-foreground` which maps to `--foreground` token (dark in light mode, light in dark mode). This is inherited correctly — no extra wrapper needed. Verify by testing dark mode manually.

**Warning signs:** QR code invisible in dark mode (black bars on dark background).

### Pitfall 4: `generateURI` requires both `issuer` AND `label`

**What goes wrong:** Passing `undefined` for `issuer` or `label` causes a runtime error or produces malformed URIs.

**Why it happens:** Both are typed as `string` (non-optional) in the function signature.

**How to avoid:** Always pass a string: `issuer: issuer || ''` and `label: account || ''`. Per D-06, empty strings are valid — the URI will just have an empty label segment.

### Pitfall 5: Two-Column Layout Causes Horizontal Overflow on Mobile

**What goes wrong:** Using `grid-cols-2` without the `md:` prefix causes a fixed two-column layout on 390px mobile, pushing content off-screen.

**Why it happens:** Tailwind grid classes without breakpoint prefix apply at all widths.

**How to avoid:** Use `grid grid-cols-1 md:grid-cols-2`. At `< md` (768px), content stacks single-column in DOM order matching D-04.

### Pitfall 6: algorithm State Value vs URI Algorithm Token Casing

**What goes wrong:** otplib's `HashAlgorithm` type uses lowercase (`'sha1'`, `'sha256'`, `'sha512'`). `generateURI` outputs uppercase in the URI (`SHA256`). No bug here — `generateURI` handles the casing conversion internally.

**Why it matters:** If someone builds the URI manually using `algorithm` state directly, they'd produce `&algorithm=sha256` which some authenticators may not parse.

**How to avoid:** Use `generateURI` — it maps `'sha256'` → `SHA256` correctly.

---

## Code Examples

### Complete URI Computation (useMemo pattern)

```typescript
// Source: verified against otplib 13.4.0 functional.d.ts + runtime test
import { generateURI } from 'otplib'
import type { HashAlgorithm } from 'otplib'
import { useMemo } from 'react'

// Inside TOTPGenerator component:
const uri = useMemo(() => {
  if (!secret || secretError) return null
  const stripped = secret.trim().replace(/=/g, '')
  if (!stripped) return null
  return generateURI({
    issuer,          // string state, '' if empty
    label: account || 'Account',  // string state, fallback to 'Account' if empty
    secret: stripped,
    algorithm,
    digits,
    period,
  })
}, [secret, secretError, issuer, account, algorithm, digits, period])
```

### New State Variables to Add to TOTPGenerator

```typescript
// QR identity fields
const [issuer, setIssuer] = useState('')
const [account, setAccount] = useState('')

// URI copy feedback
const [uriCopied, setUriCopied] = useState(false)
```

### Issuer / Account Input Fields

```tsx
// Source: existing Input pattern in totp-generator.tsx
<div className="space-y-2">
  <label className="text-sm font-semibold" htmlFor="issuer-input">Issuer</label>
  <Input
    id="issuer-input"
    value={issuer}
    onChange={(e) => setIssuer(e.target.value)}
    placeholder="Acme Corp"
  />
</div>
<div className="space-y-2">
  <label className="text-sm font-semibold" htmlFor="account-input">Account</label>
  <Input
    id="account-input"
    value={account}
    onChange={(e) => setAccount(e.target.value)}
    placeholder="alice@example.com"
  />
</div>
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Manual `otpauth://` string construction | `generateURI` from otplib 13.x | Correct encoding, correct algorithm token casing, omits default params automatically |
| `speakeasy` (abandoned 2017) | `otplib` 13.x | Security-audited dependencies (`@noble/hashes`, `@scure/base`), active maintenance |
| `qrcode.react` (last published ~1yr ago) | `react-qr-code` 2.0.18 | SVG-first, smaller, actively maintained (confirmed in CLAUDE.md) |

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — both `react-qr-code` and `otplib` are already installed; no CLI tools, databases, or services required).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Node.js + `assert` + `tsx` (custom test runner — established Phase 2) |
| Config file | None — run directly with `npx tsx src/lib/__tests__/totp.test.ts` |
| Quick run command | `npx tsx src/lib/__tests__/totp.test.ts` |
| Full suite command | `npx tsx src/lib/__tests__/totp.test.ts` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| QR-03 | `generateURI` produces valid `otpauth://totp/` URI with correct encoding | unit | `npx tsx src/lib/__tests__/totp.test.ts` | Wave 0 — new tests in existing file |
| QR-04 | Padding stripped before URI generation | unit | `npx tsx src/lib/__tests__/totp.test.ts` | Wave 0 |
| QR-05 | URI copy button shows Check icon for 1500ms | manual-only | N/A — browser interaction | N/A |
| QR-06 | SHA warning appears for sha256/sha512, disappears for sha1 | manual-only | N/A — DOM visual | N/A |
| UI-01 | All content visible without scroll at 1280px | manual-only | N/A — viewport visual | N/A |
| UI-03 | No horizontal overflow at 390px | manual-only | N/A — viewport visual | N/A |

### Wave 0 Gaps

- [ ] Add URI-building tests to `src/lib/__tests__/totp.test.ts` — covers QR-03, QR-04:
  - `buildOtpauthUri` with issuer + account → correct URI format
  - Padded secret strips `=` → secret param is unpadded in URI
  - Empty issuer → no `&issuer=` in URI
  - SHA-256 algorithm → `&algorithm=SHA256` in URI
  - SHA-1 → algorithm omitted from URI (default)
  - Invalid/empty secret → returns null

*(If `buildOtpauthUri` is implemented as a helper in `src/lib/totp.ts`, tests are straightforward. If inlined as `useMemo` in the component, test the URI format via `generateURI` directly.)*

---

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A — no auth |
| V3 Session Management | no | N/A — ephemeral, no sessions |
| V4 Access Control | no | N/A — anonymous tool |
| V5 Input Validation | yes | Issuer/account: any string is valid (no injection risk — rendered as text/URI); secret: existing `validateBase32` unchanged |
| V6 Cryptography | no | No new crypto — existing `@noble/hashes` via otplib |

**No new security surface introduced.** The QR code is generated client-side from values already in React state. The URI display is read-only text. The issuer/account inputs are free-text with no execution or storage pathway. `copyToClipboard` uses the existing Clipboard API wrapper with error handling.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `currentColor` on `QRCode` SVG inherits `--foreground` correctly from the Card's `text-card-foreground` class | Pitfall 3 | QR invisible in dark mode — mitigated by manual dark mode test |
| A2 | Authenticators accept empty `label` segment in `otpauth://totp/?secret=...` without error | URI behavior | App may show blank account name or refuse to add — user must set at least Account field |

---

## Open Questions

1. **Should `buildOtpauthUri` be extracted to `src/lib/totp.ts` or remain inlined as `useMemo`?**
   - What we know: The function is pure and testable; the existing test file uses the lib functions
   - What's unclear: Whether the planner wants test coverage for URI logic
   - Recommendation: Extract to `src/lib/totp.ts` as `buildOtpauthUri(params): string | null` — enables unit testing and keeps component lean

2. **Column divider: border-l or no divider?**
   - What we know: CONTEXT.md marks this as Claude's discretion; UI-SPEC says "subtle `border-l border-border`"
   - Recommendation: Use `md:pl-4 md:border-l md:border-border` on the right column — adds visual separation without a wrapper element

---

## Sources

### Primary (HIGH confidence)
- `node_modules/react-qr-code/types/index.d.ts` — verified `QRCodeProps` interface, confirmed no `QRCodeSVG` named export
- `node_modules/react-qr-code/lib/index.js` — verified `exports.QRCode` and `exports.default`
- `node_modules/otplib/dist/functional.d.ts` — verified `generateURI` signature, required `issuer` and `label` params
- Runtime test (`node --input-type=module`) — verified URI output format for: issuer+label, empty issuer, SHA-256, 8 digits/60s, padded secrets
- `src/components/totp-generator.tsx` — verified existing state shape, import patterns, copy button pattern, ToggleGroup usage
- `src/lib/totp.ts` — verified `validateBase32`, `copyToClipboard` signatures for reuse
- `package.json` — confirmed both `react-qr-code@^2.0.18` and `otplib@^13.4.0` already installed

### Secondary (MEDIUM confidence)
- `CLAUDE.md` — confirmed stack constraints, `react-qr-code` as approved library, `speakeasy` / manual URI construction as forbidden approaches

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries installed and verified via type inspection and runtime tests
- Architecture: HIGH — patterns derived from verified library APIs + existing codebase patterns
- Pitfalls: HIGH — Pitfalls 1/2/4/5 verified via direct code/runtime inspection; Pitfall 3 inferred from SVG behavior (A1 in Assumptions Log)

**Research date:** 2026-04-10
**Valid until:** 2026-05-10 (stable libraries, 30-day horizon)
