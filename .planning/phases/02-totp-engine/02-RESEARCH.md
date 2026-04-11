# Phase 2: TOTP Engine - Research

**Researched:** 2026-04-10
**Domain:** TOTP computation, React timer patterns, shadcn/ui form controls
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Secret Input UX**
- D-01: Secret field uses monospace font, masked by default (password-style dots). Eye icon toggles visibility. When revealed, secret displays in monospace.
- D-02: Three inline icon buttons inside the input field: eye (toggle visibility), clipboard (copy secret), dice (generate random base32 secret). All actions in one compact row.
- D-03: Invalid base32 input shows red border + inline error text below the field ("Invalid base32 secret"). TOTP code area displays "--- ---" and countdown is paused/grey until valid input.
- D-04: Secret field starts empty on page load. Placeholder text: "Enter base32 secret". No pre-filled data.

**Parameter Controls**
- D-05: Algorithm, digits, and period use segmented controls (pill-style toggle groups). All options visible at once — no dropdowns.
  - Algorithm: `[ SHA-1 | SHA-256 | SHA-512 ]`
  - Digits: `[ 6 | 8 ]`
  - Period: `[ 30s | 60s ]`
- D-06: Controls stacked below secret input in a labeled horizontal row. Layout: secret → parameters → output.

**Code Display**
- D-07: TOTP code displayed as large centered monospace digits (~3rem), grouped into halves with a space (e.g., "482 039" for 6-digit, "4820 3951" for 8-digit). Copy button alongside.
- D-08: Code rotation uses a brief fade transition (~200ms fade-out, ~200ms fade-in).

**Countdown Animation**
- D-09: Linear horizontal progress bar below the TOTP code. Bar shrinks from full width to empty as time depletes.
- D-10: Color thresholds at thirds: >66% = green, 33-66% = yellow, <33% = red.
- D-11: Seconds remaining shown right-aligned next to the bar (e.g., "12s").

**Defaults (TOTP-08)**
- SHA-1, 6 digits, 30-second period — matching Google Authenticator defaults.

### Claude's Discretion
- Exact progress bar height/thickness
- Transition easing curves for fade and bar animation
- Exact shade of green/yellow/red for countdown (must work in both light and dark themes)
- Error message wording for invalid base32

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TOTP-01 | User can input a TOTP secret (base32-encoded) in a text field | shadcn Input component with password type; base32 validation via try/catch on otplib generate() |
| TOTP-02 | User can click a button to randomly generate a base32 secret | otplib `generateSecret()` — synchronous, returns unpadded base32 string |
| TOTP-03 | User can toggle show/hide on the secret field | `type` state toggling between `"password"` and `"text"` on the Input; Eye/EyeOff icons |
| TOTP-04 | User can copy the secret to clipboard | `navigator.clipboard.writeText()` on Copy button click |
| TOTP-05 | User can configure hash algorithm (SHA1, SHA256, SHA512) | ToggleGroup with values `"sha1"`, `"sha256"`, `"sha512"`; passed as `algorithm` to `generate()` |
| TOTP-06 | User can configure number of digits (6 or 8) | ToggleGroup with values `"6"`, `"8"`; cast to number for `digits` option |
| TOTP-07 | User can configure time period (30s or 60s) | ToggleGroup with values `"30"`, `"60"`; cast to number for `period` option |
| TOTP-08 | Standard defaults: SHA1, 6 digits, 30-second period | useState initial values; matches otplib defaults |
| TOTP-09 | App displays live TOTP code that rotates automatically | useEffect + setInterval(1000ms) recalculating from `Date.now()`; async `generate()` call |
| TOTP-10 | App displays animated countdown progress bar with color coding | CSS width transition on div; color class derived from seconds remaining |
| TOTP-11 | User can copy the current TOTP code to clipboard | `navigator.clipboard.writeText()` on Copy button next to code display |
| UI-04 | All computation happens client-side — no backend, no data transmitted | `'use client'` directive; no fetch/API calls; otplib runs entirely in browser |
| UI-05 | No data persistence — everything is ephemeral | All state in `useState` only; explicitly NO localStorage/sessionStorage/cookies |
</phase_requirements>

---

## Summary

