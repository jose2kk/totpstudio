# Phase 1: Foundation - Research

**Researched:** 2026-04-10
**Domain:** Next.js 16 + Tailwind v4 + shadcn/ui + next-themes scaffolding
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Use the **zinc** base color palette (shadcn/ui default). Cool neutral gray, clean and professional.
- **D-02:** Use **default shadcn/ui primary colors** — no custom accent color. Dark buttons on light theme, light on dark. Minimal and standard.
- **D-03:** **Header bar + centered content container** layout. Slim header with app title on the left and theme toggle on the right, then a centered content area below.
- **D-04:** Content container uses **max-w-3xl (~768px)**. Enough breathing room for side-by-side QR + TOTP display in Phase 3 without feeling empty.
- **D-05:** Theme toggle is a **sun/moon icon button in the top-right of the header bar**. Standard placement, consistent with shadcn/ui examples.
- **D-06:** Toggle is **Light/Dark only** (two states). System default applied on first load per UI-02, but the toggle itself just flips between light and dark.
- **D-07:** Landing page shows the **header + an empty Card component** in the centered content area. Proves shadcn/ui renders correctly in both themes. Phase 2 replaces the card content.
- **D-08:** App title/branding is **Claude's discretion** — pick something appropriate for a developer utility tool.

### Claude's Discretion

- App title/branding text — choose something concise and fitting for a TOTP developer tool

### Deferred Ideas (OUT OF SCOPE)

- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | Next.js with TypeScript and static export (`output: 'export'`) | `create-next-app` flags, `next.config.ts` `output: 'export'` pattern |
| INFRA-02 | shadcn/ui + Tailwind CSS v4 for UI components | `npx shadcn@latest init` with zinc, Tailwind v4 `@theme inline` pattern, Card component |
| INFRA-03 | Deployable to Vercel with zero server-side routes | Static export produces `out/` dir; Vercel auto-detects; no API routes created |
| UI-02 | Dark and light themes with system-aware default and manual toggle | next-themes `ThemeProvider`, `defaultTheme="system"`, `enableSystem`, `suppressHydrationWarning` |
</phase_requirements>

---

## Summary

Phase 1 scaffolds a greenfield Next.js 16 project with no existing code in the repository. The stack is fully decided (Next.js 16.2.3 + React 19.2 + TypeScript + Tailwind v4 + shadcn/ui + next-themes), and all library versions have been verified against the npm registry as of 2026-04-10. No version ambiguity exists.

The most critical correctness concern is the interaction between `output: 'export'` (static HTML generation), `next-themes` (injects theme class into `<html>` client-side), and React 19 hydration. The solution is a three-part pattern: `suppressHydrationWarning` on `<html>`, a thin `components/theme-provider.tsx` wrapper around `NextThemesProvider`, and `disableTransitionOnChange` to prevent a flash during initial load. This is the officially documented shadcn/ui pattern and is confirmed compatible with static exports.

Tailwind v4 uses `@theme inline` in CSS rather than `tailwind.config.js`. The `shadcn@latest init` CLI handles the Tailwind v4 setup automatically when run after `create-next-app`. The dark mode variant requires `@custom-variant dark (&:is(.dark *))` in `globals.css` alongside the CSS variable token blocks. The botsito-app reference project (tepuii-tech/botsito-app) confirms this pattern works in production on Next.js 15 + Tailwind v4.

**Primary recommendation:** Run `create-next-app` non-interactively with confirmed flags, then `shadcn init`, install next-themes, configure `output: 'export'` in `next.config.ts`, and wire up the ThemeProvider + ModeToggle per the official shadcn/ui dark mode docs. No custom patterns needed.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.3 | App framework with static export | Mandatory per CLAUDE.md. `output: 'export'` generates `out/` for Vercel static hosting |
| react / react-dom | 19.2.5 | UI rendering | Ships with Next.js 16; no separate pinning needed |
| typescript | 5.x | Type safety | Mandatory per CLAUDE.md; scaffolded by default |
| tailwindcss | 4.2.2 | Utility CSS | Mandatory per CLAUDE.md. v4 is what `create-next-app` scaffolds; zero-config with single `@import "tailwindcss"` |
| shadcn/ui CLI | latest (`shadcn@latest`) | Component scaffold | Mandatory per CLAUDE.md. CLI copies components into project — not an npm dep |
| next-themes | 0.4.6 | Theme switching | Standard Next.js dark/light mode solution; App Router + React 19 compatible |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 1.8.0 | Icon set | Installed by shadcn/ui; provides Sun/Moon icons for theme toggle |
| tw-animate-css | 1.4.0 | CSS animations | shadcn/ui Tailwind v4 projects import this instead of deprecated `tailwindcss-animate` |
| class-variance-authority | 0.7.1 | Component variants | Installed by shadcn/ui for variant-based component styling |
| clsx + tailwind-merge | 2.1.1 / 3.5.0 | Class merging | Installed by shadcn/ui; used in `cn()` utility |

### Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| next-themes | Manual `prefers-color-scheme` | No user override support; brittle; no cross-tab sync |
| next-themes | Custom ThemeContext (botsito pattern) | Reinvents next-themes; flash-of-unstyled risk; more code to maintain |
| shadcn/ui Card | Custom div | D-07 requires proof of shadcn rendering; card is the intended validator |

**Installation (verified flags):**

```bash
# Step 1: Scaffold (disable-git since project root is not a git repo yet)
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# Step 2: Initialize shadcn/ui (select zinc, CSS variables)
npx shadcn@latest init

# Step 3: Add required shadcn components
npx shadcn@latest add card button

# Step 4: Install next-themes
npm install next-themes
```

**Version verification (confirmed against npm registry 2026-04-10):** [VERIFIED: npm registry]
- `next`: 16.2.3 (latest)
- `next-themes`: 0.4.6 (latest)
- `tailwindcss`: 4.2.2 (latest)
- `create-next-app`: 16.2.3 (latest)
- `lucide-react`: 1.8.0
- `tw-animate-css`: 1.4.0

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout: ThemeProvider + html/body with suppressHydrationWarning
│   ├── page.tsx            # Landing page: Header + Card skeleton
│   └── globals.css         # Tailwind @import, @custom-variant dark, @theme inline tokens
├── components/
│   ├── theme-provider.tsx  # Thin "use client" wrapper around NextThemesProvider
│   ├── header.tsx          # App header: title left, ThemeToggle right
│   └── ui/                 # shadcn/ui scaffolded components (card, button)
└── lib/
    └── utils.ts            # cn() utility (scaffolded by shadcn)
```

### Pattern 1: Root Layout with Static Export + Theme Provider

**What:** `app/layout.tsx` wraps children in ThemeProvider and marks `<html>` with `suppressHydrationWarning`. Works with `output: 'export'` because theme class injection happens entirely client-side.

**When to use:** Always — this is the single root layout.

```tsx
// Source: https://ui.shadcn.com/docs/dark-mode/next [CITED: ui.shadcn.com/docs/dark-mode/next]
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Pattern 2: ThemeProvider Wrapper Component

**What:** A thin `"use client"` component that wraps `NextThemesProvider`. Required because `app/layout.tsx` is a Server Component but `NextThemesProvider` needs the client context.

**When to use:** Always — never import `NextThemesProvider` directly in `layout.tsx`.

```tsx
// Source: https://ui.shadcn.com/docs/dark-mode/next [CITED: ui.shadcn.com/docs/dark-mode/next]
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### Pattern 3: Theme Toggle Button (Sun/Moon, two-state)

**What:** Client component that reads `theme` and calls `setTheme` from `useTheme`. Shows Sun in light mode, Moon in dark mode. Matches D-05 and D-06 decisions.

**When to use:** Place in Header component at top-right.

```tsx
// Source: https://github.com/shadcn-ui/next-template/blob/main/components/theme-toggle.tsx
// [CITED: github.com/shadcn-ui/next-template]
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.5rem] w-[1.3rem] dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### Pattern 4: Tailwind v4 globals.css Structure

**What:** Tailwind v4 uses a single CSS import + CSS variables in `:root` / `.dark` selectors. `@theme inline` maps CSS vars to Tailwind color utilities. `@custom-variant dark` enables `.dark:` prefixes to respond to the `.dark` class `next-themes` applies.

**When to use:** This replaces `tailwind.config.js` entirely for token definition.

```css
/* Source: https://ui.shadcn.com/docs/tailwind-v4 [CITED: ui.shadcn.com/docs/tailwind-v4] */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(240 10% 3.9%);
  /* ... shadcn zinc token set ... */
}

.dark {
  --background: hsl(240 10% 3.9%);
  --foreground: hsl(0 0% 98%);
  /* ... shadcn zinc dark token overrides ... */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... all token mappings ... */
}
```

**Important:** `shadcn@latest init` generates the full token set when run. Do NOT hand-write it.

### Pattern 5: Static Export Config

