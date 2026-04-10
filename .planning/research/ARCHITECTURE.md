# Architecture Research

**Domain:** Client-side single-page TOTP QR code generator (Next.js)
**Researched:** 2026-04-10
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      Browser (Client Only)                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      page.tsx (root)                        │ │
│  │  "use client" — single React tree, no server components     │ │
│  └──────────┬──────────────────────────────────────────────────┘ │
│             │ owns all state via useTOTPConfig + useTOTPTimer    │
│             │                                                    │
│    ┌────────┴────────┐    ┌──────────────┐    ┌───────────────┐  │
│    │  ConfigPanel    │    │  TOTPDisplay │    │  QRCodePanel  │  │
│    │                 │    │              │    │               │  │
│    │ - SecretInput   │    │ - CodeDigits │    │ - QRCodeSVG   │  │
│    │ - GenerateBtn   │    │ - Countdown  │    │   (qrcode.    │  │
│    │ - AlgoSelect    │    │   Timer      │    │    react)     │  │
│    │ - DigitsSelect  │    │              │    │               │  │
│    │ - PeriodSelect  │    │              │    │               │  │
│    │ - IssuerInput   │    │              │    │               │  │
│    │ - LabelInput    │    │              │    │               │  │
│    └────────┬────────┘    └──────┬───────┘    └───────┬───────┘  │
│             │                   │                    │           │
│    ┌────────┴───────────────────┴────────────────────┴─────────┐ │
│    │                    Core Logic Layer                        │ │
│    │                                                           │ │
│    │  useTOTPConfig      useTOTPTimer          buildOtpauthURI │ │
│    │  (state hook)       (timer hook)          (pure function) │ │
│    └────────────────────────────┬──────────────────────────────┘ │
│                                 │                                │
│    ┌────────────────────────────┴──────────────────────────────┐ │
│    │                  Third-Party Libraries                    │ │
│    │                                                           │ │
│    │       otpauth (v9)              qrcode.react              │ │
│    │  TOTP generation + URI     SVG QR code rendering          │ │
│    └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `page.tsx` | Root layout, owns all state, passes props down | All child components |
| `ConfigPanel` | Collects all TOTP parameters from user | page.tsx (up via callbacks) |
| `SecretInput` | Text input + "Generate" button for base32 secret | ConfigPanel |
| `AlgorithmSelect` | SHA1/SHA256/SHA512 dropdown | ConfigPanel |
| `DigitsSelect` | 6/8 digit toggle | ConfigPanel |
| `PeriodSelect` | 30s/60s toggle | ConfigPanel |
| `IssuerInput` | Issuer name text input | ConfigPanel |
| `LabelInput` | Account label text input | ConfigPanel |
| `TOTPDisplay` | Shows live code + countdown ring | page.tsx (receives config) |
| `QRCodePanel` | Renders QR code from otpauth URI | page.tsx (receives URI string) |
| `ThemeToggle` | Light/dark theme switch | uses next-themes |
| `useTOTPConfig` | State hook — holds all form values | page.tsx |
| `useTOTPTimer` | Interval hook — computes current code + time remaining | page.tsx |
| `buildOtpauthURI` | Pure function — constructs `otpauth://totp/...` string | useTOTPTimer, QRCodePanel |
| `generateSecret` | Pure function — `crypto.getRandomValues` + base32 encode | SecretInput |

## Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout: ThemeProvider wrapper, metadata
│   ├── page.tsx            # Single page: owns state, composes all sections
│   └── globals.css         # Tailwind base + shadcn CSS variables
├── components/
│   ├── config-panel.tsx    # All parameter inputs grouped
│   ├── secret-input.tsx    # Secret field + generate button
│   ├── totp-display.tsx    # Live code + countdown timer
│   ├── qr-code-panel.tsx   # QR code rendering
│   └── theme-toggle.tsx    # Light/dark switch
├── hooks/
│   ├── use-totp-config.ts  # Form state (secret, algo, digits, period, issuer, label)
│   └── use-totp-timer.ts   # setInterval loop, current code, time remaining
└── lib/
    ├── totp.ts             # buildOtpauthURI(), generateSecret(), TOTP defaults
    └── utils.ts            # shadcn cn() utility
