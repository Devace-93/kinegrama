// Render de las hojas del preview (miniaturas y visor fullscreen).
import { interlaceGif } from './interlace.js';
import { barrierCanvas } from './pdf.js';

// Dibuja una imagen en su caja sobre la hoja, rotándola 90° si aplica.
// Posición redondeada a px enteros para que la rejilla del preview
// quede perfectamente alineada con las columnas del entrelazado.
export function drawPlaced(ctx, img, p, ppm) {
  const x = Math.round(p.dxmm * ppm), y = Math.round(p.dymm * ppm);
  const w = p.wmm * ppm, h = p.hmm * ppm;
  if (p.rotated) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(img, -h / 2, -w / 2, h, w);
    ctx.restore();
  } else {
    ctx.drawImage(img, x, y, w, h);
  }
}

/** Descriptores de página (una por gif + una de rejilla) para el preview. */
export function buildPages(gifs, layout) {
  const { paper, mmpp, perGif } = layout;
  const pages = gifs.map((g, i) => {
    const info = perGif[i];
    const p = {
      img: interlaceGif(g, layout.strip),
      pw: paper.w, ph: paper.h,
      rotated: info.rotated,
      dxmm: (paper.w - info.wmm) / 2,
      dymm: (paper.h - info.hmm) / 2,
      wmm: info.wmm, hmm: info.hmm,
      isBarrier: false,
      gifName: g.name,
    };
    // Hoja a resolución nativa (1px de canvas = 1px de gif): aquí las franjas
    // son exactas; el preview compone la rejilla encima y reescala.
    p.native = document.createElement('canvas');
    p.native.width = Math.round(paper.w / mmpp);
    p.native.height = Math.round(paper.h / mmpp);
    const nctx = p.native.getContext('2d');
    nctx.fillStyle = '#fff';
    nctx.fillRect(0, 0, p.native.width, p.native.height);
    drawPlaced(nctx, p.img, p, 1 / mmpp);
    return p;
  });

  pages.push({
    img: barrierCanvas(layout),
    pw: paper.w, ph: paper.h,
    rotated: false,
    dxmm: 0, dymm: 0, wmm: paper.w, hmm: paper.h,
    isBarrier: true,
  });
  return pages;
}

let scratchCanvas = null;

export function renderPage(canvas, p, ppm, offsetMm, animate, layout) {
  const { N, strip, mmpp } = layout;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (animate && !p.isBarrier) {
    // Efecto real de impresión: el kinegrama entrelazado con la rejilla
    // (franjas negras + ranura) deslizándose encima. Se compone a resolución
    // nativa —donde franja y ranura son píxeles exactos— y se reescala.
    if (!scratchCanvas) scratchCanvas = document.createElement('canvas');
    const s = scratchCanvas;
    if (s.width !== p.native.width) s.width = p.native.width;
    if (s.height !== p.native.height) s.height = p.native.height;
    const sctx = s.getContext('2d');
    sctx.drawImage(p.native, 0, 0);

    // Fase anclada al borde de la imagen (no al de la hoja): cada ranura cae
    // exactamente sobre una columna del entrelazado. El patrón es periódico,
    // así que el ciclo es infinito y sin salto al reiniciar; la dirección
    // reproduce los frames en su orden original. En imágenes rotadas las
    // franjas van horizontales y se desplazan en vertical.
    const period = N * strip;
    const offPx = Math.round(offsetMm / mmpp);
    const vertical = !p.rotated;
    const len = vertical ? s.width : s.height;
    const anchorPx = Math.round((vertical ? p.dxmm : p.dymm) / mmpp);
    const first = (((anchorPx + offPx) % period) + period) % period - period;
    sctx.fillStyle = '#000';
    for (let v = first, i = 0; v < len; v += strip, i++) {
      if (i % N !== 0) {
        if (vertical) sctx.fillRect(v, 0, strip, s.height);
        else sctx.fillRect(0, v, s.width, strip);
      }
    }
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(s, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPlaced(ctx, p.img, p, ppm);
  }
}
