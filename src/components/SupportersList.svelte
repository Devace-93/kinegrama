<script>
  /* pay.js supporters list (payments.3m4.net, CONTRACT.md §10,
     data-kind="supporters"): the `kinegram` app's opted-in donors plus every
     public GitHub sponsor, rendered as a row of chips under a title. Like
     DonateButton.svelte, the tag is inserted here (not in index.html) because
     pay.js mounts right when it runs and the footer only exists once the app
     is mounted. The list is public (not gated) and renders nothing while it is
     empty, hence `empty:hidden` so the footer keeps its shape.
     The title: `data-label` is set from `support.supporters` now, and the i18n
     apply() hook rewrites it (via data-i18n-label) on every language change;
     pay.js re-renders the title when <html lang> changes. */
  import { untrack } from 'svelte';
  import { t } from '../i18n/index.svelte.js';

  /** @type {{ id?: string, class?: string, limit?: number }} */
  let { id = 'supporters', class: cls = '', limit = 24 } = $props();

  let host = $state(null);

  $effect(() => {
    if (!host) return;
    const s = document.createElement('script');
    s.src = `${import.meta.env.VITE_PAYMENTS_URL}/pay.js`;
    s.async = true;
    Object.assign(s.dataset, {
      app: 'kinegram',
      kind: 'supporters',
      limit: String(limit),
      // untrack: the language is applied through data-label later, never by
      // re-running this effect (that would insert a second list).
      label: untrack(() => t('support.supporters')),
      i18nLabel: 'support.supporters',
      mount: `#${id}`,
    });
    host.appendChild(s);
    return () => host.replaceChildren();
  });
</script>

<div bind:this={host} {id} class="empty:hidden {cls}"></div>