**What:** Single option in `next.config.ts` that switches Next.js to output static HTML/JS/CSS into `out/` on `npm run build`. Required from day one per CONTEXT.md.

```ts
// Source: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
// [CITED: nextjs.org]
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
}

export default nextConfig
```

### Pattern 6: Header Layout (D-03, D-04, D-05)

**What:** A sticky/fixed header bar with `flex justify-between items-center` containing title text left and ThemeToggle right. Page content below uses `max-w-3xl mx-auto` container.

```tsx
// [ASSUMED] — standard Tailwind flex layout pattern, no official source required
export function Header() {
  return (
    <header className="border-b">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-semibold text-sm">TOTP Studio</span>
        <ThemeToggle />
      </div>
    </header>
  )
}
```

### Anti-Patterns to Avoid

- **Importing `NextThemesProvider` directly in `layout.tsx`:** `layout.tsx` is a Server Component; `NextThemesProvider` needs client context. Always wrap in a `"use client"` component.
- **Omitting `suppressHydrationWarning` from `<html>`:** next-themes sets a class on `<html>` client-side after SSG hydration. Without this attribute, React emits hydration warnings in the console, violating the phase success criteria.
- **Omitting `disableTransitionOnChange`:** Without this prop, there is a brief flash during initial theme application. Include it.
- **Adding `output: 'export'` after initial build:** Set it before running any `next build`. Some component patterns become invalid after this is set (e.g., API routes, dynamic routes without `generateStaticParams`).
- **Using `tailwindcss-animate` instead of `tw-animate-css`:** `tailwindcss-animate` is deprecated in Tailwind v4 projects. `shadcn@latest init` now injects `@import "tw-animate-css"` instead. [CITED: ui.shadcn.com/docs/tailwind-v4]
- **Writing theme tokens by hand:** `shadcn@latest init` generates the full zinc CSS variable set. Do not write it manually — 20+ tokens per theme, error-prone.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark/light theme with system default | Custom localStorage + `matchMedia` logic | `next-themes` | Flash-of-unstyled, cross-tab sync, cookie persistence across refreshes — all handled |
| CSS variable token system | Manually defined `:root` color vars | `shadcn@latest init` with zinc preset | 20+ tokens, dark overrides, Tailwind mapping — all generated correctly |
| Icon button for theme toggle | Custom SVG or inline icon | `lucide-react` Sun/Moon (installed with shadcn) | Already available; consistent sizing and a11y |
| Component base styles | Custom CSS | `shadcn/ui` Card, Button scaffolded components | shadcn components carry the correct CSS variable references; hand-rolled components miss tokens |

**Key insight:** The entire theme system (tokens, dark variant, provider, toggle) has a canonical shadcn/ui implementation. Every piece of it exists — there is nothing to invent in this phase.

---

## Common Pitfalls

### Pitfall 1: Hydration Mismatch from next-themes

**What goes wrong:** React console warning "Prop `className` did not match. Server: `` Client: `dark`" — causes build validation to fail the "no hydration warnings" success criterion.

**Why it happens:** `output: 'export'` generates static HTML at build time with no theme class. On the client, `next-themes` adds `class="dark"` or `class="light"` to `<html>` after mount. React sees a mismatch between server HTML and client DOM.

**How to avoid:** Add `suppressHydrationWarning` to the `<html>` element in `layout.tsx`. This is the officially documented fix. [CITED: ui.shadcn.com/docs/dark-mode/next]

**Warning signs:** Browser console shows red hydration error on first load.

### Pitfall 2: `create-next-app` Runs Interactively Instead of Non-Interactively

**What goes wrong:** Without explicit flags, `create-next-app` prompts for every option. In a scripted plan, this requires human input mid-execution.

**How to avoid:** Use the confirmed non-interactive flag set. Note: `--turbopack` is NOT a valid flag (Turbopack is the default dev bundler in Next.js 16). The `--disable-git` flag skips git init. [VERIFIED: npm registry — `npx create-next-app --help` output]