```

### Structure Rationale

- **`app/page.tsx` owns all state:** Single page, no routing needed. Keeping state at the top avoids prop threading through multiple levels and makes data flow explicit.
- **`hooks/`:** Two focused hooks that encapsulate distinct concerns — config form state vs. timer-driven computation. Neither hook depends on the other, keeping them independently testable.
- **`lib/totp.ts`:** Pure functions with no React dependency. Isolates the cryptographic and URI-construction logic so it can be unit tested directly.
- **`components/`:** Presentational components that receive props and emit callbacks. No component holds its own TOTP state — they are controlled by `page.tsx`.

## Architectural Patterns

### Pattern 1: Single Root State Owner ("Lifting State Up")

**What:** All TOTP parameters live in `useTOTPConfig` in `page.tsx`. Child components receive values as props and report changes via callbacks.

**When to use:** Small single-page apps with one logical form + one output area. Avoids the complexity of a global store (Zustand, Redux) that is overkill here.

**Trade-offs:** Simple and transparent. Works fine for ~10 state values. Would become unwieldy if the app grew to many unrelated sections.

**Example:**
```typescript
// page.tsx
const { config, setSecret, setAlgorithm, setDigits, setPeriod, setIssuer, setLabel } = useTOTPConfig()
const { code, secondsRemaining } = useTOTPTimer(config)
const uri = buildOtpauthURI(config)

return (
  <>
    <ConfigPanel config={config} onSecretChange={setSecret} ... />
    <TOTPDisplay code={code} secondsRemaining={secondsRemaining} period={config.period} />
    <QRCodePanel uri={uri} />
  </>
)
```

### Pattern 2: Timer Hook with Wall-Clock Alignment

**What:** `useTOTPTimer` uses `setInterval` at 1-second ticks. On each tick it reads `Date.now()`, computes `timeStep = Math.floor(now / (period * 1000))`, calls `totp.generate()`, and derives `secondsRemaining = period - (now % (period * 1000)) / 1000`.

**When to use:** Any TOTP display that must stay synchronized with the real TOTP window boundary (not just count down from when the component mounted).

**Trade-offs:** Dead simple. Slightly imprecise (up to ~1s drift) but acceptable for display purposes. More precision requires `performance.now()` with requestAnimationFrame — overkill here.

**Example:**
```typescript
// hooks/use-totp-timer.ts
export function useTOTPTimer(config: TOTPConfig) {
  const [state, setState] = useState(() => computeState(config))

  useEffect(() => {
    const id = setInterval(() => setState(computeState(config)), 1000)
    return () => clearInterval(id)
  }, [config])  // reset timer when config changes

  return state
}

function computeState(config: TOTPConfig) {
  const totp = new OTPAuth.TOTP({ ...config })
  const now = Date.now()
  const code = totp.generate()
  const secondsRemaining = config.period - Math.floor((now / 1000) % config.period)
  return { code, secondsRemaining }
}
```

### Pattern 3: Derived URI (No Separate State)

**What:** The `otpauth://` URI is not stored in state — it is computed synchronously from `config` on every render via `buildOtpauthURI(config)`. The `QRCodePanel` receives the string directly.

**When to use:** Any value that is a deterministic function of other state. Storing derived values in state introduces sync bugs.

**Trade-offs:** URI reconstruction runs on every render but it is a trivial string operation — no performance concern.

**Example:**
```typescript
// lib/totp.ts
export function buildOtpauthURI(config: TOTPConfig): string {
  const totp = new OTPAuth.TOTP({
    issuer: config.issuer,
    label: config.label,
    algorithm: config.algorithm,
    digits: config.digits,
    period: config.period,
    secret: OTPAuth.Secret.fromBase32(config.secret),
  })
  return totp.toString()
  // → "otpauth://totp/Issuer:label?secret=...&issuer=...&algorithm=SHA1&digits=6&period=30"
}
```

### Pattern 4: Secret Generation via Web Crypto

**What:** Use `crypto.getRandomValues()` (available in all modern browsers, no import needed) to fill a `Uint8Array`, then base32-encode it. The `otpauth` library exposes `OTPAuth.Secret.generate()` which does exactly this.

**When to use:** Any time you need a cryptographically strong TOTP secret client-side without a custom base32 encoder.

