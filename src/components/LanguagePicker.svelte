<script>
  import { t, getLang, setLang, LOCALES } from '../i18n/index.svelte.js';

  let open = $state(false);
  let query = $state('');
  let inputEl = $state(null);

  // Accent-insensitive match on name and code ("mex", "espanol", "pt-br"…)
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const filtered = $derived(
    LOCALES.filter(l => norm(`${l.name} ${l.code} ${l.alias}`).includes(norm(query)))
  );
  const current = $derived(LOCALES.find(l => l.code === getLang()));

  function pick(code) {
    setLang(code);
    open = false;
    query = '';
  }

  $effect(() => {
    if (open && inputEl) inputEl.focus();
  });
</script>

<div class="relative">
  <button
    type="button"
    class="btn btn-sm gap-1.5 font-normal tooltip tooltip-bottom"
    data-tip={t('tip.language')}
    aria-label={t('tip.language')}
    aria-haspopup="listbox"
    aria-expanded={open}
    onclick={() => { open = !open; query = ''; }}
  >
    <span>{current?.flag}</span>
    <!-- On narrow screens only the flag fits; the full name would crush the title -->
    <span class="max-w-40 truncate hidden sm:inline">{current?.name}</span>
    <span class="opacity-60 text-xs">▾</span>
  </button>

  {#if open}
    <button
      type="button"
      class="fixed inset-0 z-40 cursor-default"
      aria-label={t('tip.close')}
      tabindex="-1"
      onclick={() => { open = false; query = ''; }}
    ></button>
    <div class="absolute end-0 mt-1 z-50 w-72 bg-base-100 border border-base-300 rounded-xl shadow-xl p-2">
      <input
        bind:this={inputEl}
        bind:value={query}
        type="search"
        placeholder={t('common.search')}
        aria-label={t('common.search')}
        class="input input-sm w-full mb-2"
        onkeydown={e => {
          if (e.key === 'Escape') { open = false; query = ''; }
          else if (e.key === 'Enter' && filtered.length) pick(filtered[0].code);
        }}
      />
      <ul class="max-h-72 overflow-y-auto" role="listbox" aria-label={t('tip.language')}>
        {#each filtered as l (l.code)}
          <li role="none">
            <!-- Native title: a CSS tooltip would be clipped by the scroll container -->
            <button
              type="button"
              role="option"
              aria-selected={l.code === getLang()}
              title={`${t('tip.language')}: ${l.name}`}
              class="w-full text-start px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer
                     {l.code === getLang() ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}"
              onclick={() => pick(l.code)}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          </li>
        {:else}
          <li class="px-3 py-2 text-sm opacity-60">—</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
