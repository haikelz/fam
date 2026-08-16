# fam.

Add a LinkedIn **Open to Work** or **Hiring** frame to your profile photo — entirely in the browser. Nothing is uploaded; you get back an 800×800 PNG ready for LinkedIn.

## Features

- Drag-and-drop a photo anywhere on the page, or click to browse.
- Pick the **Open to Work** or **Hiring** frame.
- Drag the preview (or use the arrow keys) to reposition your photo inside the circular crop; reset with one click.
- Export an 800×800 PNG with transparent corners, ready for your LinkedIn profile.

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) + TypeScript (Svelte 5 runes)
- [DaisyUI](https://daisyui.com/) v5 + Tailwind CSS v4

## How it works

The frame overlays (`static/frames/opentowork.png`, `static/frames/hiring.png`) are 800×800 transparent PNGs. `src/lib/compose.ts` center-crops your photo, draws it as the ring's inner circle, and composites the frame on top. The ring hugs the left of the photo and the banner overlaps its bottom.

## Getting started

```sh
bun install
bun run dev
```

Open http://localhost:5173.

## Building

```sh
bun run build
bun run preview
```

## Brand assets

- `static/logo.svg` — favicon / logo
- `static/opengraph.png` — 1200×630 social card, referenced by the OpenGraph and Twitter tags
