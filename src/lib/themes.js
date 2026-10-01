const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v * (1 - t) + hex(b)[i] * t).toString(16).padStart(2, '0')).join('');
const rgb = (h) => hex(h).join(', ');

const T = (id, name, c1, c2) => ({
  id, name, colors: [c1, c2],
  vars: {
    '--accent': c1, '--accent-light': mix(c1, '#ffffff', 0.22), '--accent-strong': mix(c1, '#000000', 0.22), '--accent-rgb': rgb(c1),
    '--accent2': c2, '--accent2-rgb': rgb(c2),
    '--hero-top': mix(c1, '#ffffff', 0.12), '--hero-mid': mix(c1, '#ffffff', 0.55), '--hero-low': mix(c1, '#ffffff', 0.86), '--hero-blob': mix(c2, '#ffffff', 0.42),
    '--bg-a': rgb(mix(c1, '#ffffff', 0.78)), '--bg-b': rgb(mix(c2, '#ffffff', 0.68)),
  },
});

export const THEMES = [
  T('sky', 'Sky & Blush', '#1f6fff', '#ff8fc1'),
  T('pinkteal', 'Pink & Teal', '#d6307c', '#19c2ae'),
  T('tealpink', 'Teal & Pink', '#0b8277', '#ff7fb5'),
  T('pinkpurple', 'Pink & Purple', '#d6307c', '#9b6bff'),
  T('purpleteal', 'Purple & Teal', '#7c4dff', '#19c2ae'),
  T('violetgold', 'Violet & Gold', '#7c4dff', '#ffbf3f'),
  { ...T('sunset', 'Sunset', '#d9480f', '#d6307c'), lock: 'theme_sunset' },
  { ...T('minty', 'Mint & Lilac', '#0b8b7b', '#b79bff'), lock: 'theme_minty' },
];

export const applyTheme = (id) => {
  const th = THEMES.find((t) => t.id === id) || THEMES[0];
  const el = document.documentElement;
  Object.entries(th.vars).forEach(([k, v]) => el.style.setProperty(k, v));
  el.dataset.theme = th.id;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', th.vars['--hero-low']);
};
