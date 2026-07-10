// i18n with i18next: regional variants of Spanish and English.
// Base catalogs (es, en) hold every key; regional files override only what
// actually differs and fall back per-key to their base language.
import i18next from 'i18next';
import es from './es.json';
import en from './en.json';
import esES from './es-ES.json';
import esAR from './es-AR.json';
import esCO from './es-CO.json';
import enGB from './en-GB.json';

export const LOCALES = [
  { code: 'es-MX', flag: '🇲🇽', name: 'Español (México)' },
  { code: 'es-ES', flag: '🇪🇸', name: 'Español (España)' },
  { code: 'es-CO', flag: '🇨🇴', name: 'Español (Colombia)' },
  { code: 'es-AR', flag: '🇦🇷', name: 'Español (Argentina)' },
  { code: 'es-CL', flag: '🇨🇱', name: 'Español (Chile)' },
  { code: 'es-PE', flag: '🇵🇪', name: 'Español (Perú)' },
  { code: 'en-US', flag: '🇺🇸', name: 'English (US)' },
  { code: 'en-GB', flag: '🇬🇧', name: 'English (UK)' },
  { code: 'en-CA', flag: '🇨🇦', name: 'English (Canada)' },
  { code: 'en-AU', flag: '🇦🇺', name: 'English (Australia)' },
  { code: 'en-IN', flag: '🇮🇳', name: 'English (India)' },
];

const OVERRIDES = { 'es-ES': esES, 'es-AR': esAR, 'es-CO': esCO, 'en-GB': enGB };

const state = $state({ lang: 'es-MX' });

function resolveInitial() {
  const legacy = { es: 'es-MX', en: 'en-US' };
  const saved = localStorage.getItem('lang');
  const stored = legacy[saved] || saved;
  if (stored && LOCALES.some(l => l.code === stored)) return stored;
  const nav = navigator.language || 'es-MX';
  if (LOCALES.some(l => l.code === nav)) return nav;
  const base = nav.slice(0, 2);
  return (LOCALES.find(l => l.code.startsWith(base)) || LOCALES[0]).code;
}

function apply(lng) {
  state.lang = lng;
  document.documentElement.lang = lng;
  document.title = i18next.t('app.title'); // tab title follows the language
}

export async function initI18n() {
  const resources = { es: { translation: es }, en: { translation: en } };
  for (const [code, data] of Object.entries(OVERRIDES)) {
    resources[code] = { translation: data };
  }
  const lng = resolveInitial();
  await i18next.init({
    lng,
    fallbackLng: code => (code && code.startsWith('en') ? ['en'] : ['es']),
    resources,
    interpolation: { escapeValue: false },
  });
  apply(lng);
}

/** Reactive translation: re-evaluates when the language changes. */
export function t(key, opts) {
  void state.lang; // reactive dependency
  return i18next.t(key, opts);
}

export function getLang() {
  return state.lang;
}

export async function setLang(lng) {
  await i18next.changeLanguage(lng);
  localStorage.setItem('lang', lng);
  apply(lng);
}
