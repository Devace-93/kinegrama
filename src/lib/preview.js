// Preview sheet rendering (thumbnails and fullscreen viewer).
import { interlaceGif } from './interlace.js';
import { barrierCanvas } from './pdf.js';

// Draws an image inside its box on the sheet, rotating it 90° if needed.
// Position is rounded to whole px so the preview barrier grid lines up
// exactly with the interlaced columns.
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

/** Page descriptors (one per gif + one for the barrier grid) for the preview. */
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
    // Sheet at native resolution (1 canvas px = 1 gif px): strips are exact
    // here; the preview composites the barrier on top and then downscales.
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

/** Travel of the sweeping sheet along its axis (mm): image span + margins. */
export function travelMm(p) {
  return 1.15 * (p.rotated ? p.hmm : p.wmm);
}

/**
 * Paints one sheet. `phase` is the sweep progress: like the home demo, a
 * barrier sheet 1.5× the kinegram's span rests just past its right/bottom
 * edge at 0, crosses it, and stops just past its left/top edge at 1.
 * `rot` (0/90/180/270) rotates the whole page in the preview only.
 */
export function renderPage(canvas, p, ppm, phase, animate, layout, rot = 0) {
  const { N, strip, mmpp } = layout;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const pw = Math.round(p.pw * ppm), ph = Math.round(p.ph * ppm);

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  if (rot) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.translate(-pw / 2, -ph / 2);
  }

  if (animate && !p.isBarrier) {
    // Real print effect: the barrier sheet (black strips + one slit per
    // cycle) over the interlaced kinegram. Composited at native resolution
    // —where strip and slit are exact pixels— and then downscaled.
    if (!scratchCanvas) scratchCanvas = document.createElement('canvas');
    const s = scratchCanvas;
    if (s.width !== p.native.width) s.width = p.native.width;
    if (s.height !== p.native.height) s.height = p.native.height;
    const sctx = s.getContext('2d');
    sctx.drawImage(p.native, 0, 0);

    // On rotated placements the strips run horizontally, so the sheet is a
    // bit wider than the image and sweeps vertically instead.
    const vertical = !p.rotated;
    const axisLen = (vertical ? p.wmm : p.hmm) / mmpp;
    const axisStart = (vertical ? p.dxmm : p.dymm) / mmpp;
    const perpLen = (vertical ? p.hmm : p.wmm) / mmpp;
    const perpStart = (vertical ? p.dymm : p.dxmm) / mmpp - 0.065 * perpLen;
    const perpSpan = 1.13 * perpLen;
    const sheetSpan = 1.5 * axisLen;
    const margin = 0.075 * axisLen;
    const sheetPos = Math.round(axisStart + axisLen + margin - phase * travelMm(p) / mmpp);

    sctx.fillStyle = '#000';
    for (let k = 0; (k + 1) * strip <= sheetSpan; k++) {
      if (k % N === 0) continue; // the slit that reveals one column per cycle
      const v = sheetPos + k * strip;
      if (vertical) sctx.fillRect(v, perpStart, strip, perpSpan);
      else sctx.fillRect(perpStart, v, perpSpan, strip);
    }
    ctx.drawImage(s, 0, 0, pw, ph);
  } else {
    drawPlaced(ctx, p.img, p, ppm);
  }
  ctx.restore();
}