**Confirmed working command:**
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --disable-git
```

### Pitfall 3: `shadcn init` Over an Existing Partial Install

**What goes wrong:** If `shadcn@latest init` is run after manual edits to `globals.css` or `tailwind.config.js`, the CLI may not correctly detect the Tailwind v4 setup and could scaffold v3-style config.

**How to avoid:** Run `shadcn@latest init` immediately after `create-next-app`, before any manual file edits. Let the CLI do its detection on a pristine scaffold. [ASSUMED — based on CLI behavior patterns; not explicitly documented]

### Pitfall 4: `output: 'export'` Breaks Image Optimization

**What goes wrong:** Next.js's built-in `<Image>` component requires a server for optimization. With `output: 'export'`, using `<Image>` without `unoptimized` will cause a build error.

**Why it matters for Phase 1:** Phase 1 has no images, so this is not immediately blocking. But if a logo or favicon is added via `<Image>`, the build will fail.

**How to avoid:** Either use standard `<img>` tags, or set `images: { unoptimized: true }` in `next.config.ts`. [CITED: nextjs.org/docs/app/building-your-application/deploying/static-exports]

### Pitfall 5: `shadcn@latest add` Uses Network — Needs Internet Access

**What goes wrong:** `shadcn@latest add card` fetches component source from the shadcn registry at runtime. In air-gapped or restricted environments, this fails silently.

**How to avoid:** Confirm network access before running. This is a development-time-only dependency — not an issue for the deployed build. [ASSUMED]

---

## Code Examples

Verified patterns from official sources:

### Full `next.config.ts` for Static Export

```ts
// [CITED: nextjs.org/docs/app/building-your-application/deploying/static-exports]
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
}

export default nextConfig
```

### `app/layout.tsx` Root Layout

```tsx
// [CITED: ui.shadcn.com/docs/dark-mode/next]
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TOTP Studio",
  description: "Generate TOTP codes and QR codes for authenticator apps",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### `components/theme-provider.tsx`

```tsx
// [CITED: ui.shadcn.com/docs/dark-mode/next]
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### `components/theme-toggle.tsx`

```tsx
// [CITED: github.com/shadcn-ui/next-template — components/theme-toggle.tsx]
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.5rem] w-[1.3rem] dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### `app/page.tsx` Skeleton (D-07)

```tsx
// [ASSUMED] — standard shadcn/ui Card usage per component docs
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-start justify-center py-8">
        <div className="w-full max-w-3xl px-4">
          <Card>
            <CardHeader>
              <CardTitle>TOTP Generator</CardTitle>
              <CardDescription>
                Configure your TOTP parameters and scan the QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Content coming in Phase 2.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` with `darkMode: 'class'` | `@custom-variant dark (&:is(.dark *))` in CSS | Tailwind v4 (Jan 2026) | No config file needed; variant declared in CSS |
| `tailwindcss-animate` plugin | `tw-animate-css` (`@import "tw-animate-css"`) | shadcn/ui Tailwind v4 update (2026) | Drop the plugin, use CSS import instead |
| `next export` CLI command | `output: 'export'` in `next.config.ts` | Next.js 13+ | CLI command was removed; config-only now |
| `theme.extend.colors` in tailwind config | CSS variables + `@theme inline` directive | Tailwind v4 | All tokens live in CSS, not JS config |
| `"use client"` on entire layout | Thin provider wrapper + Server Component layout | Next.js App Router | Server Component layout + client provider wrapper is the correct pattern |

**Deprecated:**
- `tailwindcss-animate`: Replaced by `tw-animate-css` in Tailwind v4 projects. [CITED: ui.shadcn.com/docs/tailwind-v4]
- `tailwind.config.js` for new projects: Obsolete with v4's `@theme` directive. Do not create one.
- `next export` CLI command: Removed in Next.js 13+; use `output: 'export'` config. [CITED: nextjs.org]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `shadcn@latest init` over a pristine scaffold correctly detects Tailwind v4 without manual intervention | Pitfall 3 | Could require manual CSS edits post-init — low impact since the fix is straightforward |
| A2 | Header layout pattern (flex, max-w-3xl, h-14) is sufficient for D-03/D-04 | Pattern 6, Code Examples | Aesthetic only — easy to adjust in execution if proportions need tuning |
| A3 | `shadcn@latest add card button` fetches correct versions from registry on 2026-04-10 | Installation | Component API changes are rare; latest registry version matches documentation |
| A4 | `create-next-app@latest . --disable-git` works in a non-empty directory containing only `.planning/` and `CLAUDE.md` | Installation | CLI may refuse non-empty directory; fallback is `npx create-next-app@latest totp-qr` and move files |

---

## Open Questions

