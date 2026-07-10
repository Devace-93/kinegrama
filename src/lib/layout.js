export const PAPERS = {
  carta:  { w: 215.9, h: 279.4 },
  oficio: { w: 215.9, h: 340 },
  a4:     { w: 210,   h: 297 },
};

export const MARGIN_MM = 10; // margen de las páginas de kinegramas (la rejilla no lleva)

/**
 * Layout global. Todas las hojas comparten orientación (presets: vertical;
 * custom: como la capture el usuario). Las imágenes que no quepan derechas
 * se rotan 90° DENTRO de la hoja. La escala mm/px es GLOBAL: la mayor que
 * permita que TODOS los gifs quepan (derechos o rotados) — nunca se escala
 * individualmente, así la misma rejilla sirve para todos.
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
      wmm: (rotated ? g.h : g.w) * mmpp,   // caja ya rotada sobre la hoja
      hmm: (rotated ? g.w : g.h) * mmpp,
    };
  });

  return { paper, N, strip, mmpp, perGif };
}
