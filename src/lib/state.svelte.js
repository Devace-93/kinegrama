// Estado global de la app (runas de Svelte 5).
import { PAPERS, computeLayout } from './layout.js';

export const DEFAULT_SELECT = 4;

export const app = $state({
  step: 1,
  gifs: [],           // {name, frames:[canvas], w, h, selection:[], url}
  paperKey: 'carta',
  customW: 216,
  customH: 279,
  strip: 3,
  animate: true,
  speed: 15,
  fsOpen: false,
  fsIndex: 0,
});

export function getPaper() {
  if (app.paperKey !== 'custom') return PAPERS[app.paperKey];
  const w = Math.min(Math.max(+app.customW || 216, 50), 2000);
  const h = Math.min(Math.max(+app.customH || 279, 50), 2000);
  return { w, h };
}

export function getStrip() {
  const n = parseInt(app.strip, 10);
  return Math.min(Math.max(isNaN(n) ? 3 : n, 1), 20);
}

export function getLayout() {
  return computeLayout(app.gifs, getPaper(), getStrip());
}

export function maxFramesAllowed() {
  return Math.min(...app.gifs.map(g => g.frames.length));
}

/** Preselección distribuida (conserva selecciones existentes). */
export function defaultSelections() {
  const n = Math.min(DEFAULT_SELECT, maxFramesAllowed());
  for (const g of app.gifs) {
    if (g.selection.length) continue;
    g.selection = [];
    for (let k = 0; k < n; k++) {
      g.selection.push(Math.floor(k * g.frames.length / n));
    }
  }
}

export function toggleFrame(gi, fi) {
  const sel = app.gifs[gi].selection;
  const pos = sel.indexOf(fi);
  if (pos >= 0) sel.splice(pos, 1);
  else if (sel.length < maxFramesAllowed()) {
    // El orden del entrelazado es el orden original del GIF,
    // sin importar en qué orden se haga clic.
    sel.push(fi);
    sel.sort((a, b) => a - b);
  }
}

/** Todas las selecciones iguales y >= 2 (requisito para compartir rejilla). */
export function selectionsValid() {
  const counts = app.gifs.map(g => g.selection.length);
  return counts.every(c => c === counts[0]) && counts[0] >= 2;
}

export function restart() {
  app.gifs.forEach(g => URL.revokeObjectURL(g.url));
  app.gifs = [];
  app.fsOpen = false;
  app.step = 1;
}
