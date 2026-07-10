<script>
  import { app, goStep, defaultSelections } from '../lib/state.svelte.js';
  import { decodeGifFile } from '../lib/gif.js';
  import { t } from '../i18n/index.svelte.js';

  let fileInput;
  let over = $state(false);
  let status = $state({ key: 'step1.dropHint' });

  async function addFiles(files) {
    const gifsOnly = [...files].filter(f => f.type === 'image/gif');
    if (!gifsOnly.length) return;
    status = { key: 'step1.decoding' };
    let error = null;
    for (const file of gifsOnly) {
      try {
        const frames = await decodeGifFile(file);
        app.gifs.push({
          name: file.name,
          frames,
          w: frames[0].width,
          h: frames[0].height,
          selection: [],
          url: URL.createObjectURL(file), // native animated thumbnail
        });
      } catch (err) {
        error = err.code === 'single-frame'
          ? { key: 'step1.singleFrame', params: { name: err.gifName } }
          : { key: 'step1.error', params: { msg: err.message } };
      }
    }
    status = error || { key: 'step1.loaded', params: { n: app.gifs.length } };
  }

  function removeGif(i) {
    URL.revokeObjectURL(app.gifs[i].url);
    app.gifs.splice(i, 1);
  }

  function next() {
    defaultSelections();
    goStep(2);
  }
</script>

<section class="card bg-base-200 border border-base-300 p-4">
  <h2 class="font-semibold mb-3">{t('step1.title')}</h2>

  <div class="collapse collapse-arrow bg-base-100 border border-base-300 mb-3">
    <input type="checkbox" />
    <div class="collapse-title font-medium text-sm">{t('step1.aboutTitle')}</div>
    <div class="collapse-content text-sm opacity-80">
      <p>{t('step1.aboutBody')}</p>
    </div>
  </div>

  <div
    class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
           {over ? 'border-primary bg-base-100' : 'border-base-300'}"
    role="button"
    tabindex="0"
    onclick={() => fileInput.click()}
    onkeydown={e => (e.key === 'Enter' || e.key === ' ') && fileInput.click()}
    ondragover={e => { e.preventDefault(); over = true; }}
    ondragleave={() => (over = false)}
    ondrop={e => { e.preventDefault(); over = false; addFiles(e.dataTransfer.files); }}
  >
    <strong>{t('step1.dropTitle')}</strong><br />
    <span class="text-sm opacity-70">{t(status.key, status.params)}</span>
  </div>
  <input
    type="file"
    accept="image/gif"
    multiple
    class="hidden"
    bind:this={fileInput}
    onchange={e => { addFiles(e.target.files); e.target.value = ''; }}
  />

  {#if app.gifs.length}
    <div class="flex flex-wrap gap-3 mt-4">
      {#each app.gifs as g, i (g.url)}
        <div class="card bg-base-100 border border-base-300 p-2 w-40 gap-1.5">
          <img src={g.url} alt={g.name} class="rounded bg-black w-full" />
          <div class="text-xs truncate" title={g.name}>{g.name}</div>
          <div class="text-[11px] opacity-60">
            {t('step1.meta', { w: g.w, h: g.h, n: g.frames.length })}
          </div>
          <button class="btn btn-xs btn-outline btn-error" onclick={() => removeGif(i)}>
            {t('step1.remove')}
          </button>
        </div>
      {/each}
    </div>
  {/if}

  <div class="flex gap-2 mt-4 pt-3 border-t border-base-300 sticky bottom-0 z-10 bg-base-200 -mx-4 px-4 -mb-4 pb-4 rounded-b-2xl">
    {#if app.gifs.length}
      <button class="btn btn-sm btn-outline btn-error" onclick={() => (app.confirmRestart = true)}>
        {t('common.restart')}
      </button>
    {/if}
    <div class="flex-1"></div>
    <button class="btn btn-sm btn-primary" disabled={app.gifs.length < 1} onclick={next}>
      {t('common.next')}
    </button>
  </div>
</section>
