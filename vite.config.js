import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

// Default so builds without any env produce the canonical production output.
// Makes both %VITE_SITE_URL% (index.html) and import.meta.env.VITE_SITE_URL
// always defined.
process.env.VITE_SITE_URL ??= 'https://kinegram.3m4.net';

export default defineConfig({
  // Served at the root of the custom domain kinegram.3m4.net
  base: '/',
  plugins: [svelte(), tailwindcss()],
});
