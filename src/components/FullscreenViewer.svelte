<script>
  import { app } from '../lib/state.svelte.js';
  import { t } from '../i18n/index.svelte.js';

  let { canvas = $bindable(null), captions, count } = $props();

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
</script>

<svelte:window {onkeydown} />

<!-- Overlay siempre oscuro: colores fijos para conservar contraste en ambos temas -->
<div class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center gap-3.5">
  <div class="absolute top-0 left-0 right-0 flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200">
    <span>{app.fsIndex + 1} / {count} — {captions[app.fsIndex]}</span>
    <div class="flex-1"></div>
    <button class="btn btn-sm bg-transparent text-gray-200 border-gray-500 hover:bg-white/10 hover:border-gray-300 shadow-none" onclick={close}>
      {t('step3.close')}
    </button>
  </div>
  <button class="btn btn-lg bg-transparent text-gray-200 border-gray-500 hover:bg-white/10 hover:border-gray-300 shadow-none text-2xl" onclick={() => move(-1)}>‹</button>
  <canvas bind:this={canvas} class="bg-white shadow-2xl"></canvas>
  <button class="btn btn-lg bg-transparent text-gray-200 border-gray-500 hover:bg-white/10 hover:border-gray-300 shadow-none text-2xl" onclick={() => move(1)}>›</button>
</div>
