<script>
  // Quarter-circle curved arrow, mirrored for counter-clockwise.
  let { dir = 'cw' } = $props();
</script>

<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor"
     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  {#if dir === 'cw'}
    <path d="M 8 3 A 5 5 0 0 1 13 8" />
    <path d="M 10.6 6.2 L 13 9.4 L 15.4 6.2" />
  {:else}
    <path d="M 8 3 A 5 5 0 0 0 3 8" />
    <path d="M 0.6 6.2 L 3 9.4 L 5.4 6.2" />
  {/if}
</svg>
