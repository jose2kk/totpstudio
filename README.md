# TOTP Studio

A client-side TOTP code and QR generator. Enter or generate a base32 secret, tune the TOTP parameters, and get a live rotating code plus a QR code you can scan with any authenticator app.

**Live:** [totpstudio.jose2kk.com](https://totpstudio.jose2kk.com/)

## Features

- Live 6/8-digit TOTP codes with a wall-clock countdown
- Random base32 secret generator
- Configurable algorithm (SHA-1 / SHA-256 / SHA-512), digits (6/8), and period (30s/60s)
- Scannable QR code with optional issuer and account labels
- Copyable `otpauth://` URI
- Compatibility warning when the chosen algorithm isn't supported by common authenticator apps
- Dark / light / system theme
- 100% client-side — the secret never leaves the browser, no storage, no network calls

## Tech Stack

- [Next.js 16](https://nextjs.org/) with `output: 'export'` (fully static build)
- React 19.2, TypeScript 5
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [otplib](https://github.com/yeojz/otplib) for TOTP generation
- [react-qr-code](https://github.com/rosskhanas/react-qr-code) for QR rendering
- [next-themes](https://github.com/pacocoursey/next-themes) for theme management

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

Produces a static export in `out/` that can be served from any static host.

## Deployment

Deployed to Vercel as a fully static site — no server routes, no API endpoints. Any static host (Vercel, Netlify, Cloudflare Pages, S3 + CloudFront, GitHub Pages) will work.

## Privacy

All TOTP logic runs in the browser. The secret is held in React state only — it is never persisted to `localStorage`, `sessionStorage`, cookies, or sent over the network.

## Author

Built by [Jose Andres Morales](https://github.com/jose2kk) · [Repository](https://github.com/jose2kk/totpstudio)
