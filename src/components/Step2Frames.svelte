<script>
  import { app, goStep, toggleFrame, maxFramesAllowed, selectionsValid } from '../lib/state.svelte.js';
  import { t } from '../i18n/index.svelte.js';

  const max = $derived(maxFramesAllowed());
  const counts = $derived(app.gifs.map(g => g.selection.length));
  const allEqual = $derived(counts.every(c => c === counts[0]));
  const ok = $derived(selectionsValid());

  // Frame thumbnail (~150px max width)
  function thumb(node, frame) {
    const scale = Math.min(1, 150 / frame.width);
    node.width = Math.round(frame.width * scale);
    node.height = Math.round(frame.height * scale);
    node.getContext('2d').drawImage(frame, 0, 0, node.width, node.height);
  }
</script>

<section class="card bg-base-200 border border-base-300 p-4">
  <h2 class="font-semibold mb-2">{t('step2.title')}</h2>

  <p class="text-sm opacity-70 mb-3">
    {t('step2.statusBase', { max })}
    {#if !allEqual}
      {t('step2.statusUnequal', { counts: counts.join(', ') })}
    {:else if counts[0] < 2}
      {t('step2.statusMin')}
    {:else}
      {t('step2.statusOk', { n: counts[0] })}
    {/if}
  </p>

  {#each app.gifs as g, gi (g.url)}
    <div class="mb-5">
      <h3 class="text-sm opacity-70 mb-2">{t('step2.gifTitle', { name: g.name, n: g.frames.length })}</h3>
      <div class="grid gap-2.5" style="grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));">
        {#each g.frames as frame, fi}
          {@const pos = g.selection.indexOf(fi)}
          <div
            class="frame-card"
            class:selected={pos >= 0}
            class:disabled={pos < 0 && g.selection.length >= max}
            role="button"
            tabindex="0"
            onclick={() => toggleFrame(gi, fi)}
            onkeydown={e => (e.key === 'Enter' || e.key === ' ') && toggleFrame(gi, fi)}
          >
            <canvas use:thumb={frame}></canvas>
            <span class="idx">#{fi + 1}</span>
            <span class="order">{pos >= 0 ? pos + 1 : ''}</span>
          </div>
        {/each}
      </div>
    </div>
  {/each}

  <div class="flex gap-2 mt-2 pt-3 border-t border-base-300 sticky bottom-0 z-10 bg-base-200 -mx-4 px-4 -mb-4 pb-4 rounded-b-2xl">
    <button class="btn btn-sm btn-outline btn-error" onclick={() => (app.confirmRestart = true)}>
      {t('common.restart')}
    </button>
    <div class="flex-1"></div>
    <button class="btn btn-sm btn-ghost border border-base-300" onclick={() => goStep(1)}>
      {t('common.prev')}
    </button>
    <button class="btn btn-sm btn-primary" disabled={!ok} onclick={() => goStep(3)}>
      {t('common.next')}
    </button>
  </div>
</section>
