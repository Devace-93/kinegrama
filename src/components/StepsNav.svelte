<script>
  import { app, goStep, defaultSelections, selectionsValid } from '../lib/state.svelte.js';
  import { t } from '../i18n/index.svelte.js';

  // A step is clickable when everything it needs is already in place.
  const ready = $derived([
    true,
    app.gifs.length >= 1,
    app.gifs.length >= 1 && selectionsValid(),
  ]);

  function clickStep(s) {
    if (s === app.step || !ready[s - 1]) return;
    if (s >= 2) defaultSelections();
    goStep(s);
  }

  // Sequenced animation: forward = the bar fills first, then the circle
  // colors; backward = the circle fades first, then the bar empties.
  const barDelay = $derived(app.dir > 0 ? '0s' : '0.2s');
  const circleDelay = $derived(app.dir > 0 ? '0.35s' : '0s');
</script>

<nav class="flex items-start w-full" aria-label={t('tip.steps')}>
  {#each [1, 2, 3] as s, i}
    {#if i > 0}
      <div class="flex-1 h-1 bg-base-300 rounded mt-[14px] mx-2 overflow-hidden">
        <div
          class="h-full bg-primary transition-[width] duration-[350ms] ease-in-out"
          style="width: {app.step > s - 1 ? 100 : 0}%; transition-delay: {barDelay};"
        ></div>
      </div>
    {/if}
    <!-- aria-disabled (not disabled) so the tooltip still shows on hover;
         clickStep() already ignores steps that aren't ready -->
    <button
      type="button"
      class="flex flex-col items-center gap-1 tooltip tooltip-bottom {ready[s - 1] ? 'cursor-pointer' : 'cursor-not-allowed'}"
      data-tip={ready[s - 1] ? t('tip.stepGo', { name: t(`steps.s${s}`) }) : t('tip.stepLocked')}
      aria-disabled={!ready[s - 1]}
      aria-current={s === app.step ? 'step' : undefined}
      onclick={() => clickStep(s)}
    >
      <span
        class="step-circle w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
               transition-colors duration-200
               {s <= app.step
                 ? 'bg-primary text-primary-content active'
                 : ready[s - 1]
                   ? 'bg-base-300 text-base-content hover:bg-base-content/20'
                   : 'bg-base-300 text-base-content/30'}"
        style="transition-delay: {circleDelay}; animation-delay: {circleDelay};"
      >{s}</span>
      <span class="text-sm transition-opacity duration-200
                   {s === app.step ? 'font-semibold' : ready[s - 1] ? 'opacity-80' : 'opacity-40'}">
        {t(`steps.s${s}`)}
      </span>
    </button>
  {/each}
</nav>
