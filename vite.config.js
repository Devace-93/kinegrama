import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Served at the root of the custom domain kinegram.3m4.net
  base: '/',
  plugins: [svelte(), tailwindcss()],
});
