import { mount } from 'svelte';
import './app.css';
import { initI18n } from './i18n/index.svelte.js';
import App from './App.svelte';

initI18n().then(() => {
  mount(App, { target: document.getElementById('app') });
});
