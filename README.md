# NHMUN'26 Site

Conference website and application platform for NHMUN'26.

## Conference

- Name: NHMUN'26
- Date: 10-11-12 July 2026
- Location: Barbaros Hayrettin Middle School / Izmir Konak
- Instagram: https://www.instagram.com/nhmun26/

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Cloudflare Pages
- Cloudflare Pages Functions / Workers
- Cloudflare D1
- Cloudflare Turnstile

## Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run build
npm run format
```

## Project Structure

```text
src/components  shared UI components
src/sections    landing page sections
src/data        static NHMUN'26 content
src/lib         shared utilities
src/assets      optimized site assets
functions       Cloudflare Pages Functions
migrations      Cloudflare D1 migrations
```

## Environment

Copy `.env.example` to `.env.local` for local-only values. Never commit real secrets.

## Phase Status

- Phase 00: project setup
- Phase 01: NHMUN visual system
- Phase 02: landing shell
- Phase 03+: conference sections, applications, admin, deployment

## Local Visual Assets

Source images are copied from `C:\Users\emir_\Desktop\site görseller` into
`src/assets/nhmun/originals` and optimized into AVIF/WebP variants under
`src/assets/nhmun`.
