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

export function renderPage(canvas, p, ppm, offsetMm, animate, layout) {
  const { N, strip, mmpp } = layout;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (animate && !p.isBarrier) {
    // Real print effect: the interlaced kinegram with the barrier grid
    // (black strips + slit) sliding over it. Composited at native resolution
    // —where strip and slit are exact pixels— and then downscaled.
    if (!scratchCanvas) scratchCanvas = document.createElement('canvas');
    const s = scratchCanvas;
    if (s.width !== p.native.width) s.width = p.native.width;
    if (s.height !== p.native.height) s.height = p.native.height;
    const sctx = s.getContext('2d');
    sctx.drawImage(p.native, 0, 0);

    // Phase anchored to the image edge (not the sheet edge): every slit falls
    // exactly on one interlaced column. The pattern is periodic, so the cycle
    // is seamless with no jump on wrap-around, and the direction plays the
    // frames in their original order. On rotated images the strips run
    // horizontally and move vertically.
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
