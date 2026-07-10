// i18n with i18next: one official language per country.
// Base catalogs hold every key for their language; country variants
// (es-AR, en-GB, pt-PT, …) override only real differences and fall back
// per-key to their base language, then to en/es.
import i18next from 'i18next';
import es from './es.json';
import en from './en.json';
import esES from './es-ES.json';
import esAR from './es-AR.json';
import esCO from './es-CO.json';
import enGB from './en-GB.json';
import fr from './fr.json';
import de from './de.json';
import it from './it.json';
import pt from './pt.json';
import ptPT from './pt-PT.json';
import ja from './ja.json';
import ko from './ko.json';
import zh from './zh.json';
import ru from './ru.json';
import hi from './hi.json';
import ar from './ar.json';
import nl from './nl.json';
import pl from './pl.json';
import tr from './tr.json';
import sv from './sv.json';
import uk from './uk.json';
import vi from './vi.json';
import id from './id.json';
import cs from './cs.json';
import ro from './ro.json';
import el from './el.json';
import th from './th.json';

// One entry per country, with that country's official language.
export const LOCALES = [
  { code: 'es-MX', flag: '🇲🇽', name: 'Español (México)', alias: 'spanish espanol mexico' },
  { code: 'es-ES', flag: '🇪🇸', name: 'Español (España)', alias: 'spanish espanol espana spain' },
  { code: 'es-CO', flag: '🇨🇴', name: 'Español (Colombia)', alias: 'spanish espanol colombia' },
  { code: 'es-AR', flag: '🇦🇷', name: 'Español (Argentina)', alias: 'spanish espanol argentina' },
  { code: 'es-CL', flag: '🇨🇱', name: 'Español (Chile)', alias: 'spanish espanol chile' },
  { code: 'es-PE', flag: '🇵🇪', name: 'Español (Perú)', alias: 'spanish espanol peru' },
  { code: 'en-US', flag: '🇺🇸', name: 'English (US)', alias: 'english ingles estados unidos usa united states' },
  { code: 'en-GB', flag: '🇬🇧', name: 'English (UK)', alias: 'english ingles reino unido uk united kingdom' },
  { code: 'en-CA', flag: '🇨🇦', name: 'English (Canada)', alias: 'english ingles canada' },
  { code: 'en-AU', flag: '🇦🇺', name: 'English (Australia)', alias: 'english ingles australia' },
  { code: 'en-NZ', flag: '🇳🇿', name: 'English (New Zealand)', alias: 'english ingles nueva zelanda new zealand' },
  { code: 'fr-FR', flag: '🇫🇷', name: 'Français (France)', alias: 'french frances francia france' },
  { code: 'de-DE', flag: '🇩🇪', name: 'Deutsch (Deutschland)', alias: 'german aleman alemania germany' },
  { code: 'de-AT', flag: '🇦🇹', name: 'Deutsch (Österreich)', alias: 'german aleman austria' },
  { code: 'it-IT', flag: '🇮🇹', name: 'Italiano (Italia)', alias: 'italian italiano italia italy' },
  { code: 'pt-BR', flag: '🇧🇷', name: 'Português (Brasil)', alias: 'portuguese portugues brasil brazil' },
  { code: 'pt-PT', flag: '🇵🇹', name: 'Português (Portugal)', alias: 'portuguese portugues portugal' },
  { code: 'nl-NL', flag: '🇳🇱', name: 'Nederlands (Nederland)', alias: 'dutch neerlandes holandes paises bajos netherlands' },
  { code: 'sv-SE', flag: '🇸🇪', name: 'Svenska (Sverige)', alias: 'swedish sueco suecia sweden' },
  { code: 'pl-PL', flag: '🇵🇱', name: 'Polski (Polska)', alias: 'polish polaco polonia poland' },
  { code: 'cs-CZ', flag: '🇨🇿', name: 'Čeština (Česko)', alias: 'czech checo chequia czechia' },
  { code: 'ro-RO', flag: '🇷🇴', name: 'Română (România)', alias: 'romanian rumano rumania romania' },
  { code: 'el-GR', flag: '🇬🇷', name: 'Ελληνικά (Ελλάδα)', alias: 'greek griego grecia greece' },
  { code: 'uk-UA', flag: '🇺🇦', name: 'Українська (Україна)', alias: 'ukrainian ucraniano ucrania ukraine' },
  { code: 'ru-RU', flag: '🇷🇺', name: 'Русский (Россия)', alias: 'russian ruso rusia russia' },
  { code: 'tr-TR', flag: '🇹🇷', name: 'Türkçe (Türkiye)', alias: 'turkish turco turquia turkey' },
  { code: 'ar-SA', flag: '🇸🇦', name: 'العربية (السعودية)', alias: 'arabic arabe arabia saudita saudi arabia' },
  { code: 'hi-IN', flag: '🇮🇳', name: 'हिन्दी (भारत)', alias: 'hindi india' },
  { code: 'zh-CN', flag: '🇨🇳', name: '中文（中国）', alias: 'chinese chino china mandarin' },
  { code: 'ja-JP', flag: '🇯🇵', name: '日本語（日本）', alias: 'japanese japones japon japan' },
  { code: 'ko-KR', flag: '🇰🇷', name: '한국어 (대한민국)', alias: 'korean coreano corea korea' },
  { code: 'vi-VN', flag: '🇻🇳', name: 'Tiếng Việt (Việt Nam)', alias: 'vietnamese vietnamita vietnam' },
  { code: 'id-ID', flag: '🇮🇩', name: 'Bahasa Indonesia (Indonesia)', alias: 'indonesian indonesio indonesia' },
  { code: 'th-TH', flag: '🇹🇭', name: 'ไทย (ประเทศไทย)', alias: 'thai tailandes tailandia thailand' },
];

// Full catalogs per base language + country-specific partial overrides.
const CATALOGS = {
  es, en, fr, de, it, pt, ja, ko, zh, ru, hi, ar, nl, pl, tr, sv, uk, vi, id, cs, ro, el, th,
  'es-ES': esES, 'es-AR': esAR, 'es-CO': esCO, 'en-GB': enGB, 'pt-PT': ptPT,
};

const RTL = ['ar', 'he', 'fa', 'ur'];

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

// Keeps <head> metadata (title, description, Open Graph) in the active language.
function setMeta(selector, content) {
  document.querySelector(selector)?.setAttribute('content', content);
}

function apply(lng) {
  state.lang = lng;
  document.documentElement.lang = lng;
  document.documentElement.dir = RTL.includes(lng.slice(0, 2)) ? 'rtl' : 'ltr';
  const title = i18next.t('app.title');
  const desc = i18next.t('seo.description');
  document.title = title;
  setMeta('meta[name="description"]', desc);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', desc);
  setMeta('meta[property="og:locale"]', lng.replace('-', '_'));
  setMeta('meta[name="twitter:title"]', title);
  setMeta('meta[name="twitter:description"]', desc);
}

export async function initI18n() {
  const resources = {};
  for (const [code, data] of Object.entries(CATALOGS)) {
    resources[code] = { translation: data };
  }
  const lng = resolveInitial();
  await i18next.init({
    lng,
    // i18next tries xx-YY → xx on its own; this is the final safety net.
    fallbackLng: code => (code && code.startsWith('es') ? ['es'] : ['en']),
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
