<script>
  /* pay.js donate button (payments.3m4.net, CONTRACT.md §10). The tag cannot
     live in index.html like session.js: pay.js mounts once, right when it runs,
     and this header/footer only exists after the app is mounted. So each
     instance inserts its own <script> tag here, with `data-mount` pointing at
     its own element; every tag shares one window.m4pay. The portal gates
     donations per viewer (rollout flag) and simply never mounts the button when
     they are off, hence `empty:hidden` so nothing shifts.
     The label: `data-label` is set from `support.donate` now, and the i18n
     apply() hook rewrites it (via data-i18n-label) on every language change;
     pay.js re-renders when <html lang> changes. The static sites report under
     the `info` app until a `kinegram` app is registered. */
  import { untrack } from 'svelte';
  import { t } from '../i18n/index.svelte.js';

  /** @type {{ id: string, class?: string }} */
  let { id, class: cls = '' } = $props();

  let host = $state(null);

  $effect(() => {
    if (!host) return;
    const s = document.createElement('script');
    s.src = `${import.meta.env.VITE_PAYMENTS_URL}/pay.js`;
    s.async = true;
    Object.assign(s.dataset, {
      app: 'info',
      kind: 'donate',
      currency: 'usd',
      amount: '500',
      // untrack: the language is applied through data-label later, never by
      // re-running this effect (that would insert a second button).
      label: untrack(() => t('support.donate')),
      i18nLabel: 'support.donate',
      mount: `#${id}`,
    });
    host.appendChild(s);
    return () => host.replaceChildren();
  });
</script>

<div bind:this={host} {id} class="empty:hidden {cls}"></div>
