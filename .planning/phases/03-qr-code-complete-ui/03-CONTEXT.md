# Phase 3: QR Code + Complete UI - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Add QR code generation from the `otpauth://totp/` URI, issuer/account identity fields, raw URI display with copy, SHA-256/SHA-512 compatibility warning, and finalize the responsive single-page layout for desktop (1280px, no scrolling) and mobile (390px, no horizontal overflow). All computation remains client-side with zero persistence.

</domain>

<decisions>
## Implementation Decisions

### Page Layout
- **D-01:** **Two-column layout inside a single Card** on desktop. Left column: parameters, TOTP code, countdown. Right column: QR identity fields, QR code, URI. Reflows to single column (stacked) on mobile.
- **D-02:** **Secret input spans full width** across both columns, above the two-column split. Keeps the monospace secret field wide and the top section unified.
- **D-03:** **Keep max-w-3xl (768px)** container width — consistent with Phase 1 decision D-04. Two columns at ~380px each is sufficient.
- **D-04:** On mobile (390px), content stacks in natural reading order: secret → parameters → TOTP code → countdown → QR code → URI. **QR code appears below the countdown**, not interleaved with TOTP output.

### QR Identity Fields
- **D-05:** Issuer and Account Label inputs placed **at the top of the right column**, above the QR code. Top-down flow: fill fields → QR updates live below.
- **D-06:** Both fields are **optional with sensible defaults**. QR renders immediately when a valid secret exists. Issuer defaults to empty (omitted from URI), Account defaults to empty. User can customize but doesn't have to.

### Algorithm Warning
- **D-07:** **Inline warning below the algorithm segmented control** when SHA-256 or SHA-512 is selected. Small amber/yellow text. Disappears when SHA-1 is selected. Non-intrusive and contextually placed next to the control that triggers it.

### URI Display
- **D-08:** Raw `otpauth://` URI shown as **monospace text with copy button** below the QR code. Truncated with overflow-hidden/ellipsis if too long. Copy button uses the existing ghost icon button pattern (consistent with secret/code copy buttons).

### Claude's Discretion
- QR code size within the right column (should be large enough to scan reliably)
- Exact breakpoint for two-column → stacked reflow (likely md: or lg: Tailwind breakpoint)
- Placeholder text for Issuer and Account fields
- Exact warning message wording for SHA-256/SHA-512
- URI text size (text-xs or text-sm)
- Whether to add a subtle divider/separator between the two columns on desktop

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Constraints
- `CLAUDE.md` (project root) — Full tech stack specification, `react-qr-code` library for QR rendering, `otplib` for TOTP/URI generation, what NOT to use
- `.planning/REQUIREMENTS.md` — Phase 3 requirements: QR-01 through QR-06, UI-01, UI-03

### Architecture Decisions (from STATE.md)
- Base32 padding must be stripped before building the `otpauth://` URI
- SHA-256/512 ignored by Google/Microsoft Authenticator — show UX warning when selected
- `output: 'export'` — no server-side routes, client-side only
- Timer uses wall-clock time (`Date.now()`), not `setInterval` countdown

### Prior Phase Context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Layout decisions (max-w-3xl, header bar, Card component, zinc palette, default shadcn primary colors)
- `.planning/phases/02-totp-engine/02-CONTEXT.md` — TOTP controls decisions (secret input, segmented controls, code display, countdown bar, monospace styling)

### Key URI Format Reference
- Google Authenticator Key URI format: `otpauth://totp/{label}?secret={secret}&issuer={issuer}&algorithm={algo}&digits={digits}&period={period}`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/totp-generator.tsx` — Main TOTP component with all state and controls. QR section integrates into this component or a sibling component within the same Card.
- `src/components/ui/card.tsx` — Card with CardHeader, CardTitle, CardDescription, CardContent
- `src/components/ui/button.tsx` — Button with ghost/icon-sm variants (for copy buttons)
- `src/components/ui/input.tsx` — Input component (for issuer/account fields)
- `src/lib/totp.ts` — Utility functions: `validateBase32`, `formatCode`, `getCountdownState`, `copyToClipboard`
- `src/lib/utils.ts` — `cn()` for className merging

### Established Patterns
- `'use client'` component with all state in `useState` hooks
- Inline icon buttons inside input fields (eye, clipboard, dice pattern)
- `ToggleGroup` for segmented controls
- Ghost icon buttons for copy actions with check-mark feedback (1.5s timeout)
- Tailwind v4 CSS variables with oklch tokens (shadcn/ui)
- `lucide-react` for icons

### Integration Points
- `src/app/page.tsx` — Card structure needs two-column grid added inside CardContent
- `src/components/totp-generator.tsx` — Either extend with QR section or extract a new sibling component
- `react-qr-code` library needs to be installed (`npm install react-qr-code`)
- `otplib` already installed — use its URI builder or construct `otpauth://` URI manually

</code_context>

<specifics>
## Specific Ideas

No specific external references — user selected recommended approaches across all areas. The overall structure is a unified single-Card tool with two columns on desktop, stacking to a single column on mobile. QR code and identity fields occupy the right column, with the raw URI and copy button below the QR code.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-qr-code-complete-ui*
*Context gathered: 2026-04-10*
