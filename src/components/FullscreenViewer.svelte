<script>
  import { app, SPEED_MIN, SPEED_MAX } from '../lib/state.svelte.js';
  import { t } from '../i18n/index.svelte.js';
  import RotateIcon from './RotateIcon.svelte';

  let { canvas = $bindable(null), captions, count, page, onnudge, onhold } = $props();

  function move(d) {
    app.fsIndex = (app.fsIndex + d + count) % count;
  }
  function close() {
    app.fsOpen = false;
  }
  function onkeydown(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') move(-1);
    else if (e.key === 'ArrowRight') move(1);
  }

  // Preview-only rotation, shared with the thumbnail via app.previewRot.
  const rot = $derived(app.previewRot[app.fsIndex] || 0);
  function rotate(deg) {
    app.previewRot[app.fsIndex] = (rot + deg + 360) % 360;
  }

  // Hand-drag the barrier sheet, like the home demo and the thumbnails.
  let drag = null;
  const draggable = $derived(app.animate && page && !page.isBarrier);
  const screenAxisY = $derived(page && page.rotated !== (rot % 180 === 90));

  function axisDeltaMm(dx, dy) {
    let ax, ay;
    switch (rot) {
      case 90: ax = dy; ay = -dx; break;
      case 180: ax = -dx; ay = -dy; break;
      case 270: ax = -dy; ay = dx; break;
      default: ax = dx; ay = dy;
    }
    // uniform scale: canvas px per mm along either axis
    const ppm = canvas.width / (rot % 180 !== 0 ? page.ph : page.pw);
    return (page.rotated ? ay : ax) / ppm;
  }
  function down(e) {
    if (!draggable) return;
    drag = { x: e.clientX, y: e.clientY };
    onhold?.(true, app.fsIndex);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function moveDrag(e) {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX;
    drag.y = e.clientY;
    onnudge?.(axisDeltaMm(dx, dy), page, app.fsIndex);
  }
  function up() {
    if (!drag) return;
    drag = null;
    onhold?.(false, app.fsIndex);
  }
</script>

<svelte:window {onkeydown} />

<!-- Always-dark overlay: fixed colors to keep contrast in both themes -->
<div class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center gap-3.5"
     role="dialog" aria-modal="true" aria-label={captions[app.fsIndex]}>
  <div class="absolute top-0 left-0 right-0 flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200">
    <span>{app.fsIndex + 1} / {count} — {captions[app.fsIndex]}</span>
    <div class="flex-1"></div>
    <button class="btn btn-sm bg-transparent text-gray-200 border-gray-500 hover:bg-white/10 hover:border-gray-300 shadow-none tooltip tooltip-bottom"
            data-tip={t('tip.rotateLeft')} aria-label={t('tip.rotateLeft')}
            onclick={() => rotate(-90)}><RotateIcon dir="ccw" /></button>
    <button class="btn btn-sm bg-transparent text-gray-200 border-gray-500 hover:bg-white/10 hover:border-gray-300 shadow-none tooltip tooltip-bottom"
            data-tip={t('tip.rotateRight')} aria-label={t('tip.rotateRight')}
            onclick={() => rotate(90)}><RotateIcon dir="cw" /></button>
    <button class="btn btn-sm bg-transparent text-gray-200 border-gray-500 hover:bg-white/10 hover:border-gray-300 shadow-none tooltip tooltip-bottom"
            data-tip={t('tip.close')} onclick={close}>
      {t('step3.close')}
    </button>
  </div>
  <button class="btn btn-lg bg-transparent text-gray-200 border-gray-500 hover:bg-white/10 hover:border-gray-300 shadow-none text-2xl tooltip"
          data-tip={t('tip.prevSheet')} aria-label={t('tip.prevSheet')} onclick={() => move(-1)}>‹</button>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <canvas bind:this={canvas}
          class="bg-white shadow-2xl {draggable ? 'cursor-grab active:cursor-grabbing' : ''}"
          style="touch-action: {screenAxisY ? 'pan-x' : 'pan-y'}"
          aria-label={captions[app.fsIndex]}
          onpointerdown={down}
          onpointermove={moveDrag}
          onpointerup={up}
          onpointercancel={up}></canvas>
  <button class="btn btn-lg bg-transparent text-gray-200 border-gray-500 hover:bg-white/10 hover:border-gray-300 shadow-none text-2xl tooltip"
          data-tip={t('tip.nextSheet')} aria-label={t('tip.nextSheet')} onclick={() => move(1)}>›</button>

  <!-- The preview controls stay available in fullscreen -->
  <div class="absolute bottom-0 left-0 right-0 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-3 text-sm text-gray-200">
    <label class="flex items-center gap-2 cursor-pointer tooltip" data-tip={t('tip.animate')}>
      <input type="checkbox" class="checkbox checkbox-sm checkbox-primary" bind:checked={app.animate} />
      {t('step3.animate')}
    </label>
    <label class="flex items-center gap-2 tooltip" data-tip={t('tip.speed')}>
      {t('step3.speed')}
      <input type="range" class="range range-sm range-primary w-40" min={SPEED_MIN} max={SPEED_MAX} step="1"
             bind:value={app.speed} />
    </label>
    <label class="flex items-center gap-2 tooltip" data-tip={t('tip.strip')}>
      {t('step3.strip')}
      <input type="range" class="range range-sm range-primary w-28" min="1" max="4" step="1"
             bind:value={app.strip} />
      <span class="w-3">{app.strip}</span>
    </label>
  </div>
</div>
