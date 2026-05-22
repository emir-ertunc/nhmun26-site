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

Local preview: http://127.0.0.1:5173/

## Checks

```bash
npm run check
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
See `docs/deployment.md` for the Cloudflare Pages, D1, Turnstile, and domain setup runbook.

### Turnstile

Phase 08 protects the application endpoint with Cloudflare Turnstile.

- `VITE_TURNSTILE_SITE_KEY`: public site key used by the form widget.
- `TURNSTILE_SECRET_KEY`: private secret used by `/api/applications`.
- `APP_ENV=local` allows local API testing without a Turnstile secret.
- Production submissions require a valid Turnstile token before any D1 write.

## Phase Status

- Phase 00: project setup
- Phase 01: NHMUN visual system
- Phase 02: landing shell
- Phase 03+: conference sections, applications, admin, deployment

## Local Visual Assets

Source images are copied from `C:\Users\emir_\Desktop\site görseller` into
`src/assets/nhmun/originals` and optimized into AVIF/WebP variants under
`src/assets/nhmun`.
