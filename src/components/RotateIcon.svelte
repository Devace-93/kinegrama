<script>
  // Quarter-circle curved arrow, mirrored for counter-clockwise.
  let { dir = 'cw' } = $props();
</script>

<svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor"
     stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  {#if dir === 'cw'}
    <!-- right center up to top center -->
    <path d="M 13 8 A 5 5 0 0 0 8 3" />
    <path d="M 9.2 0.8 L 6.2 3 L 9.2 5.2" />
  {:else}
    <!-- left center up to top center -->
    <path d="M 3 8 A 5 5 0 0 1 8 3" />
    <path d="M 6.8 0.8 L 9.8 3 L 6.8 5.2" />
  {/if}
</svg>
