<script>
  import { app } from '../lib/state.svelte.js';
  import { t } from '../i18n/index.svelte.js';
  import RotateIcon from './RotateIcon.svelte';

  let { pages, ppm, captions, onnudge, onhold } = $props();

  // Mobile gallery: below sm only the current page is shown, with arrows.
  let idx = $state(0);
  $effect(() => {
    if (idx >= pages.length) idx = 0;
  });

  // Registers the sheet canvas: Step3Paper's loop sizes and repaints it.
  function register(node, p) {
    p.canvas = node;
  }

  const rotOf = i => app.previewRot[i] || 0;
  function rotate(i, deg) {
    app.previewRot[i] = (rotOf(i) + deg + 360) % 360;
  }

  // The drag axis follows the strips: vertical for rotated placements,
  // then remapped through the preview rotation.
  const screenAxisY = (p, i) => p.rotated !== (rotOf(i) % 180 === 90);

  // Un-rotates a screen-space delta into page space and returns the
  // component along the sweep axis, in mm.
  function axisDeltaMm(p, i, dx, dy) {
    let ax, ay;
    switch (rotOf(i)) {
      case 90: ax = dy; ay = -dx; break;
      case 180: ax = -dx; ay = -dy; break;
      case 270: ax = -dy; ay = dx; break;
      default: ax = dx; ay = dy;
    }
    return (p.rotated ? ay : ax) / ppm;
  }

  // Hand-drag the barrier sheet over a page (like the home demo). A real
  // drag suppresses the click that would open the fullscreen viewer.
  let drag = null;
  let suppressClick = false;
  const draggable = p => app.animate && !p.isBarrier;

  function down(e, p, i) {
    if (!draggable(p)) return;
    drag = { x: e.clientX, y: e.clientY, p, i, moved: false };
    onhold?.(true, i);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function moveDrag(e) {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX;
    drag.y = e.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
    onnudge?.(axisDeltaMm(drag.p, drag.i, dx, dy), drag.p, drag.i);
  }
  function up() {
    if (!drag) return;
    suppressClick = drag.moved;
    onhold?.(false, drag.i);
    drag = null;
  }
  function open(i) {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    app.fsIndex = i;
    app.fsOpen = true;
  }
</script>

<div class="relative">
  <!-- one sheet per row -->
  <div class="flex flex-col items-center gap-6">
    {#each pages as p, i (p)}
      <div class="text-center {i === idx ? '' : 'hidden sm:block'}">
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="tooltip {draggable(p) ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}"
          style="touch-action: {screenAxisY(p, i) ? 'pan-x' : 'pan-y'}"
          data-tip={t('tip.sheet')}
          role="button"
          aria-label="{captions[i]} — {t('tip.sheet')}"
          tabindex="0"
          onpointerdown={e => down(e, p, i)}
          onpointermove={moveDrag}
          onpointerup={up}
          onpointercancel={up}
          onclick={() => open(i)}
          onkeydown={e => (e.key === 'Enter' || e.key === ' ') && open(i)}
        >
          <canvas use:register={p} class="border border-base-300 bg-white block mx-auto"></canvas>
        </div>
        <!-- rotation affects the preview only, never the generated PDFs -->
        <div class="flex items-center justify-center gap-2 mt-1">
          <button class="btn btn-xs btn-ghost border border-base-300 tooltip"
                  data-tip={t('tip.rotateLeft')} aria-label={t('tip.rotateLeft')}
                  onclick={() => rotate(i, -90)}><RotateIcon dir="ccw" /></button>
          <span class="text-[11px] opacity-60">{captions[i]}</span>
          <button class="btn btn-xs btn-ghost border border-base-300 tooltip"
                  data-tip={t('tip.rotateRight')} aria-label={t('tip.rotateRight')}
                  onclick={() => rotate(i, 90)}><RotateIcon dir="cw" /></button>
        </div>
      </div>
    {/each}
  </div>

  {#if pages.length > 1}
    <!-- no tooltip class here: app.css's unlayered .btn.tooltip display rule
         would defeat sm:hidden and show these arrows on desktop -->
    <button class="sm:hidden btn btn-sm btn-circle absolute left-1 top-1/2 -translate-y-1/2 z-10"
            aria-label={t('tip.prevSheet')}
            onclick={() => (idx = (idx - 1 + pages.length) % pages.length)}>‹</button>
    <button class="sm:hidden btn btn-sm btn-circle absolute right-1 top-1/2 -translate-y-1/2 z-10"
            aria-label={t('tip.nextSheet')}
            onclick={() => (idx = (idx + 1) % pages.length)}>›</button>
    <div class="sm:hidden text-center text-xs opacity-60 mt-1">{idx + 1} / {pages.length}</div>
  {/if}
</div>
