import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Servido en la raíz del dominio propio kinegram.3m4.net
  base: '/',
  plugins: [svelte(), tailwindcss()],
});
