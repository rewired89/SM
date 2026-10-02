const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + hex(a).map((v, i) => Math.round(v * (1 - t) + hex(b)[i] * t).toString(16).padStart(2, '0')).join('');
const rgb = (h) => hex(h).join(', ');

/* one shared palette so every pairing uses the same pink, teal and blue */
const PINK = '#ff8fc1', TEAL = '#3fd0cd', BLUE = '#1f6fff', PURPLE = '#7c4dff', GOLD = '#ffbf3f', OCEAN = '#0b74c9', CORAL = '#ff9d7a';
const lum = (h) => { const [r, g, b] = hex(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

const T = (id, name, c1, c2) => {
  const light = lum(c1) > 0.3; // soft colors need dark text and a deeper tone for links
  return {
    id, name, colors: [c1, c2],
    vars: {
      '--accent': c1, '--accent-light': mix(c1, '#ffffff', 0.22), '--accent-strong': mix(c1, '#000000', light ? 0.5 : 0.22), '--accent-rgb': rgb(c1),
      '--on-accent': light ? '#1b2540' : '#ffffff',
      '--hero-ink': light ? '#14203f' : '#ffffff', '--hero-shadow': light ? 'none' : '0 2px 18px rgba(0, 0, 0, 0.3)',
      '--accent2': c2, '--accent2-rgb': rgb(c2),
      '--hero-top': mix(c1, '#ffffff', 0.12), '--hero-mid': mix(c1, '#ffffff', 0.55), '--hero-low': mix(c1, '#ffffff', 0.86), '--hero-blob': mix(c2, '#ffffff', 0.42),
      '--bg-a': rgb(mix(c1, '#ffffff', 0.78)), '--bg-b': rgb(mix(c2, '#ffffff', 0.68)),
    },
  };
};

export const THEMES = [
  T('sky', 'Sky & Blush', BLUE, PINK),
  T('blushsky', 'Blush & Sky', PINK, BLUE),
  T('pinkteal', 'Pink & Teal', PINK, TEAL),
  T('tealpink', 'Teal & Pink', TEAL, PINK),
  T('ocean', 'Ocean & Seafoam', OCEAN, TEAL),
  T('oceancoral', 'Ocean & Coral', OCEAN, CORAL),
  T('pinkpurple', 'Pink & Purple', PINK, PURPLE),
  T('purpleteal', 'Purple & Teal', PURPLE, TEAL),
  T('violetgold', 'Violet & Gold', PURPLE, GOLD),
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
