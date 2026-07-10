import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Servido en GitHub Pages bajo /kinegrama/
  base: '/kinegrama/',
  plugins: [svelte(), tailwindcss()],
});
