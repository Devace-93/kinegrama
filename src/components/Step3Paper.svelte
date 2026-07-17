<script>
  import { app, goStep, getLayout, SPEED_DEFAULT, SPEED_MIN, SPEED_MAX } from '../lib/state.svelte.js';
  import { buildPages, renderPage, travelMm } from '../lib/preview.js';
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

  // Per-sheet sweep (phase 0 = sheet resting past the right/bottom edge, 1 =
  // past the left/top edge), bouncing like the home demo. Hand-dragging a
  // preview pauses and moves only that sheet's grid; the drag isn't clamped
  // to the sweep range — on release the sheet glides back at sweep speed.
  let sweeps = [];
  let heldIdx = null;
  const sweepOf = i => (sweeps[i] ??= { phase: 0, dirn: 1 });
  const nudgeGrid = (mm, p, i) => {
    // The sheet may leave the sweep range, up to fully off the page (still
    // clipped by it); the bound keeps the walk back reasonably short.
    const s = sweepOf(i);
    const axisLen = p.rotated ? p.hmm : p.wmm;
    const pageLen = p.rotated ? p.ph : p.pw;
    const travel = travelMm(p);
    const rest = (p.rotated ? p.dymm : p.dxmm) + 1.075 * axisLen; // sheet pos at phase 0
    const lo = (rest - pageLen) / travel;    // fully past the page's end
    const hi = (rest + 1.5 * axisLen) / travel; // fully past the page's start
    s.phase = Math.min(hi, Math.max(lo, s.phase - mm / travel));
  };
  const holdGrid = (held, i) => {
    heldIdx = held ? i : null;
  };

  $effect(() => {
    if (app.fsIndex >= pages.length) app.fsIndex = 0;
  });

  // Animation loop: repaints thumbnails and the fullscreen viewer every frame.
  $effect(() => {
    const pgs = pages;
    const lay = layout;
    const scale = ppm;
    let last = performance.now();
    let id;
    function tick(now) {
      // default = the home demo's tempo, 15 s per direction; 6–18 ≈ 0.5×–1.5×
      const D = 15000 * SPEED_DEFAULT / (+app.speed || SPEED_DEFAULT);
      const dt = now - last;
      last = now;
      for (let i = 0; i < pgs.length; i++) {
        const p = pgs[i];
        if (!p.canvas) continue;
        const s = sweepOf(i);
        if (app.animate && heldIdx !== i && !p.isBarrier) {
          // turning around at the ends also walks back sheets dragged
          // beyond the sweep range (hurried, so the wait stays short)
          if (s.dirn > 0 && s.phase >= 1) s.dirn = -1;
          else if (s.dirn < 0 && s.phase <= 0) s.dirn = 1;
          const boost = s.phase < 0 || s.phase > 1 ? 3 : 1;
          s.phase += s.dirn * boost * dt / D;
        }
        const rot = app.previewRot[i] || 0;
        const swap = rot % 180 !== 0;
        const w = Math.round((swap ? p.ph : p.pw) * scale);
        const h = Math.round((swap ? p.pw : p.ph) * scale);
        if (p.canvas.width !== w) p.canvas.width = w;
        if (p.canvas.height !== h) p.canvas.height = h;
        renderPage(p.canvas, p, scale, s.phase, app.animate, lay, rot);
      }
      if (app.fsOpen && fsCanvas && pgs[app.fsIndex]) {
        const p = pgs[app.fsIndex];
        const rot = app.previewRot[app.fsIndex] || 0;
        const swap = rot % 180 !== 0;
        const cw = swap ? p.ph : p.pw, ch = swap ? p.pw : p.ph;
        const fppm = Math.min((innerWidth - 150) / cw, (innerHeight - 150) / ch);
        const w = Math.round(cw * fppm), h = Math.round(ch * fppm);
        if (fsCanvas.width !== w) fsCanvas.width = w;
        if (fsCanvas.height !== h) fsCanvas.height = h;
        renderPage(fsCanvas, p, fppm, sweepOf(app.fsIndex).phase, app.animate, lay, rot);
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
      <label class="text-sm opacity-80 flex flex-col gap-1 tooltip" data-tip={t('tip.paper')}>
        {t('step3.paper')}
        <select class="select select-sm" bind:value={app.paperKey}>
          <option value="carta">{t('step3.paperCarta')}</option>
          <option value="oficio">{t('step3.paperOficio')}</option>
          <option value="a4">{t('step3.paperA4')}</option>
          <option value="custom">{t('step3.paperCustom')}</option>
        </select>
      </label>

      {#if app.paperKey === 'custom'}
        <div class="flex items-center gap-2 text-sm tooltip" data-tip={t('tip.customSize')}>
          <input type="number" class="input input-sm w-20" min="50" max="2000"
                 aria-label={t('tip.customSize')} bind:value={app.customW} />
          ×
          <input type="number" class="input input-sm w-20" min="50" max="2000"
                 aria-label={t('tip.customSize')} bind:value={app.customH} />
          mm
        </div>
      {/if}

      <label class="text-sm opacity-80 flex items-center gap-2 tooltip" data-tip={t('tip.strip')}>
        {t('step3.strip')}
        <input type="range" class="range range-sm range-primary flex-1" min="1" max="4" step="1"
               bind:value={app.strip} />
        <span class="w-4 text-right">{app.strip}</span>
      </label>

      <label class="text-sm opacity-80 flex items-center gap-2 tooltip" data-tip={t('tip.animate')}>
        <input type="checkbox" class="checkbox checkbox-sm checkbox-primary" bind:checked={app.animate} />
        {t('step3.animate')}
      </label>

      <label class="text-sm opacity-80 flex items-center gap-2 tooltip" data-tip={t('tip.speed')}>
        {t('step3.speed')}
        <input type="range" class="range range-sm range-primary flex-1" min={SPEED_MIN} max={SPEED_MAX} step="1"
               bind:value={app.speed} />
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

      <button class="btn btn-sm btn-primary tooltip" data-tip={t('tip.pdfKinegrams')}
              onclick={() => pdfKinegrams(app.gifs, layout)}>
        {t('step3.pdfKinegrams')}
      </button>
      <button class="btn btn-sm btn-primary tooltip" data-tip={t('tip.pdfBarrier')}
              onclick={() => pdfBarrier(layout)}>
        {t('step3.pdfBarrier')}
      </button>
    </div>

    <div class="flex-1 min-w-[300px]">
      <div class="flex items-center gap-2 mb-2">
        <button class="btn btn-sm btn-ghost border border-base-300 tooltip" data-tip={t('tip.fullscreen')}
                onclick={() => { app.fsIndex = 0; app.fsOpen = true; }}>
          {t('step3.fullscreen')}
        </button>
        <span class="text-sm opacity-70">{t('step3.clickAnySheet')}</span>
      </div>
      <PagesPreview {pages} {ppm} {captions} onnudge={nudgeGrid} onhold={holdGrid} />
    </div>
  </div>

  <div class="flex flex-col gap-2 mt-4 pt-3 border-t border-base-300 sticky bottom-0 z-10 bg-base-200 -mx-4 px-4 -mb-4 pb-4 rounded-b-2xl">
    <!-- On small viewports the controls column scrolls away; keep the
         animation controls at hand next to the navigation. -->
    <div class="sm:hidden flex items-center gap-3 text-sm opacity-80">
      <label class="flex items-center gap-2">
        <input type="checkbox" class="checkbox checkbox-sm checkbox-primary" bind:checked={app.animate} />
        {t('step3.animate')}
      </label>
      <label class="flex items-center gap-2 flex-1">
        {t('step3.speed')}
        <input type="range" class="range range-sm range-primary flex-1" min={SPEED_MIN} max={SPEED_MAX} step="1"
               bind:value={app.speed} />
      </label>
    </div>
    <div class="flex gap-2">
    <button class="btn btn-sm btn-outline btn-error tooltip" data-tip={t('tip.restart')}
            onclick={() => (app.confirmRestart = true)}>
      {t('common.restart')}
    </button>
    <div class="flex-1"></div>
    <button class="btn btn-sm btn-ghost border border-base-300 tooltip"
            data-tip={t('tip.stepGo', { name: t('steps.s2') })} onclick={() => goStep(2)}>
      {t('common.prev')}
    </button>
    </div>
  </div>
</section>

{#if app.fsOpen}
  <FullscreenViewer bind:canvas={fsCanvas} {captions} count={pages.length}
                    page={pages[app.fsIndex]} onnudge={nudgeGrid} onhold={holdGrid} />
{/if}
