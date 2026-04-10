# Stack Research

**Domain:** Client-side TOTP QR Code Generator webapp
**Researched:** 2026-04-10
**Confidence:** HIGH (all core recommendations verified against official sources or GitHub)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.x (16.2.3 latest) | App framework | Mandatory per project constraints. v16 is stable (released Oct 2025), Turbopack is now default bundler, ships React 19.2. For a pure client-side SPA, `output: 'export'` in `next.config.ts` generates a fully static build — no server required, ideal for Vercel static hosting. |
| React | 19.2 (bundled with Next.js 16) | UI rendering | Ships with Next.js 16. No separate version pinning needed. |
| TypeScript | 5.x (5.1+ required by Next.js 16) | Type safety | Mandatory per project constraints. `create-next-app` scaffolds TypeScript by default. |
| Tailwind CSS | 4.2.x | Utility-first styling | Mandatory per project constraints. v4 is the current major (released Jan 2026); new projects initialized via `create-next-app` get v4 automatically. Zero-config setup — single `@import "tailwindcss"` line in CSS, no `tailwind.config.js` required. |
| shadcn/ui | latest CLI (`shadcn@latest`) | Component library | Mandatory per project constraints. Fully updated for Tailwind v4 and React 19. Not a versioned npm package — it's a CLI that scaffolds components directly into the project. `npx shadcn@latest init` handles Tailwind v4 setup automatically. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| otplib | 13.4.0 | TOTP code generation, `otpauth://` URI building | Primary TOTP engine. TypeScript-first, 1.57M weekly downloads, actively maintained (v13.4.0 released March 2026), uses audited `@noble/hashes` and `@scure/base` under the hood. Supports SHA1/SHA256/SHA512, configurable digits and period. Generates the `otpauth://totp/` URI needed for QR encoding. |
| react-qr-code | 2.0.18 | QR code rendering as SVG | Renders QR codes as SVG (no canvas fallback needed for this use case). 911K weekly downloads, actively maintained. Accepts `value`, `size`, `level` (L/M/Q/H error correction), `bgColor`, `fgColor` props. SVG output means the QR code scales cleanly on all screen densities — critical for mobile scanning. |
| next-themes | 0.4.6 | Dark/light/system theme management | Standard solution for Next.js dark mode. Wraps the app in a `ThemeProvider`, zero-flash on load for both SSR and SSG, syncs across tabs. Supports `attribute="class"` for Tailwind's `dark:` variant. `defaultTheme="system"` for system-aware default. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `create-next-app@latest` | Project scaffolding | Generates Next.js 16 + TypeScript + Tailwind v4 + App Router structure. Use flags: `--typescript --tailwind --eslint --app` |
| `shadcn@latest init` | shadcn/ui initialization | Run after project creation. Detects Tailwind v4, sets up `components.json`, installs base CSS variables. |
| Turbopack | Dev/build bundler | Default in Next.js 16 — no configuration needed. 2-5x faster builds, up to 10x faster Fast Refresh vs Webpack. |
| ESLint | Linting | `create-next-app` now generates explicit `eslint.config.mjs` (flat config). `next lint` command is removed in Next.js 16 — run `eslint` directly. |

## Installation

```bash
# 1. Scaffold the project
npx create-next-app@latest totp-qr --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Initialize shadcn/ui (run from project root)
cd totp-qr
npx shadcn@latest init

# 3. Add shadcn components you need
npx shadcn@latest add button input label select badge

# 4. Core runtime dependencies
npm install otplib react-qr-code next-themes

# 5. Static export config (add to next.config.ts)
# output: 'export'  — generates static HTML/JS, no server needed
```

## Static Export Configuration

For client-side-only Vercel deployment, add this to `next.config.ts`:

```typescript
const nextConfig = {
  output: 'export',
  // No server-side features used, so no restrictions apply
};

export default nextConfig;
```

Vercel auto-detects `output: 'export'` and serves the `out/` directory. No `vercel.json` needed.

## Dark Mode Setup

With next-themes 0.4.6 + Tailwind v4 + shadcn/ui, the setup is:

