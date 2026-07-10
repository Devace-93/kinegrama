<script>
  import { app } from '../lib/state.svelte.js';
  import { t } from '../i18n/index.svelte.js';
</script>

<ul class="steps w-full mb-4">
  {#each [1, 2, 3] as s}
    <li class="step" class:step-primary={app.step >= s}>{t(`steps.s${s}`)}</li>
  {/each}
</ul>