Phase 2 builds the complete TOTP engine UI inside the existing Card component scaffolded in Phase 1. The work is self-contained in a single `'use client'` component (`src/components/totp-generator.tsx`) that owns all state and computation. Two new shadcn components are needed (Input, ToggleGroup/Toggle). The `otplib` and `react-qr-code` packages install clean — no peer dep conflicts with the existing React 19 / Next.js 16 stack.

The primary technical constraint is that `otplib`'s `generate()` function is **async** (uses Web Crypto API in the browser). This complicates the `setInterval` timer loop, which must manage an async call safely — specifically by cancelling stale calls if the component unmounts or parameters change before the promise resolves. The `generateSecret()` function is synchronous and returns an unpadded RFC 4648 base32 string.

The `@base-ui/react` ToggleGroup has a different value model than Radix: `value` is always a `string[]` (even in single-select mode). For controlled single-select parameters, pass `value={[currentValue]}` and extract `newValues[0]` from `onValueChange`. Keeping empty-selection deselection blocked requires guarding against `onValueChange([])`.

**Primary recommendation:** Build a single `TOTPGenerator` client component with `useState` for all form state, a `useEffect`-with-`setInterval` loop for the countdown ticker, and `async generate()` called inside the interval. Inline input adornment pattern (position:relative wrapper + absolutely-positioned icon buttons) for the secret field, since shadcn's Input does not have a built-in adornment slot.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| otplib | 13.4.0 (latest) | TOTP code generation, base32 secret generation | Project-mandated; TypeScript-first, ESM, browser-compatible via Web Crypto API. `generate()` is async. `generateSecret()` is sync. |
| react-qr-code | 2.0.18 (latest) | QR code SVG rendering (Phase 3 only — installed now for Phase 3 readiness) | Project-mandated. Phase 2 does not use it, but it can be installed alongside otplib. |

[VERIFIED: npm registry — `npm view otplib version` → 13.4.0, `npm view react-qr-code version` → 2.0.18]

### Supporting (already in project)
| Library | Version | Purpose |
|---------|---------|---------|
| @base-ui/react | 1.3.0 | Toggle, ToggleGroup, Input, Button primitives used by shadcn components |
| lucide-react | 1.8.0 | Icons: Eye, EyeOff, Copy, Clipboard, Dices, Check, RefreshCw |
| shadcn CLI | 4.2.0 | Scaffolds Input and ToggleGroup components |

[VERIFIED: project node_modules]

### New shadcn Components to Scaffold
```bash
npx shadcn@latest add input toggle-group
```
This adds `src/components/ui/input.tsx`, `src/components/ui/toggle.tsx`, and `src/components/ui/toggle-group.tsx`.

[VERIFIED: dry-run output — `npx shadcn@latest add toggle-group --dry-run` confirmed 2 new files; `npx shadcn@latest add input --dry-run` confirmed 1 new file]

### Installation
```bash
npm install otplib react-qr-code
npx shadcn@latest add input toggle-group
```

---

## Architecture Patterns

### Recommended Project Structure After Phase 2
```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx          # unchanged
│   └── page.tsx            # replace placeholder with <TOTPGenerator />
├── components/
│   ├── header.tsx          # unchanged
│   ├── theme-provider.tsx  # unchanged
│   ├── theme-toggle.tsx    # unchanged
│   ├── totp-generator.tsx  # NEW — main 'use client' component
│   └── ui/
│       ├── button.tsx      # existing
│       ├── card.tsx        # existing
│       ├── input.tsx       # NEW (scaffolded)
│       ├── toggle.tsx      # NEW (scaffolded as dependency)
│       └── toggle-group.tsx # NEW (scaffolded)
└── lib/
    └── utils.ts            # unchanged
```

### Pattern 1: Single 'use client' Component Architecture

**What:** All TOTP state lives in one component with `'use client'` directive. No server component boundary needed for Phase 2. Page.tsx imports `<TOTPGenerator />` and renders it inside the existing Card.

**When to use:** When all logic is client-side and no RSC data-fetching benefit exists. Avoids awkward async boundary issues with otplib's async `generate()`.

