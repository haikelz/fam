# AGENTS.md

Agent guidance for working in this repository.

## What this is

`fam.` — a browser-only SvelteKit app that overlays a LinkedIn "Open to Work" or "Hiring" frame onto a profile photo and exports an 800×800 PNG. No backend, no secrets, no image upload.

## Commands

| Command          | What it does                               |
| ---------------- | ------------------------------------------ |
| `bun install`    | Install dependencies                       |
| `bun run dev`    | Dev server at http://localhost:5173        |
| `bun run check`  | `svelte-check` (types + Svelte diagnostics)|
| `bun run build`  | Production build                           |
| `bun run preview`| Serve the production build locally         |

Package manager is **bun** (`bun.lock` is committed).

## Map

- `src/routes/+layout.svelte` — app shell: theme toggle, SEO `<head>` (title, OpenGraph, Twitter, JSON-LD), skip link.
- `src/routes/+page.svelte` — the only page: upload/drop, frame picker, pan-to-reposition, download.
- `src/lib/compose.ts` — canvas compositor plus the frame geometry constants.
- `src/routes/robots.txt/+server.ts`, `src/routes/sitemap.xml/+server.ts` — dynamic SEO routes (emit origin-absolute URLs).
- `src/app.css` — Tailwind v4 + DaisyUI v5, custom themes, and ekel.dev design tokens.
- `static/frames/` — the two frame overlay PNGs.
- `static/logo.svg`, `static/opengraph.png` — brand + social-card assets (referenced by the SEO head).

## Conventions

- **Svelte 5 runes are forced** (see `vite.config.ts`). Use `$state` / `$derived` / `$effect` / `$props`; no legacy `let` reactivity, no `on:event` on components.
- **Frame geometry is derived from the PNGs** and lives only in `src/lib/compose.ts` (photo circle: radius 270 centered at (400, 399)). Do not re-derive or duplicate these constants.
- **Design tokens** come from `src/app.css` as `--color-*` (`text-foreground`, `border-border`, `text-muted-foreground`, …). DaisyUI components use `base-*` / `primary` / `error`.
- **Everything is client-side.** No server data, no env secrets, no API; image bytes never leave the browser.
- Brand assets live in `static/` and are referenced at root paths (`/logo.svg`, `/opengraph.png`).

## Verification

- `bun run check` must pass with 0 errors / 0 warnings.
- UI changes: run `bun run dev` and drive the page in a browser — upload a photo, confirm the canvas composite, exercise pan (drag + arrow keys) and download. The composite can be sanity-checked by sampling canvas pixels: photo at `(400, 399)`, ring at `(65, 400)`, banner at `(400, 700)`, transparent corner at `(700, 100)`.