**Trade-offs:** No dependency on Node crypto. `OTPAuth.Secret.generate()` produces a 160-bit secret (20 bytes) by default — appropriate for SHA1, SHA256, SHA512.

**Example:**
```typescript
// lib/totp.ts
export function generateSecret(): string {
  return OTPAuth.Secret.generate().base32  // e.g. "JBSWY3DPEHPK3PXP..."
}
```

## Data Flow

### Config Change Flow

```
User types in input field
    ↓
ConfigPanel callback fires (e.g., onSecretChange)
    ↓
useTOTPConfig setter called → state updates in page.tsx
    ↓
page.tsx re-renders → new config prop flows to TOTPDisplay, QRCodePanel
    ↓
useTOTPTimer effect re-runs (config dependency changed) → new code computed
    ↓
buildOtpauthURI(config) recomputed inline
    ↓
QRCodeSVG receives new value prop → new QR code rendered
```

### Timer Tick Flow

```
setInterval fires every 1000ms
    ↓
useTOTPTimer computeState(config) called
    → Date.now() read
    → OTPAuth.TOTP.generate() called (uses current time step internally)
    → secondsRemaining derived from (period - now % period)
    ↓
setState({ code, secondsRemaining })
    ↓
TOTPDisplay re-renders with new code/timer values
    (QRCodePanel does NOT re-render — URI unchanged)
```

### Generate Secret Flow

```
User clicks "Generate Secret"
    ↓
generateSecret() called → OTPAuth.Secret.generate().base32
    ↓
onSecretChange(newSecret) callback → useTOTPConfig state updated
    ↓
Full Config Change Flow executes (see above)
```

## Integration Points

### External Libraries

| Library | Version | Integration Pattern | Notes |
|---------|---------|---------------------|-------|
| `otpauth` | v9.5.0 | Import in `lib/totp.ts` only | Wraps TOTP generation + URI serialization. Actively maintained (Feb 2026). Works in browsers via ESM. |
| `qrcode.react` | latest | `<QRCodeSVG value={uri} />` in `QRCodePanel` | Use SVG variant (not Canvas) for scalability and dark-mode color customization via `fgColor`/`bgColor` props. |
| `next-themes` | latest | Wrap `layout.tsx` in `<ThemeProvider>` | Handles system-aware default + manual toggle with zero flash on load. |
| `shadcn/ui` | current | Per-component installs via CLI | Input, Select, Button, Label, Switch, Separator — no form library needed (no submission, no validation schema). |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `page.tsx` ↔ `ConfigPanel` | Props down, callbacks up | Config values flow down; change handlers flow up |
| `page.tsx` ↔ `useTOTPTimer` | Hook return value | Timer drives TOTPDisplay re-renders without re-rendering ConfigPanel or QRCodePanel |
| `page.tsx` ↔ `QRCodePanel` | URI string prop | QR panel only re-renders when config changes, not on every timer tick |
| `lib/totp.ts` ↔ hooks | Direct function calls | No events, no shared store — pure function imports |
| `lib/totp.ts` ↔ `otpauth` | ESM import | All `otpauth` usage confined to this one file |

## Build Order (Dependencies)

The following order minimizes blocked work during implementation:

1. **`lib/totp.ts`** — No React dependencies. Can be written and unit tested first.
   - `generateSecret()`
   - `buildOtpauthURI(config)`
   - TOTP defaults constants and `TOTPConfig` TypeScript type

2. **`hooks/use-totp-config.ts`** — Depends on `TOTPConfig` type from lib only.

3. **`hooks/use-totp-timer.ts`** — Depends on `TOTPConfig` type and `otpauth`. No component deps.

4. **`components/`** — Individual display components, each independently buildable once hooks exist:
   - `ConfigPanel` + sub-inputs (pure controlled inputs, no logic)
   - `TOTPDisplay` (receives code + timer, pure display)
   - `QRCodePanel` (receives URI string, wraps `QRCodeSVG`)
   - `ThemeToggle` (fully standalone)

5. **`app/page.tsx`** — Wires everything together. Can only be completed after all hooks and components exist.

6. **`app/layout.tsx`** — Adds `ThemeProvider` wrapper, metadata, global styles.

## Anti-Patterns

