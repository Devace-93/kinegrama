// Global app state (Svelte 5 runes).
import { PAPERS, computeLayout } from './layout.js';

export const DEFAULT_SELECT = 4;
export const MAX_FRAMES = 6;

// Preview sweep tempo. At SPEED_DEFAULT the barrier sheet crosses each
// kinegram in 15 s per direction, matching the home demo; the slider spans
// 0.5×–1.5× of that (30 s down to 10 s per direction).
export const SPEED_DEFAULT = 12;
export const SPEED_MIN = 6;
export const SPEED_MAX = 18;

export const app = $state({
  step: 1,
  dir: 1,             // navigation direction (1 forward, -1 back) for animations
  confirmRestart: false,
  gifs: [],           // {name, frames:[canvas], w, h, selection:[], url}
  paperKey: 'carta',
  customW: 216,
  customH: 279,
  strip: 2,
  animate: true,
  speed: SPEED_DEFAULT,
  fsOpen: false,
  fsIndex: 0,
  previewRot: {},     // per-sheet preview rotation (deg); never touches the PDF
});

export function goStep(n) {
  app.dir = n > app.step ? 1 : -1;
  app.step = n;
}

export function getPaper() {
  if (app.paperKey !== 'custom') return PAPERS[app.paperKey];
  const w = Math.min(Math.max(+app.customW || 216, 50), 2000);
  const h = Math.min(Math.max(+app.customH || 279, 50), 2000);
  return { w, h };
}

export function getStrip() {
  const n = parseInt(app.strip, 10);
  return Math.min(Math.max(isNaN(n) ? 2 : n, 1), 4);
}

export function getLayout() {
  return computeLayout(app.gifs, getPaper(), getStrip());
}

export function maxFramesAllowed() {
  return Math.min(MAX_FRAMES, ...app.gifs.map(g => g.frames.length));
}

/** Preselects the first frames of each gif (keeps existing selections). */
export function defaultSelections() {
  const n = Math.min(DEFAULT_SELECT, maxFramesAllowed());
  for (const g of app.gifs) {
    if (g.selection.length) continue;
    g.selection = [];
    for (let k = 0; k < n; k++) g.selection.push(k);
  }
}

export function toggleFrame(gi, fi) {
  const sel = app.gifs[gi].selection;
  const pos = sel.indexOf(fi);
  if (pos >= 0) sel.splice(pos, 1);
  else if (sel.length < maxFramesAllowed()) {
    // Interlacing order is the GIF's original frame order,
    // regardless of the order frames were clicked in.
    sel.push(fi);
    sel.sort((a, b) => a - b);
  }
}

/** All selections equal and >= 2 (required to share one barrier grid). */
export function selectionsValid() {
  const counts = app.gifs.map(g => g.selection.length);
  return counts.every(c => c === counts[0]) && counts[0] >= 2;
}

export function restart() {
  app.gifs.forEach(g => URL.revokeObjectURL(g.url));
  app.gifs = [];
  app.fsOpen = false;
  app.previewRot = {};
  app.confirmRestart = false;
  app.dir = -1;
  app.step = 1;
}
