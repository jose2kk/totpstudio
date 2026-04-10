# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-10
**Phase:** 01-foundation
**Areas discussed:** Color theme / design tokens, Page layout structure, Theme toggle placement, Skeleton page content

---

## Color Theme / Design Tokens

### Base Color Palette

| Option | Description | Selected |
|--------|-------------|----------|
| Zinc (Recommended) | Cool neutral gray — the shadcn/ui default. Clean, professional, works well for developer tools. | ✓ |
| Slate | Slightly blue-tinted gray. A bit softer than zinc, common in modern dashboards. | |
| Neutral | Pure gray with no color tint. Maximally neutral, lets accent colors pop. | |
| Stone | Warm gray with a subtle brown tint. Warmer, more organic feel. | |

**User's choice:** Zinc (Recommended)
**Notes:** None — straightforward pick for the default.

### Accent Color

| Option | Description | Selected |
|--------|-------------|----------|
| Default shadcn/ui | Standard zinc primary colors — no custom accent. Clean and minimal. | ✓ |
| Blue accent | Blue for primary buttons and interactive elements. | |
| Green accent | Green for primary elements. Ties in with TOTP countdown bar. | |
| You decide | Claude picks something appropriate. | |

**User's choice:** Default shadcn/ui
**Notes:** No custom accent — stick with the standard zinc primaries.

---

## Page Layout Structure

### Overall Frame

| Option | Description | Selected |
|--------|-------------|----------|
| Header + centered content (Recommended) | Slim header bar with app title and theme toggle, centered max-width container for content. | ✓ |
| Full-width with sidebar | Wider layout with sidebar for settings and main area for code + QR. | |
| Centered card, no header | Everything in one large centered card/panel with no header bar. | |

**User's choice:** Header + centered content (Recommended)
**Notes:** None.

### Max Width

| Option | Description | Selected |
|--------|-------------|----------|
| max-w-2xl (~672px) | Compact and focused. Single-column tool feel. | |
| max-w-3xl (~768px) (Recommended) | More breathing room. Allows side-by-side in Phase 3. | ✓ |
| max-w-4xl (~896px) | Wider. May feel spacious for the content amount. | |

**User's choice:** max-w-3xl (~768px) (Recommended)
**Notes:** None.

---

## Theme Toggle Placement

### Toggle Location

| Option | Description | Selected |
|--------|-------------|----------|
| Header right corner (Recommended) | Sun/moon icon button in top-right of header bar. Standard placement. | ✓ |
| Header right with dropdown | Dropdown menu with Light / Dark / System options. | |
| Floating bottom-right | Small floating button in bottom-right corner. | |

**User's choice:** Header right corner (Recommended)
**Notes:** None.

### Toggle Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Light/Dark only (Recommended) | Simple two-state toggle. System default on first load. | ✓ |
| Light/Dark/System cycle | Three-way cycle including explicit system preference option. | |

**User's choice:** Light/Dark only (Recommended)
**Notes:** System default applied on first load per UI-02, toggle is just two states after that.

---

## Skeleton Page Content

### Landing Page Content

| Option | Description | Selected |
|--------|-------------|----------|
| Title + empty card shell (Recommended) | Header + centered Card proving shadcn/ui renders in both themes. | ✓ |
| Just the header | Only header bar. Main area empty. Absolute minimum. | |
| Placeholder sections | Header + skeleton blocks showing where future content goes. | |

**User's choice:** Title + empty card shell (Recommended)
**Notes:** Proves the stack works. Phase 2 replaces the card content.

### App Title/Branding

| Option | Description | Selected |
|--------|-------------|----------|
| TOTP QR Generator | Descriptive and to the point. Matches project name. | |
| TOTP Tools | Shorter, slightly more generic. | |
| You decide | Claude picks something appropriate. | ✓ |

**User's choice:** You decide
**Notes:** Claude's discretion — pick something concise for a developer utility tool.

---

## Claude's Discretion

- App title/branding text

## Deferred Ideas

None — discussion stayed within phase scope.
