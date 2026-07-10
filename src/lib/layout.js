export const PAPERS = {
  carta:  { w: 215.9, h: 279.4 },
  oficio: { w: 215.9, h: 340 },
  a4:     { w: 210,   h: 297 },
};

export const MARGIN_MM = 10; // margin for kinegram pages (the barrier grid has none)

/**
 * Global layout. Every sheet shares the same orientation (presets: portrait;
 * custom: as entered by the user). Images that don't fit upright are rotated
 * 90° INSIDE the sheet. The mm/px scale is GLOBAL: the largest one that lets
 * ALL gifs fit (upright or rotated) — images are never scaled individually,
 * so the same barrier grid works for all of them.
 */
export function computeLayout(gifs, paper, strip) {
  const N = gifs[0].selection.length;
  const availW = paper.w - 2 * MARGIN_MM;
  const availH = paper.h - 2 * MARGIN_MM;

  let mmpp = Infinity;
  for (const g of gifs) {
    const fitN = Math.min(availW / g.w, availH / g.h);
    const fitR = Math.min(availW / g.h, availH / g.w);
    mmpp = Math.min(mmpp, Math.max(fitN, fitR));
  }

  const perGif = gifs.map(g => {
    const rotated = !(g.w * mmpp <= availW && g.h * mmpp <= availH);
    return {
      rotated,
      wmm: (rotated ? g.h : g.w) * mmpp,   // box already rotated on the sheet
      hmm: (rotated ? g.w : g.h) * mmpp,
    };
  });

  return { paper, N, strip, mmpp, perGif };
}
