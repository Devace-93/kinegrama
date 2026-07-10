// Generación de PDFs (sin textos ni instrucciones dentro de los documentos).
// jsPDF se carga bajo demanda para no engordar el bundle inicial.
import { interlaceGif, rotateCanvas90 } from './interlace.js';

// Rejilla a lo ancho COMPLETO de la hoja: ranura transparente cada N franjas,
// el patrón se repite horizontalmente de borde a borde y a toda la altura.
export function barrierCanvas(layout) {
  const { paper, N, strip, mmpp } = layout;
  const c = document.createElement('canvas');
  c.width = Math.ceil(paper.w / mmpp);
  c.height = Math.ceil(paper.h / mmpp);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#000';
  for (let x = 0; x < c.width; x += strip) {
    if (Math.floor(x / strip) % N !== 0) {
      ctx.fillRect(x, 0, Math.min(strip, c.width - x), c.height);
    }
  }
  return c;
}

// jsPDF fuerza alto>=ancho en 'portrait', así que en custom horizontal
// hay que declarar 'landscape' para conservar las dimensiones capturadas.
function docOrientation(paper) {
  return paper.w > paper.h ? 'landscape' : 'portrait';
}

export async function pdfKinegrams(gifs, layout) {
  const { jsPDF } = await import('jspdf');
  const { paper, perGif, strip } = layout;
  const fmt = [paper.w, paper.h];
  const orient = docOrientation(paper);
  const doc = new jsPDF({ unit: 'mm', format: fmt, orientation: orient });
  gifs.forEach((g, i) => {
    if (i > 0) doc.addPage(fmt, orient);
    const info = perGif[i];
    let c = interlaceGif(g, strip);
    if (info.rotated) c = rotateCanvas90(c);
    doc.addImage(c.toDataURL('image/png'), 'PNG',
      (paper.w - info.wmm) / 2, (paper.h - info.hmm) / 2, info.wmm, info.hmm);
  });
  doc.save('kinegramas.pdf');
}

export async function pdfBarrier(layout) {
  const { jsPDF } = await import('jspdf');
  const { paper } = layout;
  const doc = new jsPDF({ unit: 'mm', format: [paper.w, paper.h], orientation: docOrientation(paper) });
  doc.addImage(barrierCanvas(layout).toDataURL('image/png'), 'PNG',
    0, 0, paper.w, paper.h);
  doc.save('rejilla.pdf');
}
