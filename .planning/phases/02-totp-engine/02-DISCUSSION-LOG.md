# Phase 2: TOTP Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-10
**Phase:** 02-totp-engine
**Areas discussed:** Secret input UX, Parameter controls, Code display, Countdown animation

---

## Secret Input UX

### Q1: How should the secret field be styled?

| Option | Description | Selected |
|--------|-------------|----------|
| Monospace with mask | Monospace font, masked by default with eye icon toggle. Feels secure. | ✓ |
| Monospace always visible | Monospace, always plain text. Simpler UX for a dev tool. | |
| Standard input with toggle | Proportional font, masked with toggle. Less techy. | |

**User's choice:** Monospace with mask (Recommended)
**Notes:** None

### Q2: Where should the Generate Random Secret button go?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline icon button | Small icon (dice) inside the input field, next to eye and copy. Compact. | ✓ |
| Separate button below | Labeled "Generate Random Secret" button below input. More discoverable. | |

**User's choice:** Inline icon button (Recommended)
**Notes:** None

### Q3: What should happen when the user enters an invalid base32 string?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline error message | Red border + error text below. Code area shows "--- ---". | ✓ |
| Silent — just show dashes | No error styling, code area shows dashes. Minimal friction. | |
| Prevent invalid input | Only allow valid base32 characters. Strip invalid on paste. | |

**User's choice:** Inline error message (Recommended)
**Notes:** None

### Q4: Should the secret field start empty or pre-filled?

| Option | Description | Selected |
|--------|-------------|----------|
| Start empty | Blank on load. User must type, paste, or generate. | ✓ |
| Pre-generate a random secret | Auto-generate on load for immediate working demo. | |

**User's choice:** Start empty (Recommended)
**Notes:** None

---

## Parameter Controls

### Q1: How should the algorithm, digits, and period selectors be presented?

| Option | Description | Selected |
|--------|-------------|----------|
| Segmented controls | Pill-style toggle groups. All options visible at once. | ✓ |
| Dropdown selects | Standard <Select> dropdowns. Familiar but hides options. | |
| Radio groups | Vertical radio buttons. Explicit but takes vertical space. | |

**User's choice:** Segmented controls (Recommended)
**Notes:** None

### Q2: How should the parameter controls be laid out?

| Option | Description | Selected |
|--------|-------------|----------|
| Stacked below secret | All three in horizontal row below secret field. Compact. | ✓ |
| Collapsible advanced section | Hidden behind "Advanced" toggle. Cleaner but extra click. | |

**User's choice:** Stacked below secret (Recommended)
**Notes:** None

---

## Code Display

### Q1: How should the live TOTP code be displayed?

| Option | Description | Selected |
|--------|-------------|----------|
| Large centered with grouping | Big monospace, split "482 039" with copy button. | ✓ |
| Large ungrouped | Big monospace, no spacing "482039". Matches authenticator apps. | |
| Letter-spaced digits | Wide letter-spacing between each digit. | |

**User's choice:** Large centered with grouping (Recommended)
**Notes:** None

### Q2: Should the code have a visual transition on rotation?

| Option | Description | Selected |
|--------|-------------|----------|
| Brief fade transition | Quick fade-out/fade-in (~200ms). Subtle signal. | ✓ |
| No transition | Instant swap, simplest. | |
| Flash highlight | Yellow flash that fades. More noticeable. | |

**User's choice:** Brief fade transition (Recommended)
**Notes:** None

---

## Countdown Animation

### Q1: What style of countdown indicator?

| Option | Description | Selected |
|--------|-------------|----------|
| Linear progress bar | Horizontal bar, shrinks left to right. Green → yellow → red. | ✓ |
| Circular/radial timer | Ring that depletes like a clock. More visual, heavier. | |
| Numeric countdown only | Just seconds number, no bar. Minimal. | |

**User's choice:** Linear progress bar (Recommended)
**Notes:** None

### Q2: Color thresholds for green/yellow/red?

| Option | Description | Selected |
|--------|-------------|----------|
| Thirds: >66%/33-66%/<33% | Even split. 30s: green 30-20, yellow 20-10, red 10-0. | ✓ |
| Weighted: >50%/20-50%/<20% | Green longer, red only last ~6s. Less alarming. | |
| You decide | Claude picks thresholds during implementation. | |

**User's choice:** Thirds (Recommended)
**Notes:** None

### Q3: Show seconds remaining alongside the bar?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, right-aligned | "12s" at right end of bar. Precise timing. | ✓ |
| No, bar only | Just animated bar, no numeric readout. Cleaner. | |

**User's choice:** Yes, right-aligned (Recommended)
**Notes:** None

---

## Claude's Discretion

- Exact progress bar height/thickness
- Transition easing curves
- Exact green/yellow/red shades (theme-compatible)
- Error message wording for invalid base32

## Deferred Ideas

None — discussion stayed within phase scope
