<script>
  import { t } from '../i18n/index.svelte.js';
  import { go } from '../lib/router.svelte.js';
  import KinegramDemo from './KinegramDemo.svelte';
</script>

<!-- No card chrome: the intro reads at the same level as the header;
     the section only bounds the content width via the page container. -->
<section>
  <h2 class="font-semibold mb-2">{t('step1.aboutTitle')}</h2>
  <p class="text-sm opacity-80">{t('step1.aboutBody')}</p>

  <div class="my-4 flex justify-center">
    <button class="btn btn-primary btn-wide" onclick={() => go('create')}>
      {t('home.start')}
    </button>
  </div>

  <KinegramDemo />
</section>