**Example:**
```typescript
// src/components/totp-generator.tsx
// Source: Phase 2 context decisions + otplib functional API docs
'use client'

import { useState, useEffect, useCallback } from 'react'
import { generate, generateSecret } from 'otplib'
import type { HashAlgorithm } from 'otplib'

type Digits = 6 | 8
type Period = 30 | 60

interface TOTPState {
  secret: string
  algorithm: HashAlgorithm
  digits: Digits
  period: Period
  showSecret: boolean
  secretError: string | null
  code: string
  isGenerating: boolean
}
```

### Pattern 2: Wall-Clock TOTP Timer

**What:** Use `setInterval(fn, 1000)` but derive the current TOTP code from `Date.now()` on each tick, not by counting down. This self-corrects for tab-background throttling.

**Why:** `setInterval` tick counts drift under tab-switching and CPU pressure. Wall-clock calculation (`Math.floor(Date.now() / 1000 / period)`) always produces the correct code regardless of missed ticks.

**Key insight from otplib source:** `generate()` already defaults `epoch: Math.floor(Date.now() / 1000)` internally. Calling `await generate({ secret, algorithm, digits, period })` at each tick is sufficient — the library uses the current time.

**Example:**
```typescript
// Source: otplib functional.js dist + project CONTEXT.md canonical refs
useEffect(() => {
  if (!secret || secretError) return

  // Generate immediately on mount/param change
  let cancelled = false
  const compute = async () => {
    try {
      const newCode = await generate({ secret, algorithm, digits, period })
      if (!cancelled) setCode(newCode)
    } catch {
      if (!cancelled) setCode('')
    }
  }
  compute()

  const interval = setInterval(compute, 1000)
  return () => {
    cancelled = true
    clearInterval(interval)
  }
}, [secret, secretError, algorithm, digits, period])
```

### Pattern 3: Countdown Progress Bar from Wall Clock

**What:** Derive seconds remaining from `Date.now()` modulo period, not from an independent counter. Reset to period when modulo crosses zero.

**Example:**
```typescript
// Source: CONTEXT.md D-09, D-10, D-11
// secondsRemaining = period - (Math.floor(Date.now() / 1000) % period)
// progress = secondsRemaining / period * 100
// color: progress > 66 -> green, progress > 33 -> yellow, else red
const secondsRemaining = period - (Math.floor(Date.now() / 1000) % period)
const progress = (secondsRemaining / period) * 100
const barColor =
  progress > 66 ? 'bg-green-500' : progress > 33 ? 'bg-yellow-500' : 'bg-red-500'
```

### Pattern 4: Base32 Validation via Try/Catch

**What:** otplib does not expose a synchronous `isValidBase32()` function. Validation happens at `generate()` time: invalid base32 throws `Base32DecodeError`. The recommended approach for the UI is to catch errors from `generate()` and show the invalid state.

**Alternative (lighter):** Pre-validate with a regex `/^[A-Z2-7]+=*$/i` before calling `generate()`. Catches obviously-invalid inputs instantly without an async round-trip. Use regex for immediate UI feedback; use `generate()` error as final authority.

**Example:**
```typescript
// Source: RFC 4648 base32 alphabet + @otplib/plugin-base32-scure source (auto-uppercases + adds padding)
const BASE32_REGEX = /^[A-Z2-7]+=*$/i

function validateBase32(value: string): string | null {
  if (!value) return null  // empty = no error, just no code
  if (!BASE32_REGEX.test(value)) return 'Invalid base32 secret'
  if (value.replace(/=/g, '').length < 1) return 'Invalid base32 secret'
  return null
}
```

**Note:** otplib's `ScureBase32Plugin.decode()` calls `.toUpperCase()` then pads to multiple-of-8 with `=` before decoding. So lowercase input and unpadded input are both handled by the library. The regex can be case-insensitive.

[VERIFIED: @otplib/plugin-base32-scure dist/index.js source — confirmed auto-uppercase and auto-padding behavior]

### Pattern 5: Input with Inline Icon Adornments

**What:** The shadcn Input component (`@base-ui/react/input`) has no built-in adornment slot. Use a `relative`-positioned wrapper div, absolute-positioned icon buttons on the right, and right-padding on the input to prevent text overlapping the icons.

