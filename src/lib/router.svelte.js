// Hash-based routing: works on GitHub Pages with no server rewrites, every
// hash change is a history entry (back/forward work), and crawlers keep
// treating the site as one canonical URL.
const ROUTES = ['home', 'create'];

function parse() {
  const path = location.hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  return ROUTES.includes(path) ? path : 'home';
}

const state = $state({ route: parse() });

window.addEventListener('hashchange', () => {
  state.route = parse();
  window.scrollTo(0, 0);
});

/** Reactive current route: 'home' | 'create'. */
export function getRoute() {
  return state.route;
}

/** Navigate by pushing a new hash (and thus a history entry). */
export function go(route) {
  const hash = route === 'home' ? '#/' : `#/${route}`;
  if (location.hash !== hash) location.hash = hash;
}
