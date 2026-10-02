import { putFile } from './media.js';

/* Device-level registry so the admin queue sees submissions from every local account. Real build: server database. */
const KEY = 'nomi_games_v1';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* storage unavailable */ } };

export const SEED_GAMES = [
  { id: 'cg_themes', kind: 'tool', title: 'Theme Spotter', description: 'Paste any text and see the main themes and a next step. Runs in the Nomi sandbox.', how: 'Paste text, press Analyze, read the themes. Ctrl+Enter also works.', purpose: 'Helps you quickly see what a long note or draft is really about before you edit it.', duration: 0, tags: ['writing', 'analysis'], creatorId: 'u_maya', src: 'games/theme-spotter.html', score: 90, status: 'approved', createdAt: Date.now() - 86400000 * 3, plays: 22, wins: 0 },
  { id: 'cg_tapmoon', title: 'Tap the Moon', description: 'A calm 30 second reflex game. Tap the moon as it drifts and avoid the clouds.', how: 'Click, tap or press Space when the moon is inside the glow.', purpose: 'Practice patient timing and notice how focus changes under pressure.', duration: 30, tags: ['focus', 'reflex'], creatorId: 'u_tomas', src: 'games/tap-moon.html', score: 92, status: 'approved', createdAt: Date.now() - 86400000 * 9, plays: 41, wins: 17 },
  { id: 'cg_pairs', title: 'Memory Pairs', description: 'Flip cards and find the matching pairs before you run out of moves.', how: 'Click or press Enter on a card to flip it. Find every pair.', purpose: 'Train short term memory with a quick relaxed puzzle you can finish in a minute.', duration: 60, tags: ['memory', 'puzzle'], creatorId: 'u_priya', src: 'games/memory-pairs.html', score: 88, status: 'approved', createdAt: Date.now() - 86400000 * 5, plays: 63, wins: 30 },
];

export const allGames = () => [...read(), ...SEED_GAMES];
export const gameById = (id) => allGames().find((g) => g.id === id);
export const approvedGames = () => allGames().filter((g) => g.status === 'approved' && g.kind !== 'tool');
export const approvedTools = () => allGames().filter((g) => g.status === 'approved' && g.kind === 'tool');
export const gamesBy = (userId) => allGames().filter((g) => g.creatorId === userId);
export const pendingGames = () => read().filter((g) => g.status === 'human_review');

export async function saveGame(meta, html, report, creatorId) {
  const file = new File([html], `${meta.title || 'game'}.html`, { type: 'text/html' });
  const fileId = await putFile(file);
  const g = { id: `cg_${Date.now().toString(36)}`, ...meta, creatorId, fileId, size: report.size, score: report.score, report: { checks: report.checks, hard: report.hard }, status: report.verdict === 'approved' ? 'approved' : report.verdict === 'human_review' ? 'human_review' : 'rejected', createdAt: Date.now(), plays: 0, wins: 0, html: html.length < 120 * 1024 ? html : undefined };
  write([g, ...read()]);
  return g;
}
export function decideGame(id, status, note) { write(read().map((g) => (g.id === id ? { ...g, status, note: note || '', decidedAt: Date.now() } : g))); }
export function bumpGame(id, won) { write(read().map((g) => (g.id === id ? { ...g, plays: g.plays + 1, wins: g.wins + (won ? 1 : 0) } : g))); }