**Example:**
```typescript
// Source: shadcn input.tsx preview (base-ui Input primitive, no slot API)
<div className="relative">
  <Input
    type={showSecret ? 'text' : 'password'}
    value={secret}
    onChange={(e) => setSecret(e.target.value)}
    placeholder="Enter base32 secret"
    className={cn(
      'font-mono pr-24',  // pr-24 = room for 3 icon buttons
      secretError && 'border-destructive focus-visible:ring-destructive/20'
    )}
    aria-invalid={!!secretError}
  />
  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
    <Button variant="ghost" size="icon-sm" onClick={toggleVisibility}>
      {showSecret ? <EyeOff /> : <Eye />}
    </Button>
    <Button variant="ghost" size="icon-sm" onClick={copySecret}>
      <Clipboard />
    </Button>
    <Button variant="ghost" size="icon-sm" onClick={generateNewSecret}>
      <Dices />
    </Button>
  </div>
</div>
{secretError && (
  <p className="text-destructive text-sm mt-1">{secretError}</p>
)}
```

[VERIFIED: shadcn input.tsx preview source; button.tsx size="icon-sm" is `size-7 rounded-md`]

### Pattern 6: ToggleGroup for Segmented Controls

**What:** `@base-ui/react/toggle-group` uses `value: readonly string[]` (always an array). For single-select controlled segmented controls, pass `value={[currentValue]}` and handle `onValueChange` defensively (guard against empty array when user re-clicks selected item).

**Example:**
```typescript
// Source: @base-ui/react toggle-group ToggleGroup.d.ts type definitions
// Source: shadcn toggle-group.tsx preview source
<ToggleGroup
  value={[algorithm]}
  onValueChange={(values) => {
    if (values.length > 0) setAlgorithm(values[0] as HashAlgorithm)
    // If values is empty (user re-clicked active), keep current value
  }}
  variant="outline"
>
  <ToggleGroupItem value="sha1">SHA-1</ToggleGroupItem>
  <ToggleGroupItem value="sha256">SHA-256</ToggleGroupItem>
  <ToggleGroupItem value="sha512">SHA-512</ToggleGroupItem>
</ToggleGroup>
```

[VERIFIED: @base-ui/react/toggle-group ToggleGroup.d.ts — `value?: readonly Value[]`, `onValueChange?: (groupValue: Value[], ...) => void`]

### Pattern 7: Code Fade Transition

**What:** Brief fade on TOTP code rotation (D-08). Use a CSS `opacity` transition keyed to the current TOTP time step. When the time step changes, briefly set opacity to 0, then back to 1.

**Simple approach:** Use a `key` prop on the code display element equal to the current time step (`Math.floor(Date.now() / 1000 / period)`). React will remount the element on change, and a CSS `animate-in fade-in` from `tw-animate-css` (already in project) handles the fade.

```typescript
// tw-animate-css is imported in globals.css — animate-in/fade-in classes available
const timeStep = Math.floor(Date.now() / 1000 / period)

<div key={timeStep} className="animate-in fade-in duration-200">
  {formatCode(code, digits)}
</div>
```

[VERIFIED: globals.css imports `tw-animate-css`; project package.json has `tw-animate-css: ^1.4.0`]

### Anti-Patterns to Avoid
- **setInterval countdown counter:** Don't decrement a counter with setInterval. Use `Date.now() % period` math instead. Counters drift under tab-hiding.
- **Sync generate() call:** `generate()` is async in browser (Web Crypto). Calling it synchronously will silently return a Promise, not a string.
- **Not cancelling async generate on unmount:** If the component unmounts while `generate()` is pending, `setState` on unmounted component will warn. Use the `cancelled` flag pattern.
- **localStorage for secret:** Explicitly prohibited by UI-05. All state in `useState` only.
- **Using `speakeasy` or `totp-generator`:** Prohibited in CLAUDE.md. Use `otplib` only.
- **Using `next export` CLI:** Prohibited; `output: 'export'` in next.config.ts is already set.
- **Separate server component for TOTP logic:** TOTP requires client-side timers — must be `'use client'`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TOTP computation | Custom HMAC-SHA1 + RFC 6238 time step logic | `otplib generate()` | TOTP has 10+ edge cases (endianness, truncation, epoch handling, drift tolerance) |
| base32 encode/decode | Custom base32 alphabet + padding | `@scure/base` (via otplib) | Padding-off-by-one bugs are common; otplib handles auto-uppercase and auto-padding |
| Cryptographic random bytes | Math.random() for secret generation | `otplib generateSecret()` uses `@noble/hashes` crypto-random | Math.random() is not cryptographically secure |
| QR code SVG | Manual SVG path generation for QR matrix | `react-qr-code` (Phase 3) | Reed-Solomon error correction, quiet zone, finder patterns are non-trivial |
| Segmented toggle control | Custom CSS pill buttons with click state | `shadcn ToggleGroup` | Keyboard navigation, ARIA roles, focus management already handled |

