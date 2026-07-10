// i18n con i18next: es (default) + en, detección de navegador y selector manual.
import i18next from 'i18next';
import es from './es.json';
import en from './en.json';

const state = $state({ lang: 'es' });

export async function initI18n() {
  const saved = localStorage.getItem('lang');
  const browser = (navigator.language || 'es').slice(0, 2);
  const lng = saved || (browser === 'en' ? 'en' : 'es');
  await i18next.init({
    lng,
    fallbackLng: 'es',
    resources: { es: { translation: es }, en: { translation: en } },
    interpolation: { escapeValue: false },
  });
  state.lang = lng;
  document.documentElement.lang = lng;
}

/** Traducción reactiva: se reevalúa al cambiar de idioma. */
export function t(key, opts) {
  void state.lang; // dependencia reactiva
  return i18next.t(key, opts);
}

export function getLang() {
  return state.lang;
}

export async function setLang(lng) {
  await i18next.changeLanguage(lng);
  state.lang = lng;
  localStorage.setItem('lang', lng);
  document.documentElement.lang = lng;
}
