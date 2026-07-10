// Entrelazado: la franja de columnas [x, x+strip) sale del frame (x/strip) mod N,
// copiada desde esa MISMA posición x del frame.

/** Genera el canvas entrelazado de un gif con su selección de frames. */
export function interlaceGif(gif, strip) {
  const sel = gif.selection;
  const N = sel.length;
  const c = document.createElement('canvas');
  c.width = gif.w; c.height = gif.h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, gif.w, gif.h);
  for (let x = 0; x < gif.w; x += strip) {
    const w = Math.min(strip, gif.w - x);
    const frame = gif.frames[sel[Math.floor(x / strip) % N]];
    ctx.drawImage(frame, x, 0, w, gif.h, x, 0, w, gif.h);
  }
  return c;
}

export function rotateCanvas90(c) {
  const r = document.createElement('canvas');
  r.width = c.height; r.height = c.width;
  const ctx = r.getContext('2d');
  ctx.translate(r.width / 2, r.height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(c, -c.width / 2, -c.height / 2);
  return r;
}
