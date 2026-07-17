<script>
  import { fly } from 'svelte/transition';
  import { app, restart } from './lib/state.svelte.js';
  import { getRoute, go } from './lib/router.svelte.js';
  import { t } from './i18n/index.svelte.js';
  import LanguagePicker from './components/LanguagePicker.svelte';
  import StepsNav from './components/StepsNav.svelte';
  import Home from './components/Home.svelte';
  import Step1Gifs from './components/Step1Gifs.svelte';
  import Step2Frames from './components/Step2Frames.svelte';
  import Step3Paper from './components/Step3Paper.svelte';

  let theme = $state(localStorage.getItem('theme') || 'dark');
  $effect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  });

  /* Recolor instantly on theme switch: without this, color transitions (like
     the stepper's staggered ones) animate between the two palettes. */
  function setTheme(next) {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    theme = next;
    setTimeout(() => root.classList.remove('theme-switching'), 120);
  }

  /* Work in progress = loaded GIFs. The K link asks for confirmation first
     (same restart modal), and leaving/reloading the page warns natively. */
  let goHomeAfterRestart = $state(false);
  function guardHomeLink(e) {
    if (getRoute() === 'create' && app.gifs.length) {
      e.preventDefault();
      goHomeAfterRestart = true;
      app.confirmRestart = true;
    }
  }
  function confirmRestartAction() {
    restart();
    if (goHomeAfterRestart) {
      goHomeAfterRestart = false;
      go('home');
    }
  }
  function cancelRestart() {
    app.confirmRestart = false;
    goHomeAfterRestart = false;
  }
  $effect(() => {
    const warn = e => {
      if (app.gifs.length) {
        e.preventDefault();
        e.returnValue = ''; // required by Chromium for the native prompt
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  });
</script>

<!-- overflow-x-clip (not hidden): clips the step fly animation without
     creating a scroll container, so position: sticky keeps working -->
<div class="max-w-6xl mx-auto px-6 pb-6 overflow-x-clip">
  <div class="sticky top-0 z-40 bg-base-100 pt-6 pb-3">
  <header class="flex items-start gap-3 mb-4">
    <a href="#/" aria-label={t('app.title')} class="shrink-0" onclick={guardHomeLink}>
      <img src="/favicon.svg" alt="" class="w-9 h-9 mt-1" />
    </a>
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
        onchange={e => setTheme(e.target.checked ? 'light' : 'dark')}
      />
      <span class="swap-on">☀️</span>
      <span class="swap-off">🌙</span>
    </label>
  </header>

  {#if getRoute() === 'create'}
    <StepsNav />
  {/if}
  </div>

  <main>
    {#if getRoute() === 'home'}
      <Home />
    {:else}
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
    {/if}
  </main>
</div>

{#if app.confirmRestart}
  <div class="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="restart-title">
    <div class="modal-box">
      <h3 id="restart-title" class="font-bold text-lg">{t('restart.title')}</h3>
      <p class="py-3 text-sm opacity-80">{t('restart.body')}</p>
      <!-- No tooltips here: their hidden :before boxes overflow the modal-box
           and trigger a horizontal scrollbar; the labels speak for themselves. -->
      <div class="modal-action">
        <button class="btn btn-sm" onclick={cancelRestart}>
          {t('restart.cancel')}
        </button>
        <button class="btn btn-sm btn-error" onclick={confirmRestartAction}>
          {t('common.restart')}
        </button>
      </div>
    </div>
    <button
      class="modal-backdrop"
      aria-label={t('restart.cancel')}
      onclick={cancelRestart}
    ></button>
  </div>
{/if}
