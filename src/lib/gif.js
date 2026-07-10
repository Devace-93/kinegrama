// Decodificación de GIFs a un arreglo de canvases (un frame compuesto por canvas).
import { parseGIF, decompressFrames } from 'gifuct-js';

async function decodeWithImageDecoder(buf) {
  const decoder = new ImageDecoder({ data: buf, type: 'image/gif' });
  await decoder.tracks.ready;
  await decoder.completed;
  const count = decoder.tracks.selectedTrack.frameCount;
  const out = [];
  for (let i = 0; i < count; i++) {
    const { image } = await decoder.decode({ frameIndex: i });
    const c = document.createElement('canvas');
    c.width = image.displayWidth;
    c.height = image.displayHeight;
    c.getContext('2d').drawImage(image, 0, 0);
    image.close();
    out.push(c);
  }
  decoder.close();
  return out;
}

function decodeWithGifuct(buf) {
  const gif = parseGIF(buf);
  const raw = decompressFrames(gif, true);
  const W = gif.lsd.width, H = gif.lsd.height;
  const compo = document.createElement('canvas');
  compo.width = W; compo.height = H;
  const ctx = compo.getContext('2d', { willReadFrequently: true });
  const patch = document.createElement('canvas');
  const patchCtx = patch.getContext('2d');
  const out = [];
  let snapshot = null;

  for (const f of raw) {
    const { top, left, width, height } = f.dims;
    if (f.disposalType === 3) snapshot = ctx.getImageData(0, 0, W, H);
    patch.width = width; patch.height = height;
    patchCtx.putImageData(new ImageData(f.patch, width, height), 0, 0);
    ctx.drawImage(patch, left, top);

    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = W; frameCanvas.height = H;
    frameCanvas.getContext('2d').drawImage(compo, 0, 0);
    out.push(frameCanvas);

    if (f.disposalType === 2) ctx.clearRect(left, top, width, height);
    else if (f.disposalType === 3 && snapshot) ctx.putImageData(snapshot, 0, 0);
  }
  return out;
}

/** Decodifica un File GIF a sus frames. Lanza si tiene menos de 2 frames. */
export async function decodeGifFile(file) {
  const buf = await file.arrayBuffer();
  const frames = ('ImageDecoder' in window)
    ? await decodeWithImageDecoder(buf)
    : decodeWithGifuct(buf);
  if (frames.length < 2) {
    const err = new Error(`${file.name}: only 1 frame`);
    err.code = 'single-frame';
    err.gifName = file.name;
    throw err;
  }
  return frames;
}