### Anti-Pattern 1: Storing the TOTP Code in State Alongside Timer

**What people do:** `const [code, setCode] = useState("")` and `const [timer, setTimer] = useState(30)` as two separate effects or two separate pieces of state that can drift apart.

**Why it's wrong:** The code and time-remaining are computed from the same source of truth (`Date.now()` and the period). Separate state creates the risk of displaying a stale code with a fresh timer (or vice versa) between renders.

**Do this instead:** Compute both atomically in one `setInterval` callback. Return `{ code, secondsRemaining }` as a single state update from `useTOTPTimer`.

### Anti-Pattern 2: Recreating the `OTPAuth.TOTP` Instance on Every Tick

**What people do:** `new OTPAuth.TOTP({ ...config })` inside the 1-second interval callback.

**Why it's wrong:** Unnecessary object allocation on every tick. The config only changes when the user changes an input field, not every second.

**Do this instead:** Create the `OTPAuth.TOTP` instance inside a `useMemo` (or inside the effect setup, outside the interval callback) and only recreate when `config` changes.

### Anti-Pattern 3: Passing the Raw Secret String Directly to QRCodeSVG

**What people do:** `<QRCodeSVG value={config.secret} />` instead of the full otpauth URI.

**Why it's wrong:** QR codes must encode the full `otpauth://totp/...` URI for authenticator apps to recognize the entry format, issuer, label, algorithm, digits, and period. A bare secret is unrecognized by apps like Google Authenticator.

**Do this instead:** Always pass `buildOtpauthURI(config)` as the `value` prop.

### Anti-Pattern 4: Using `output: "export"` in next.config When Vercel Handles It

**What people do:** Add `output: "export"` to `next.config.ts` to force a static build for Vercel.

**Why it's wrong:** Vercel detects Next.js automatically and handles static-capable pages without the `output: "export"` flag. The flag restricts features (e.g., `useParams`, image optimization) unnecessarily. For a fully client-side app, all components marked `"use client"` with no server routes are already statically deployable on Vercel without this setting.

**Do this instead:** Deploy normally to Vercel. Add `output: "export"` only if targeting non-Vercel static hosting (GitHub Pages, Netlify with static adapter, etc.).

### Anti-Pattern 5: Shadcn Form + Zod for This App

**What people do:** Wrap all inputs in a `<Form>` component backed by React Hook Form + Zod schema validation.

**Why it's wrong:** This app has no submission event, no server action, and no validation rules beyond "must be non-empty base32." Zod schemas and RHF add cognitive overhead and bundle weight for zero benefit.

**Do this instead:** Use plain `useState` (via `useTOTPConfig`) for each field. Shadcn `Input`, `Select`, and `Button` components work fine as controlled components without a form library.

## Scaling Considerations

This is a static tool; "scaling" means adding features, not handling traffic.

| Concern | Current scope | If scope grows |
|---------|--------------|----------------|
| State complexity | 6 fields in `useTOTPConfig` — plain useState is fine | If fields exceed ~15 or have complex interdependencies, migrate to `useReducer` |
| Multi-secret support | Out of scope (PROJECT.md) | Would require a list in state and a selected-index; redesign `useTOTPConfig` shape |
| HOTP support | Out of scope | Counter field replaces timer hook; can share lib/totp.ts structure |
| QR download | Out of scope | Add a `toBlob()` call on the SVG element; already available via `qrcode.react` `ref` |

## Sources

- otpauth library (v9.5.0, Feb 2026): https://github.com/hectorm/otpauth
- qrcode.react GitHub (SVG API): https://github.com/zpao/qrcode.react
- RFC 6238 TOTP explained: https://www.authgear.com/post/what-is-totp
- otpauth URI format (Yubico spec): https://docs.yubico.com/yesdk/users-manual/application-oath/uri-string-format.html
- Making setInterval declarative with React hooks: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
- Next.js static exports: https://nextjs.org/docs/app/guides/static-exports
- shadcn/ui forms docs: https://ui.shadcn.com/docs/forms
- Reference TOTP generator (jaden/totp-generator, uses otpauth): https://github.com/jaden/totp-generator

---
*Architecture research for: client-side TOTP QR code generator (Next.js)*
*Researched: 2026-04-10*
