# Kinegram Generator

**🌐 https://kinegram.3m4.net**

Web tool to create **kinegrams** (barrier-grid animations, also known as *scanimations*): an optical illusion where the frames of an animation are interlaced as vertical strips inside a single printed image. When a transparent grid with black lines slides over it, the slits reveal one frame at a time and the image comes to life.

The app generates both print-ready parts: the **kinegrams** (paper) and their **barrier grid** (transparency/acetate).

## How it works

1. **GIF selection** — load one or more animated GIFs (click or drag & drop).
2. **Frame selection** — click to choose which frames to use from each GIF. Every GIF must use the same number of frames so they can all share a single barrier grid.
3. **Paper + preview** — pick a paper size (Letter, Legal MX, A4 or custom) and strip width; watch the animated preview of the real printed effect (with a fullscreen viewer) and download both PDFs.

### Technical details of the effect

- Column `x` of the interlaced image comes from frame `(x / strip) mod N`, copied from that same position.
- The barrier grid is opaque with a transparent slit every `N` strips; the cycle is `N × strip` px wide.
- The mm/px scale is **global**: the largest one that lets every GIF fit on the sheet (upright or rotated 90° inside the sheet). Images are never scaled individually — that is why **the same grid works for every kinegram** in the document.
- Print everything at **100% (no scaling)**: kinegrams on paper, barrier grid on a transparency.

## Development

```bash
npm install
npm run dev       # http://localhost:5173/
npm run build     # production build in dist/
npm run preview   # serve the build locally
```

### Stack

| Area | Technology |
|---|---|
| UI | [Svelte 5](https://svelte.dev) (runes) + [Tailwind CSS 4](https://tailwindcss.com) + [daisyUI 5](https://daisyui.com) |
| Build | [Vite](https://vite.dev) |
| i18n | [i18next](https://www.i18next.com) — Spanish (default) and English |
| GIF decoding | `ImageDecoder` API with [gifuct-js](https://github.com/matt-way/gifuct-js) fallback |
| PDFs | [jsPDF](https://github.com/parallax/jsPDF) (lazy-loaded) |

### Structure

```
src/
  lib/            pure logic: gif.js, interlace.js, layout.js, pdf.js, preview.js
  components/     3-step wizard + fullscreen viewer
  i18n/           es/en catalogs
legacy/index.html original single-file version (reference)
```

## Deploy

Every push to `main` builds and publishes automatically to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`), served on the custom domain `kinegram.3m4.net`.
