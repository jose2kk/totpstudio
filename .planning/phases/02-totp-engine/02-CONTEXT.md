# Phase 2: TOTP Engine - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the TOTP computation engine with all user-facing controls: secret input with show/hide/copy/generate, parameter configuration (algorithm, digits, period), live rotating TOTP code display, and animated countdown timer. All computation is client-side with zero persistence.

</domain>

<decisions>
## Implementation Decisions

### Secret Input UX
- **D-01:** Secret field uses **monospace font, masked by default** (password-style dots). Eye icon toggles visibility. When revealed, secret displays in monospace.
- **D-02:** Three **inline icon buttons inside the input field**: eye (toggle visibility), clipboard (copy secret), dice (generate random base32 secret). All actions in one compact row.
- **D-03:** Invalid base32 input shows **red border + inline error text** below the field ("Invalid base32 secret"). TOTP code area displays "--- ---" and countdown is paused/grey until valid input.
- **D-04:** Secret field **starts empty on page load**. Placeholder text: "Enter base32 secret". No pre-filled data — reinforces the no-persistence guarantee.

### Parameter Controls
- **D-05:** Algorithm, digits, and period use **segmented controls** (pill-style toggle groups). All options visible at once — no dropdowns.
  - Algorithm: `[ SHA-1 | SHA-256 | SHA-512 ]`
  - Digits: `[ 6 | 8 ]`
  - Period: `[ 30s | 60s ]`
- **D-06:** Controls are **stacked below the secret input** in a labeled horizontal row. Layout reads top-to-bottom: secret → parameters → output.

### Code Display
- **D-07:** TOTP code displayed as **large centered monospace digits** (~3rem), grouped into halves with a space (e.g., "482 039" for 6-digit, "4820 3951" for 8-digit). Copy button alongside.
- **D-08:** Code rotation uses a **brief fade transition** (~200ms fade-out, ~200ms fade-in) to signal the update.

### Countdown Animation
- **D-09:** **Linear horizontal progress bar** below the TOTP code. Bar shrinks from full width to empty as time depletes.
- **D-10:** Color thresholds at **thirds**: >66% remaining = green, 33-66% = yellow, <33% = red. For 30s period: green 30-20s, yellow 20-10s, red 10-0s.
- **D-11:** **Seconds remaining shown right-aligned** next to the bar (e.g., "12s").

### Defaults (from TOTP-08)
- Pre-filled defaults: SHA-1, 6 digits, 30-second period — matching Google Authenticator defaults.

### Claude's Discretion
- Exact progress bar height/thickness
- Transition easing curves for fade and bar animation
- Exact shade of green/yellow/red for countdown (should work in both light and dark themes)
- Error message wording for invalid base32

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Constraints
- `CLAUDE.md` (project root) — Full tech stack specification, version requirements, `otplib` usage, what NOT to use
- `.planning/REQUIREMENTS.md` — Phase 2 requirements: TOTP-01 through TOTP-11, UI-04, UI-05

### Architecture Decisions (from STATE.md)
- Timer must use wall-clock time (`Date.now()`), not `setInterval` countdown
- Base32 padding must be stripped before building the `otpauth://` URI
- `output: 'export'` — no server-side routes, client-side only

### Phase 1 Context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Layout decisions (max-w-3xl, header bar, Card component, zinc palette, default shadcn primary colors)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/card.tsx` — Card component (CardHeader, CardTitle, CardDescription, CardContent) — Phase 2 content goes inside this
- `src/components/ui/button.tsx` — Button component with variants — use for icon buttons (eye, copy, generate)
- `src/components/header.tsx` — Header with theme toggle — no changes needed
- `src/lib/utils.ts` — `cn()` utility for className merging

### Established Patterns
- shadcn/ui components with Tailwind v4 CSS variables (oklch tokens)
- `ThemeProvider` wrapping app in layout.tsx — dark mode via class attribute
- Centered max-w-3xl container with px-4 padding

### Integration Points
- `src/app/page.tsx` — Replace placeholder Card content with TOTP generator UI
- New shadcn components needed: Input (for secret field), likely need to scaffold segmented control or use toggle-group
- `otplib` library to be installed for TOTP computation

</code_context>

<specifics>
## Specific Ideas

No specific external references — user selected recommended approaches across all areas. The overall feel should be a clean, compact developer tool with all controls and output visible in a single card.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-totp-engine*
*Context gathered: 2026-04-10*
