export const DAILY_CAP = 60;
export const WIN_SPARKS = 10;
export const FLAWLESS_BONUS = 5;
export const FIRST_WIN_BONUS = 5;
export const CHEER_COST = 5;

const day = () => new Date().toISOString().slice(0, 10);

export const SHOP = [
  { id: 'ring_aurora', kind: 'ring', name: 'Aurora ring', cost: 30, desc: 'Your two theme colors circle your avatar.' },
  { id: 'ring_cloud', kind: 'ring', name: 'Cloud glow', cost: 25, desc: 'A soft white halo.' },
  { id: 'ring_gold', kind: 'ring', name: 'Gold ring', cost: 40, desc: 'Classic and shiny.' },
  { id: 'title_hopper', kind: 'title', name: 'Title: Cloud Hopper', cost: 20, text: 'Cloud Hopper', desc: 'Shown under your name.' },
  { id: 'title_catcher', kind: 'title', name: 'Title: Star Catcher', cost: 20, text: 'Star Catcher', desc: 'Shown under your name.' },
  { id: 'title_curious', kind: 'title', name: 'Title: Curious Mind', cost: 20, text: 'Curious Mind', desc: 'Shown under your name.' },
  { id: 'theme_sunset', kind: 'theme', name: 'Palette: Sunset', cost: 40, themeId: 'sunset', desc: 'Orange and magenta for your whole UI.' },
  { id: 'theme_minty', kind: 'theme', name: 'Palette: Mint & Lilac', cost: 40, themeId: 'minty', desc: 'Fresh mint with soft lilac.' },
];

export const ACHIEVEMENTS = [
  { id: 'a_hopper', emoji: '☁️', name: 'Cloud hopper', desc: 'Win Cloud Hop 3 times.', prog: (r) => [Math.min(3, r.wins.cloudhop || 0), 3] },
  { id: 'a_catcher', emoji: '⭐', name: 'Star catcher', desc: 'Win Star Catch 3 times.', prog: (r) => [Math.min(3, r.wins.orbpop || 0), 3] },
  { id: 'a_center', emoji: '🎯', name: 'Dead center', desc: 'Win Perfect Stop 3 times.', prog: (r) => [Math.min(3, r.wins.stopper || 0), 3] },
  { id: 'a_regular', emoji: '🕹️', name: 'Arcade regular', desc: 'Win 10 arcade games in total.', prog: (r) => [Math.min(10, Object.values(r.wins).reduce((a, b) => a + b, 0)), 10] },
];

export const seedRewards = () => ({
  sparks: 25, wins: {}, best: {}, unlocked: [], equipped: { ring: null, title: null }, cheers: {}, earnedToday: { day: '', n: 0 }, firstWinDay: '', achievements: [],
});

export function applyWin(r, { gameId, flawless, score }) {
  const d = day();
  const et = r.earnedToday.day === d ? r.earnedToday.n : 0;
  const first = r.firstWinDay !== d;
  const parts = [['Win', WIN_SPARKS]];
  if (flawless) parts.push(['Flawless', FLAWLESS_BONUS]);
  if (first) parts.push(['First win today', FIRST_WIN_BONUS]);
  const raw = parts.reduce((a, [, n]) => a + n, 0);
  const gained = Math.max(0, Math.min(raw, DAILY_CAP - et));
  const next = {
    ...r, sparks: r.sparks + gained, wins: { ...r.wins, [gameId]: (r.wins[gameId] || 0) + 1 },
    best: { ...r.best, [gameId]: Math.max(r.best[gameId] || 0, score || 0) },
    earnedToday: { day: d, n: et + gained }, firstWinDay: d,
  };
  const earned = ACHIEVEMENTS.filter((a) => !r.achievements.includes(a.id) && (([n, t]) => n >= t)(a.prog(next))).map((a) => a.id);
  next.achievements = [...r.achievements, ...earned];
  return { next, gained, parts, capped: gained < raw, earned };
}
