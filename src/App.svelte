<script>
  import { app } from './lib/state.svelte.js';
  import { t, getLang, setLang } from './i18n/index.svelte.js';
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

<div class="max-w-6xl mx-auto p-6">
  <header class="flex items-start gap-3 mb-4">
    <div class="flex-1 min-w-0">
      <h1 class="text-2xl font-bold">{t('app.title')}</h1>
      <p class="text-sm opacity-70">{t('app.subtitle')}</p>
    </div>
    <select
      class="select select-sm w-auto"
      aria-label="Language"
      value={getLang()}
      onchange={e => setLang(e.target.value)}
    >
      <option value="es">Español</option>
      <option value="en">English</option>
    </select>
    <label class="swap swap-rotate btn btn-sm btn-ghost text-lg" aria-label="Theme">
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

  {#if app.step === 1}
    <Step1Gifs />
  {:else if app.step === 2}
    <Step2Frames />
  {:else}
    <Step3Paper />
  {/if}
</div>
