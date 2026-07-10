<script>
  import { app } from '../lib/state.svelte.js';

  let { pages, ppm, captions } = $props();

  // Registers the sheet canvas: Step3Paper's loop repaints it every frame.
  function register(node, p) {
    node.width = Math.round(p.pw * ppm);
    node.height = Math.round(p.ph * ppm);
    p.canvas = node;
  }
</script>

<div class="flex flex-wrap gap-4">
  {#each pages as p, i (p)}
    <div
      class="text-center cursor-pointer"
      role="button"
      tabindex="0"
      onclick={() => { app.fsIndex = i; app.fsOpen = true; }}
      onkeydown={e => (e.key === 'Enter' || e.key === ' ') && (app.fsIndex = i, app.fsOpen = true)}
    >
      <canvas use:register={p} class="border border-base-300 bg-white block"></canvas>
      <div class="text-[11px] opacity-60 mt-1">{captions[i]}</div>
    </div>
  {/each}
</div>
