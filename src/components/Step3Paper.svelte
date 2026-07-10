<script>
  import { app, goStep, getLayout } from '../lib/state.svelte.js';
  import { buildPages, renderPage } from '../lib/preview.js';
  import { pdfKinegrams, pdfBarrier } from '../lib/pdf.js';
  import { t } from '../i18n/index.svelte.js';
  import PagesPreview from './PagesPreview.svelte';
  import FullscreenViewer from './FullscreenViewer.svelte';

  const PREVIEW_H = 260; // page height in px for the thumbnails

  const layout = $derived(getLayout());
  const pages = $derived(buildPages(app.gifs, layout));
  const ppm = $derived(PREVIEW_H / Math.max(layout.paper.w, layout.paper.h));
  const captions = $derived(pages.map((p, i) =>
    p.isBarrier
      ? t('step3.sheetBarrier', { n: i + 1 })
      : t('step3.sheetGif', { n: i + 1, name: p.gifName }) + (p.rotated ? t('step3.rotated') : '')
  ));

  let fsCanvas = $state(null);

  $effect(() => {
    if (app.fsIndex >= pages.length) app.fsIndex = 0;
  });

  // Animation loop: repaints thumbnails and the fullscreen viewer every frame.
  $effect(() => {
    const pgs = pages;
    const lay = layout;
    const scale = ppm;
    let offsetMm = 0;
    let last = performance.now();
    let id;
    function tick(now) {
      const speed = parseInt(app.speed, 10) || 15; // image px per second
      if (app.animate) offsetMm += speed * lay.mmpp * (now - last) / 1000;
      last = now;
      for (const p of pgs) {
        if (p.canvas) renderPage(p.canvas, p, scale, offsetMm, app.animate, lay);
      }
      if (app.fsOpen && fsCanvas && pgs[app.fsIndex]) {
        const p = pgs[app.fsIndex];
        const fppm = Math.min((innerWidth - 150) / p.pw, (innerHeight - 90) / p.ph);
        const w = Math.round(p.pw * fppm), h = Math.round(p.ph * fppm);
        if (fsCanvas.width !== w) fsCanvas.width = w;
        if (fsCanvas.height !== h) fsCanvas.height = h;
        renderPage(fsCanvas, p, fppm, offsetMm, app.animate, lay);
      }
      id = requestAnimationFrame(tick);
    }
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  });
</script>

<section class="card bg-base-200 border border-base-300 p-4">
  <h2 class="font-semibold mb-3">{t('step3.title')}</h2>

  <div class="flex flex-wrap gap-5 items-start">
    <div class="w-72 flex flex-col gap-3">
      <label class="text-sm opacity-80 flex flex-col gap-1">
        {t('step3.paper')}
        <select class="select select-sm" bind:value={app.paperKey}>
          <option value="carta">{t('step3.paperCarta')}</option>
          <option value="oficio">{t('step3.paperOficio')}</option>
          <option value="a4">{t('step3.paperA4')}</option>
          <option value="custom">{t('step3.paperCustom')}</option>
        </select>
      </label>

      {#if app.paperKey === 'custom'}
        <div class="flex items-center gap-2 text-sm">
          <input type="number" class="input input-sm w-20" min="50" max="2000" bind:value={app.customW} />
          ×
          <input type="number" class="input input-sm w-20" min="50" max="2000" bind:value={app.customH} />
          mm
        </div>
      {/if}

      <label class="text-sm opacity-80 flex items-center gap-2">
        {t('step3.strip')}
        <input type="number" class="input input-sm w-20" min="1" max="20" bind:value={app.strip} />
      </label>

      <label class="text-sm opacity-80 flex items-center gap-2">
        <input type="checkbox" class="checkbox checkbox-sm checkbox-primary" bind:checked={app.animate} />
        {t('step3.animate')}
      </label>

      <label class="text-sm opacity-80 flex items-center gap-2">
        {t('step3.speed')}
        <input type="range" class="range range-sm range-primary" min="1" max="60" bind:value={app.speed} />
      </label>

      <div class="text-xs opacity-70 bg-base-100 border border-base-300 rounded-lg p-2.5 leading-relaxed">
        {t('step3.infoSheets', { gifs: app.gifs.length })}<br />
        {t('step3.infoScale', { mmpp: layout.mmpp.toFixed(3) })}<br />
        {t('step3.infoStrip', {
          strip: (layout.strip * layout.mmpp).toFixed(2),
          cycle: (layout.N * layout.strip * layout.mmpp).toFixed(2),
        })}<br />
        {t('step3.infoPrint')}
      </div>

      <button class="btn btn-sm btn-primary" onclick={() => pdfKinegrams(app.gifs, layout)}>
        {t('step3.pdfKinegrams')}
      </button>
      <button class="btn btn-sm btn-primary" onclick={() => pdfBarrier(layout)}>
        {t('step3.pdfBarrier')}
      </button>
    </div>

    <div class="flex-1 min-w-[300px]">
      <div class="flex items-center gap-2 mb-2">
        <button class="btn btn-sm btn-ghost border border-base-300"
                onclick={() => { app.fsIndex = 0; app.fsOpen = true; }}>
          {t('step3.fullscreen')}
        </button>
        <span class="text-sm opacity-70">{t('step3.clickAnySheet')}</span>
      </div>
      <PagesPreview {pages} {ppm} {captions} />
    </div>
  </div>

  <div class="flex gap-2 mt-4 pt-3 border-t border-base-300 sticky bottom-0 z-10 bg-base-200 -mx-4 px-4 -mb-4 pb-4 rounded-b-2xl">
    <button class="btn btn-sm btn-outline btn-error" onclick={() => (app.confirmRestart = true)}>
      {t('common.restart')}
    </button>
    <div class="flex-1"></div>
    <button class="btn btn-sm btn-ghost border border-base-300" onclick={() => goStep(2)}>
      {t('common.prev')}
    </button>
  </div>
</section>

{#if app.fsOpen}
  <FullscreenViewer bind:canvas={fsCanvas} {captions} count={pages.length} />
{/if}