---

## Common Pitfalls

### Pitfall 1: ToggleGroup Empty-Selection Deselection
**What goes wrong:** User clicks the already-selected item in a ToggleGroup. `@base-ui/react` fires `onValueChange([])`. If you set state to `values[0]`, you get `undefined`, breaking the TOTP computation.
**Why it happens:** `@base-ui/react` ToggleGroup (unlike Radix) allows deselection by default. `multiple: false` (the default) means "at most one selected," not "exactly one selected."
**How to avoid:** Guard: `if (values.length > 0) setState(values[0])`. Never derive state from `values[0]` without the guard.
**Warning signs:** TOTP code disappears when user clicks the current algorithm/digits/period selection.

### Pitfall 2: Async generate() in setInterval
**What goes wrong:** Each `setInterval` tick fires `generate()` (async). If computation takes >1000ms (unlikely but possible on slow devices or with SHA-512), the next tick fires before the first resolves. Multiple pending promises will resolve out of order and set state to stale values.
**Why it happens:** `setInterval` doesn't wait for async callbacks.
**How to avoid:** Use a `cancelled` boolean flag. On interval cleanup, set `cancelled = true`. In the async callback, check `if (cancelled) return` before calling `setState`.

### Pitfall 3: otplib generate() Returns Wrong Algorithm
**What goes wrong:** `generate({ secret, algorithm: 'SHA1' })` silently fails or uses sha1 regardless. The `HashAlgorithm` type is `"sha1" | "sha256" | "sha512"` (lowercase).
**Why it happens:** String mismatch. ToggleGroup item values may be set as `"SHA-1"` or `"SHA1"` but otplib expects `"sha1"`.
**How to avoid:** Map ToggleGroup display labels to otplib algorithm strings explicitly. `"sha1"` not `"SHA-1"` or `"SHA1"`.
**Warning signs:** All algorithms produce the same code.

[VERIFIED: @otplib/core types.d.ts — `type HashAlgorithm = "sha1" | "sha256" | "sha512"`]

### Pitfall 4: Progress Bar Width Transition Resets
**What goes wrong:** Progress bar uses CSS `transition: width 1s linear` and `width: X%`. On every setInterval tick (every 1 second), width jumps to the new value. With 1-second transition this can look smooth, but at the period boundary (width resets to 100%), the transition animates from 0 to 100 slowly instead of snapping to 100.
**Why it happens:** CSS transitions always animate between old and new values.
**How to avoid:** Remove the transition at the period boundary. Detect when seconds remaining equals period (a reset just happened) and skip or use `transition: none` for that tick. Or use `key` prop reset on the bar container.

### Pitfall 5: base32 Validation Showing Error on Empty Input
**What goes wrong:** User lands on the page, sees an empty field with "Invalid base32 secret" error immediately — bad UX.
**Why it happens:** Validation runs on every keystroke including empty string.
**How to avoid:** `if (!value) return null` — empty field shows no error, just no TOTP code. Only show the error on non-empty invalid input.

### Pitfall 6: Font Mono Not Applied to Code Display
**What goes wrong:** TOTP code renders in sans-serif font instead of monospace.
**Why it happens:** `font-mono` Tailwind class maps to `--font-mono` CSS variable. The project sets `--font-mono: var(--font-geist-mono)` in globals.css, but Geist Mono is only loaded if added to layout.tsx.
**How to avoid:** Either add `GeistMono` font import to layout.tsx (preferred for crisper rendering), or use Tailwind's `font-mono` which will fall back to system monospace. For the secret field, the shadcn Input is already a standard HTML input — add `font-mono` class directly.

---

## Code Examples

