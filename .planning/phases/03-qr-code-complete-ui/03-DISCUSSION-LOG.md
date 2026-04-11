# Phase 3: QR Code + Complete UI - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-10
**Phase:** 03-qr-code-complete-ui
**Areas discussed:** Page layout, QR identity fields, Algorithm warning, URI display

---

## Page Layout

### Q1: How should inputs and QR code be arranged on desktop (1280px)?

| Option | Description | Selected |
|--------|-------------|----------|
| Two-column in one Card | Left: secret, params, TOTP code, countdown. Right: QR, URI, identity fields. Single Card, reflows to stacked on mobile. | ✓ |
| Two separate Cards | Top Card: TOTP controls. Bottom Card: QR code, identity fields, URI. Visual separation. | |
| Single Card, stacked | Keep current single Card, add QR below countdown. May require scrolling on desktop. | |

**User's choice:** Two-column in one Card (Recommended)
**Notes:** None

### Q2: Should the secret input span both columns or stay in the left column only?

| Option | Description | Selected |
|--------|-------------|----------|
| Full width across both columns | Secret spans entire card width above the two-column split. More room for monospace text. | ✓ |
| Left column only | Secret stays in left column. Right column starts immediately with QR. | |

**User's choice:** Full width across both columns (Recommended)
**Notes:** None

### Q3: On mobile (390px), where should the QR code appear in the stacked flow?

| Option | Description | Selected |
|--------|-------------|----------|
| Below countdown | Natural reading order: secret → params → code → countdown → QR → URI. | ✓ |
| Between code and countdown | QR appears after TOTP code, before countdown bar. | |
| Above TOTP code | QR between parameters and TOTP code. Scannable output first. | |

**User's choice:** Below countdown (Recommended)
**Notes:** None

### Q4: Should the max-w-3xl container width increase?

| Option | Description | Selected |
|--------|-------------|----------|
| Keep max-w-3xl (768px) | Consistent with Phase 1 D-04. Two columns at ~380px each. | ✓ |
| Bump to max-w-4xl (896px) | More breathing room. Slight departure from Phase 1. | |

**User's choice:** Keep max-w-3xl (Recommended)
**Notes:** None

---

## QR Identity Fields

### Q1: Where should the Issuer and Account Label inputs be placed?

| Option | Description | Selected |
|--------|-------------|----------|
| Above QR code in right column | Top of right column, above QR. Fill fields → QR updates below. | ✓ |
| Below secret, full width | Full-width below secret input. Groups text inputs but mixes QR metadata with TOTP controls. | |
| Below QR code in right column | QR renders first, fields below. Fields feel like afterthought. | |

**User's choice:** Above QR code in right column (Recommended)
**Notes:** None

### Q2: Should Issuer and Account be required to render the QR code?

| Option | Description | Selected |
|--------|-------------|----------|
| Optional with sensible defaults | QR renders immediately with valid secret. Issuer/Account default to empty. | ✓ |
| Required before QR renders | QR shows prompt until both fields have values. More accurate but friction. | |
| Issuer required, Account optional | Middle ground. Issuer needed for authenticator display. | |

**User's choice:** Optional with sensible defaults (Recommended)
**Notes:** None

---

## Algorithm Warning

### Q1: How should the SHA-256/SHA-512 compatibility warning appear?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline warning below algorithm toggle | Small amber text below algorithm segmented control. Contextual, disappears for SHA-1. | ✓ |
| Banner at top of card | Full-width amber alert banner. Visible but takes vertical space. | |
| Inline near QR code | Warning next to QR code. Associates with scanning output. | |

**User's choice:** Inline warning below algorithm toggle (Recommended)
**Notes:** None

---

## URI Display

### Q1: How should the raw otpauth:// URI be displayed below the QR code?

| Option | Description | Selected |
|--------|-------------|----------|
| Monospace text with copy button | Small monospace text, truncated with ellipsis, ghost icon copy button. Consistent with existing patterns. | ✓ |
| Expandable code block | Styled code block with "show full" toggle. More structured but adds complexity. | |
| Full URI always visible | Full URI without truncation. No user action needed but long URIs take space. | |

**User's choice:** Monospace text with copy button (Recommended)
**Notes:** None

---

## Claude's Discretion

- QR code size within right column
- Exact responsive breakpoint for two-column → stacked reflow
- Placeholder text for Issuer and Account fields
- Warning message wording for SHA-256/SHA-512
- URI text size (text-xs vs text-sm)
- Whether to add a divider between columns on desktop

## Deferred Ideas

None — discussion stayed within phase scope
