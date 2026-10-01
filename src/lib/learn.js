import { games, BANKS } from '../data/games.js';

export const BRAIN_CATS = [
  { id: 'cybersecurity', label: 'Cybersecurity' },
  { id: 'critical', label: 'Critical Thinking' },
  { id: 'science', label: 'Science' },
  { id: 'ai', label: 'AI Literacy' },
  { id: 'communication', label: 'Communication' },
  { id: 'logic', label: 'Logic' },
  { id: 'money', label: 'Money' },
  { id: 'history', label: 'History & Culture' },
];

export const BADGES = [
  { id: 'first', emoji: '🌱', name: 'First step', desc: 'Finished your first tiny game.', prog: (l) => [Math.min(1, Object.keys(l.plays).length), 1] },
  { id: 'phish', emoji: '🏅', name: 'Phishing spotter', desc: 'Correctly identified 10 phishing attempts.', prog: (l) => [Math.min(10, l.stats.cybersecurity?.correct || 0), 10] },
  { id: 'question', emoji: '🧠', name: 'Question everything', desc: 'Completed 25 critical-thinking challenges.', prog: (l) => [Math.min(25, l.stats.critical?.answered || 0), 25] },
  { id: 'science', emoji: '🔭', name: 'Curious mind', desc: 'Got 10 science answers right.', prog: (l) => [Math.min(10, l.stats.science?.correct || 0), 10] },
  { id: 'listener', emoji: '👂', name: 'Good listener', desc: 'Practiced 10 communication moments.', prog: (l) => [Math.min(10, l.stats.communication?.answered || 0), 10] },
  { id: 'unsure', emoji: '🤔', name: 'Comfortable with maybe', desc: 'Answered "not enough information" correctly 3 times.', prog: (l) => [Math.min(3, l.maybes || 0), 3] },
  { id: 'runner', emoji: '🛡️', name: 'Privacy pro', desc: 'Collected 15 protections in Privacy Runner.', prog: (l) => [Math.min(15, l.protections || 0), 15] },
  { id: 'daily', emoji: '☀️', name: 'Daily curious', desc: 'Completed the daily challenge 3 times.', prog: (l) => [Math.min(3, l.dailyCount || 0), 3] },
];

const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
export const today = dayKey;
export const dailyGameId = (date = new Date()) => {
  const pool = games.filter((g) => g.kind === 'quiz' && ['phish', 'fallacy', 'science', 'aihuman', 'logic', 'human'].includes(g.id));
  const n = Math.floor(date.getTime() / 86400000);
  return pool[n % pool.length].id;
};

export const masteryOf = (l, cat) => {
  const s = l.stats[cat];
  return s && s.answered ? Math.round((s.correct / s.answered) * 100) : null;
};

/* adaptive start level: only trusts mastery once there is enough practice */
export const startLevel = (l, cat) => {
  const s = l.stats[cat];
  if (!s || s.answered < 10) return 1;
  const m = s.correct / s.answered;
  return m >= 0.8 ? 3 : m >= 0.6 ? 2 : 1;
};

/* choose the next item near the target difficulty, avoiding recent and already used items */
export function pickNext(bank, used, level, recent = []) {
  const left = bank.filter((q) => !used.includes(q.id));
  if (!left.length) return null;
  const score = (q) => Math.abs(q.difficulty - level) * 10 + (recent.includes(q.id) ? 6 : 0) + Math.random();
  return left.slice().sort((a, b) => score(a) - score(b))[0];
}

export function applyLearn(l, p) {
  const stats = { ...l.stats }, topics = { ...l.topics };
  let maybes = l.maybes || 0, protections = l.protections || 0;
  p.answers.forEach((a) => {
    const s = stats[a.category] || { answered: 0, correct: 0 };
    stats[a.category] = { answered: s.answered + 1, correct: s.correct + (a.correct ? 1 : 0) };
    const t = topics[a.topic] || { answered: 0, correct: 0 };
    topics[a.topic] = { answered: t.answered + 1, correct: t.correct + (a.correct ? 1 : 0) };
    if (a.correct && a.maybe) maybes += 1;
  });
  protections += p.protections || 0;
  const plays = { ...l.plays, [p.gameId]: { count: (l.plays[p.gameId]?.count || 0) + 1, best: Math.max(l.plays[p.gameId]?.best || 0, p.total ? p.score / p.total : 0) } };
  const seen = [...(l.seen || []), ...p.answers.map((a) => a.qid)].slice(-30);
  const have = new Set(l.lessons.filter((x) => x.day === today()).map((x) => x.text));
  const lessons = [...l.lessons, ...p.answers.filter((a) => a.takeaway && !have.has(a.takeaway)).slice(0, 3).map((a) => ({ id: a.qid, day: today(), text: a.takeaway, topic: a.topic }))].slice(-60);
  const dailyCount = (l.dailyCount || 0) + (p.daily && l.daily?.date !== today() ? 1 : 0);
  const daily = p.daily ? { date: today(), done: true } : l.daily;
  const xp = l.xp + p.answers.filter((a) => a.correct).length * 10 + (p.total && p.score === p.total ? 10 : 0) + 5;
  const next = { ...l, stats, topics, maybes, protections, plays, seen, lessons, dailyCount, daily, xp };
  const earned = BADGES.filter((b) => !l.badges.includes(b.id) && (([n, t]) => n >= t)(b.prog(next))).map((b) => b.id);
  next.badges = [...l.badges, ...earned];
  return { next, earned };
}

export const seedLearn = () => ({
  xp: 240,
  stats: { cybersecurity: { answered: 5, correct: 4 }, critical: { answered: 15, correct: 9 }, science: { answered: 7, correct: 5 }, ai: { answered: 5, correct: 2 }, communication: { answered: 5, correct: 4 }, logic: { answered: 4, correct: 2 } },
  topics: { phishing: { answered: 4, correct: 3 } },
  maybes: 1, protections: 6, dailyCount: 1,
  plays: { phish: { count: 2, best: 0.8 } },
  seen: [],
  lessons: [
    { id: 'seed1', day: today(), text: 'Urgency + suspicious link + unexpected attachment are common phishing warning signs.', topic: 'phishing' },
    { id: 'seed2', day: today(), text: 'Confirmation bias: we notice evidence that agrees with us. Look for the strongest case against your view.', topic: 'confirmation bias' },
    { id: 'seed3', day: today(), text: 'Gravity pulls the whole time, even on the way up.', topic: 'physics' },
  ],
  badges: ['first'],
  daily: { date: '', done: false },
});

export const bankFor = (gameId) => BANKS[gameId] || [];
