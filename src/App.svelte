<script>
  import { fly } from 'svelte/transition';
  import { app, restart } from './lib/state.svelte.js';
  import { t } from './i18n/index.svelte.js';
  import LanguagePicker from './components/LanguagePicker.svelte';
  import StepsNav from './components/StepsNav.svelte';
  import Step1Gifs from './components/Step1Gifs.svelte';
  import Step2Frames from './components/Step2Frames.svelte';
  import Step3Paper from './components/Step3Paper.svelte';

  let theme = $state(localStorage.getItem('theme') || 'dark');
  $effect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  });
</script>

<!-- overflow-x-clip (not hidden): clips the step fly animation without
     creating a scroll container, so position: sticky keeps working -->
<div class="max-w-6xl mx-auto px-6 pb-6 overflow-x-clip">
  <div class="sticky top-0 z-40 bg-base-100 pt-6 pb-3">
  <header class="flex items-start gap-3 mb-4">
    <img src="/favicon.svg" alt="" class="w-9 h-9 mt-1" />
    <div class="flex-1 min-w-0">
      <h1 class="text-2xl font-bold">{t('app.title')}</h1>
      <p class="text-sm opacity-70">{t('app.subtitle')}</p>
    </div>
    <LanguagePicker />
    <label
      class="swap swap-rotate btn btn-sm btn-ghost text-lg tooltip tooltip-left"
      data-tip={t('tip.theme')}
      aria-label={t('tip.theme')}
    >
      <input
        type="checkbox"
        checked={theme === 'light'}
        onchange={e => (theme = e.target.checked ? 'light' : 'dark')}
      />
      <span class="swap-on">☀️</span>
      <span class="swap-off">🌙</span>
    </label>
  </header>

  <StepsNav />
  </div>

  <main>
    {#key app.step}
      <div in:fly={{ x: 56 * app.dir, duration: 280, opacity: 0 }}>
        {#if app.step === 1}
          <Step1Gifs />
        {:else if app.step === 2}
          <Step2Frames />
        {:else}
          <Step3Paper />
        {/if}
      </div>
    {/key}
  </main>
</div>

{#if app.confirmRestart}
  <div class="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="restart-title">
    <div class="modal-box">
      <h3 id="restart-title" class="font-bold text-lg">{t('restart.title')}</h3>
      <p class="py-3 text-sm opacity-80">{t('restart.body')}</p>
      <div class="modal-action">
        <button class="btn btn-sm tooltip" data-tip={t('tip.cancel')}
                onclick={() => (app.confirmRestart = false)}>
          {t('restart.cancel')}
        </button>
        <button class="btn btn-sm btn-error tooltip" data-tip={t('tip.restart')} onclick={restart}>
          {t('common.restart')}
        </button>
      </div>
    </div>
    <button
      class="modal-backdrop"
      aria-label={t('restart.cancel')}
      onclick={() => (app.confirmRestart = false)}
    ></button>
  </div>
{/if}