### TOTP Code Generation with otplib
```typescript
// Source: otplib dist/functional.d.ts + dist/types-BBT_82HF.d.ts
import { generate, generateSecret } from 'otplib'
import type { HashAlgorithm } from 'otplib'

// Generate a random 20-byte base32 secret (synchronous)
const secret = generateSecret()  // e.g., "JBSWY3DPEHPK3PXP"

// Generate TOTP code (async — uses Web Crypto API in browser)
const code = await generate({
  secret,
  algorithm: 'sha1',   // 'sha1' | 'sha256' | 'sha512'
  digits: 6,            // 6 or 8
  period: 30,           // seconds
  // epoch defaults to Math.floor(Date.now() / 1000) — no need to pass
})
// Returns: "482039"
```

### Countdown Calculation
```typescript
// Source: CONTEXT.md canonical refs — "Timer must use wall-clock time (Date.now())"
function getCountdownState(period: number) {
  const nowSec = Math.floor(Date.now() / 1000)
  const secondsElapsed = nowSec % period
  const secondsRemaining = period - secondsElapsed
  const progress = (secondsRemaining / period) * 100  // 0-100
  const timeStep = Math.floor(nowSec / period)
  return { secondsRemaining, progress, timeStep }
}
```

### Code Formatting (Group into Halves)
```typescript
// Source: CONTEXT.md D-07 — "grouped into halves with a space"
function formatCode(code: string, digits: number): string {
  if (!code || code.length !== digits) return digits === 6 ? '--- ---' : '---- ----'
  const half = Math.ceil(digits / 2)
  return `${code.slice(0, half)} ${code.slice(half)}`
}
// formatCode("482039", 6) -> "482 039"
// formatCode("48203951", 8) -> "4820 3951"
```

### ToggleGroup Single-Select Pattern (base-ui API)
```typescript
// Source: @base-ui/react/toggle-group ToggleGroup.d.ts
// value is always string[] in @base-ui/react — guard against empty array
<ToggleGroup
  value={[algorithm]}
  onValueChange={(values) => {
    if (values.length > 0) setAlgorithm(values[0] as HashAlgorithm)
  }}
  variant="outline"
>
  <ToggleGroupItem value="sha1">SHA-1</ToggleGroupItem>
  <ToggleGroupItem value="sha256">SHA-256</ToggleGroupItem>
  <ToggleGroupItem value="sha512">SHA-512</ToggleGroupItem>
</ToggleGroup>
```