1. **App title branding (D-08 — Claude's discretion)**
   - What we know: User delegated this to Claude
   - Recommendation: "TOTP Studio" — concise, developer-appropriate, not overloaded. Alternative: "OTPForge" or "TOTPKit". Planner should pick one and use it consistently.

2. **`create-next-app` in non-empty directory**
   - What we know: The project root has `CLAUDE.md` and `.planning/`. Running `create-next-app .` in a non-empty directory may prompt for confirmation or fail.
   - Recommendation: Planner should include a check step or use `--yes` flag combined with explicit flags to suppress the prompt. Test: `npx create-next-app@latest . --yes --typescript --tailwind --eslint --app --src-dir --disable-git`

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm / npx scripts | Check required | — | — |
| npm / npx | `create-next-app`, `shadcn` | Assumed present | — | Use pnpm with `--use-pnpm` flag |
| Internet access | `shadcn@latest add` (registry) | Assumed present | — | Pre-download components manually |
| Vercel CLI | INFRA-03 deployment | Not required for build; needed for deploy | — | Use Vercel web UI for deploy |

Note: `nyquist_validation` is `false` in config.json — Validation Architecture section omitted.

---

## Project Constraints (from CLAUDE.md)

All directives extracted from `/Users/jose/projects/personal/totp-qr/CLAUDE.md`:

| Directive | Type | Planner Action |
|-----------|------|----------------|
| Next.js with TypeScript — mandatory | Required stack | Use `create-next-app --typescript` |
| shadcn/ui + Tailwind CSS — mandatory | Required UI | Run `shadcn@latest init` after scaffold |
| Vercel static/client-side only, no server-side routes | Deployment constraint | `output: 'export'` in `next.config.ts` |
| No backend — all logic in browser | Architecture | No API routes; no `app/api/` directory |
| No persistence — zero storage | Data | No `localStorage`, `sessionStorage`, cookies |
| `output: 'export'` must be set from day one | Arch decision from STATE.md | Set before first `npm run build` |
| `suppressHydrationWarning` required on html element for next-themes | Known requirement | In `app/layout.tsx` |
| Tailwind v4 uses `@theme` directive (no `tailwind.config.js`) | Convention | Do not create `tailwind.config.js` |
| Use `otplib` not `speakeasy` or `totp-generator` | Dependency constraint | Phase 2 concern; noted here |
| TOTP state must use `'use client'` component | Architecture | Phase 2 concern; noted here |
| Do NOT use `next export` CLI command | Banned pattern | Use `output: 'export'` config |
| Do NOT use `localStorage`/`sessionStorage` for secret | Banned pattern | Phase 2 concern |
| Do NOT create `tailwind.config.js` | Banned pattern | Use `@theme` in CSS |
| Use `tw-animate-css` not `tailwindcss-animate` | Convention | `@import "tw-animate-css"` in globals.css |
| Before using Edit/Write, start through GSD command | Workflow enforcement | Planner tasks use GSD entry points |

---

## Sources

### Primary (HIGH confidence)

- [VERIFIED: npm registry] — `next@16.2.3`, `next-themes@0.4.6`, `tailwindcss@4.2.2`, `tw-animate-css@1.4.0`, `lucide-react@1.8.0`, `react@19.2.5` — confirmed via `npm view` 2026-04-10
- [VERIFIED: npm registry] — `create-next-app --help` output — confirmed all available CLI flags including `--disable-git`, absence of `--turbopack`
- [CITED: ui.shadcn.com/docs/dark-mode/next] — ThemeProvider wrapper pattern, layout.tsx setup, `suppressHydrationWarning` usage
- [CITED: ui.shadcn.com/docs/tailwind-v4] — `@theme inline`, `tw-animate-css`, CSS variable structure, `@custom-variant dark`
- [CITED: github.com/shadcn-ui/next-template] — ThemeToggle two-state Sun/Moon implementation
- [CITED: ui.shadcn.com/docs/components/card] — Card subcomponents: CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction
- [CITED: nextjs.org/docs/app/building-your-application/deploying/static-exports] — `output: 'export'` config, image optimization limitation

### Secondary (MEDIUM confidence)

- [tepuii-tech/botsito-app codebase] — Confirms `@import "tailwindcss"` + `@custom-variant dark (&:is(.dark *))` + `@theme` pattern works in production on Next.js 15 + Tailwind v4

### Tertiary (LOW confidence)

- None

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all versions verified against npm registry
- Architecture: HIGH — patterns cited from official shadcn/ui docs + confirmed against reference project
- Pitfalls: HIGH (known) / MEDIUM (A4 directory issue) — primarily from official docs + known Next.js behavior

**Research date:** 2026-04-10
**Valid until:** 2026-05-10 (stable libraries; next-themes and shadcn/ui CLI update frequently but breaking changes are rare in this area)