1. Wrap root layout with `ThemeProvider` (from `next-themes`)
2. Add `suppressHydrationWarning` to `<html>` tag to prevent hydration mismatch
3. shadcn/ui's `init` command pre-wires dark mode CSS variables via `@theme inline` in `globals.css`
4. Tailwind v4 uses `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))` or class-based — shadcn handles this

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| otplib 13.x | otpauth 9.5.0 | If you need `otpauth://` URI parsing (not just generation), otpauth has slightly cleaner URI API. Both are valid; otplib is preferred here for TypeScript-first ergonomics and higher ecosystem adoption (1.57M vs 1.1M weekly downloads). |
| react-qr-code | qrcode.react | If you need Canvas fallback rendering or want to embed a logo inside the QR code. qrcode.react exports both `QRCodeSVG` and `QRCodeCanvas` components. Last npm publish was ~1 year ago; lower maintenance signal. |
| next-themes | Manual CSS `prefers-color-scheme` | Only if you need zero JS dependency for theme switching. Manual approach is more brittle and doesn't support user override (manual toggle). |
| Next.js 16 (output: export) | Vite + React | If you weren't constrained to Next.js. Vite would produce a lighter bundle for a pure SPA. But Next.js is a hard requirement, and `output: 'export'` produces equivalent static output. |
| Tailwind v4 | Tailwind v3 | If you have an existing v3 project. For greenfield, v4 is the correct choice — it's what `create-next-app` scaffolds and what shadcn/ui now targets. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `speakeasy` | Unmaintained (last release 2017, known security issues). Was the go-to Node.js 2FA library but is now abandoned. | `otplib` or `otpauth` |
| `totp-generator` | Minimal library that handles only code generation — no URI builder, no SHA256/SHA512 support. Would require a second library for the `otpauth://` URI. | `otplib` (handles both TOTP generation and URI encoding in one package) |
| `next export` CLI command | Removed in Next.js 13+. Will error if called. | `output: 'export'` in `next.config.ts` |
| Server Components for TOTP/QR logic | TOTP state (current code, countdown) requires client-side timers. Attempting this in RSC would require awkward `'use client'` boundaries. | Single `'use client'` component containing all TOTP/QR logic |
| `localStorage` / `sessionStorage` for secret | Project requirements explicitly prohibit persistence. Accidental persistence would be a privacy violation for this tool. | Keep all state in React state only (`useState`) |
| Tailwind v3 config (`tailwind.config.js`) | Obsolete with v4. shadcn/ui v4 setup doesn't use it; `@theme` directive in CSS replaces it. | `@theme` directive in `globals.css` |

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 16.x | React 19.2, TypeScript 5.1+ | React 19.2 ships bundled — install via `npm install next@latest react@latest react-dom@latest` |
| shadcn/ui (CLI) | Tailwind v4, React 19 | Official support confirmed. New projects auto-use v4. No `--legacy-peer-deps` needed with pnpm/yarn; npm users may still need it for some component peer deps. |
| next-themes 0.4.6 | Next.js App Router, React 19 | Works. Add `suppressHydrationWarning` to `<html>` tag. Use `attribute="class"` for Tailwind dark mode compatibility. |
| otplib 13.4.0 | Browser (ESM), Node.js 20+ | Browser-compatible via ESM. Uses `@noble/hashes` (security audited). No native Node crypto APIs. |
| react-qr-code 2.0.18 | React 19 | No known issues with React 19. Peer dep is `react >=16.8.0`. |

## Sources

- https://nextjs.org/blog/next-16 — Next.js 16 release notes (Oct 21, 2025), confirmed version, features, breaking changes. HIGH confidence.
- https://nextjs.org/blog/next-15-5 — Next.js 15.5 context (Aug 18, 2025). HIGH confidence.
- https://ui.shadcn.com/docs/tailwind-v4 — shadcn/ui official Tailwind v4 status. HIGH confidence.
- https://github.com/hectorm/otpauth — otpauth v9.5.0 (Feb 2026), algorithm support confirmed. HIGH confidence.
- https://github.com/yeojz/otplib — otplib v13.4.0 (Mar 2026), TypeScript-first, ESM confirmed. HIGH confidence.
- https://github.com/rosskhanas/react-qr-code — react-qr-code v2.0.18 (Jul 2025), SVG, level/size props confirmed. HIGH confidence.
- https://github.com/pacocoursey/next-themes — next-themes v0.4.6, App Router compatible. HIGH confidence.
- https://npmtrends.com/otpauth-vs-otplib — download comparison (otplib 1.57M vs otpauth 1.1M/week). MEDIUM confidence (snapshot may drift).
- https://tailwindcss.com/blog/tailwindcss-v4 — Tailwind v4.0 release, architecture changes. HIGH confidence.
- WebSearch: "Tailwind CSS v4 current version 2026" — confirmed v4.2.0 released Feb 18, 2026. MEDIUM confidence (no official changelog URL fetched).

---
*Stack research for: Client-side TOTP QR Code Generator webapp*
*Researched: 2026-04-10*