### Clipboard Copy Pattern
```typescript
// Standard browser API — no library needed
// Source: MDN Clipboard API (standard browser API)
async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Fallback for older browsers (not needed for modern Vercel deployments)
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `speakeasy` for Node.js TOTP | `otplib` 13.x for browser + Node | otplib v12+ (2023) | speakeasy is abandoned; otplib uses audited crypto libs |
| Radix UI toggle-group (shadcn v3) | @base-ui/react toggle-group (shadcn 4.2.0) | shadcn 4.x (2025) | Value prop is `string[]` not `string`; different onValueChange signature |
| `next export` CLI command | `output: 'export'` in next.config.ts | Next.js 13+ | CLI command removed; config key is the only approach |
| Tailwind config file | `@theme` directive in globals.css | Tailwind v4 (2026) | No `tailwind.config.js` needed |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `tw-animate-css` provides `animate-in`/`fade-in` classes compatible with Tailwind v4 | Code Examples — Pattern 7 | Fade transition won't work; fallback: manual CSS keyframe in globals.css |
| A2 | `navigator.clipboard.writeText()` works on Vercel static deployment (HTTPS) | Code Examples — Clipboard Copy | Clipboard API requires secure context (HTTPS); Vercel always serves HTTPS, so this should be fine |
| A3 | `GeistMono` font is not loaded in layout.tsx (only `Inter` is loaded) | Pitfall 6 | If Geist Mono is loaded, `font-mono` will render nicer; if not, system monospace fallback is acceptable |

---

## Open Questions

1. **Should `react-qr-code` be installed in this phase or deferred to Phase 3?**
   - What we know: Phase 3 needs it; installing alongside otplib is a one-liner
   - What's unclear: Whether the planner wants a single clean install task or prefers each phase installs only what it needs
   - Recommendation: Install both `otplib` and `react-qr-code` in Phase 2's dependency task; avoids a separate npm install in Phase 3

2. **Geist Mono font for monospace display**
   - What we know: layout.tsx imports `Inter` only; globals.css maps `--font-mono: var(--font-geist-mono)`
   - What's unclear: Whether Geist Mono needs to be loaded for the monospace to look crisp
   - Recommendation: Add `GeistMono` import to layout.tsx in Phase 2 for proper monospace rendering of the secret field and code display

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|---------|
| Node.js | npm install, next dev | Yes | v20.11.1 | — |
| npm | Package installation | Yes | 10.2.4 | — |
| otplib | TOTP-01 through TOTP-11 | Not yet (to install) | 13.4.0 (latest) | — |
| react-qr-code | Phase 3 | Not yet (to install) | 2.0.18 (latest) | — |
| @base-ui/react (toggle-group) | D-05 segmented controls | Yes (1.3.0 installed) | 1.3.0 | — |
| lucide-react icons | D-02, D-07, D-11 | Yes (1.8.0 installed) | 1.8.0 | — |
| navigator.clipboard | TOTP-04, TOTP-11 | Yes (HTTPS Vercel) | Browser API | execCommand fallback |

**Missing dependencies with no fallback:**
- `otplib` — must be installed before any TOTP computation task

**Missing dependencies with fallback:**
- `react-qr-code` — Phase 3 only; no fallback needed in Phase 2

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | This tool generates TOTP credentials; it does not perform authentication |
| V3 Session Management | No | No sessions; ephemeral state only |
| V4 Access Control | No | Single-user client-side tool |
| V5 Input Validation | Yes | Base32 regex pre-validation + otplib error handling for invalid secrets |
| V6 Cryptography | Yes | `otplib` uses `@noble/hashes` (security-audited) and `@scure/base` — no hand-rolled crypto |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| TOTP secret exposure via persistence | Information Disclosure | All state in `useState` only — no localStorage, sessionStorage, cookies (UI-05) |
| Weak secret generation (Math.random) | Tampering | `generateSecret()` uses `@noble/hashes` cryptographic random — do not use Math.random() |
| XSS via secret input | Tampering | React escapes all rendered values by default; no `dangerouslySetInnerHTML` |
| Clipboard sniffing | Information Disclosure | Inherent browser-API risk; no mitigation possible client-side |

---

## Sources

### Primary (HIGH confidence)
- otplib 13.4.0 `dist/functional.d.ts` — `generate()`, `generateSecret()`, `generateURI()` full type signatures [VERIFIED: extracted from npm pack]
- otplib 13.4.0 `dist/types-BBT_82HF.d.ts` — `OTPGenerateOptions` full definition including `algorithm`, `digits`, `period`, `epoch` [VERIFIED: extracted from npm pack]
- `@otplib/plugin-base32-scure 13.4.0` `dist/index.js` — confirmed auto-uppercase + auto-padding behavior [VERIFIED: extracted from npm pack]
- `@otplib/core 13.4.0` `dist/types.d.ts` — `HashAlgorithm = "sha1" | "sha256" | "sha512"` [VERIFIED: extracted from npm pack]
- `@base-ui/react 1.3.0` `toggle-group/ToggleGroup.d.ts` — `value: readonly Value[]`, `onValueChange: (groupValue: Value[], ...) => void` [VERIFIED: project node_modules]
- shadcn CLI 4.2.0 dry-run — `input.tsx` (21 lines, @base-ui/react/input), `toggle-group.tsx` (90 lines, @base-ui/react/toggle-group) [VERIFIED: `npx shadcn@latest add --dry-run --view`]
- npm registry — otplib 13.4.0 (latest), react-qr-code 2.0.18 (latest) [VERIFIED: `npm view` commands]

### Secondary (MEDIUM confidence)
- [otplib getting started guide](https://otplib.yeojz.dev/guide/getting-started.html) — async API usage patterns, generateSecret options
- [otplib advanced usage guide](https://otplib.yeojz.dev/guide/advanced-usage.html) — algorithm/digits/period configuration
- [shadcn toggle-group docs](https://ui.shadcn.com/docs/components/toggle-group) — component usage patterns

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified via npm pack and project node_modules
- Architecture: HIGH — based on verified source code (shadcn preview, @base-ui types, otplib dist)
- Pitfalls: HIGH for base-ui/otplib pitfalls (verified from type defs); MEDIUM for CSS transition pitfall (pattern-based)

**Research date:** 2026-04-10
**Valid until:** 2026-05-10 (stable libraries; 30-day window)
