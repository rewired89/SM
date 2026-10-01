import { initialState } from './initialState.js';
import { K, milestonesOf, projectById } from './selectors.js';
import { uid } from '../lib/format.js';
import { applyLearn, BADGES } from '../lib/learn.js';
import { applyWin, ACHIEVEMENTS, SHOP } from '../lib/rewards.js';

const LISTS = ['following', 'liked', 'saved', 'joined', 'interested'];
export const note = (s, type, text, to) => ({
  ...s, notifications: [{ id: uid('n'), type, text, to, ts: Date.now(), read: false }, ...s.notifications],
});

export function applyContribution(s, entry) {
  const deltas = { ...s.deltas };
  entry.allocations.forEach((a) => {
    if (['project', 'idea', 'tool'].includes(a.type)) deltas[K(a.type, a.id)] = (deltas[K(a.type, a.id)] || 0) + a.amount;
  });
  let next = {
    ...s, deltas, wallet: +(s.wallet - entry.amount).toFixed(2), contributions: [entry, ...s.contributions],
  };
  const pid = entry.allocations.find((a) => a.type === 'project')?.id;
  if (pid) {
    const was = milestonesOf(s, pid), now = milestonesOf(next, pid);
    const done = now.find((m, i) => m.done && !was[i].done);
    if (done) next = note(next, 'milestone', `Your contribution helped complete a milestone: ${projectById(next, pid).title}, ${done.title}.`, `/project/${pid}`);
  }
  return next;
}

export function reducer(s, a) {
  switch (a.type) {
    case 'TOGGLE': {
      if (!LISTS.includes(a.list)) return s;
      const on = s[a.list].includes(a.key);
      return { ...s, [a.list]: on ? s[a.list].filter((k) => k !== a.key) : [...s[a.list], a.key] };
    }
    case 'COMMENT': {
      const list = s.comments[a.key] || [];
      return { ...s, comments: { ...s.comments, [a.key]: [...list, { id: uid('c'), userId: a.userId, text: a.text, ts: Date.now() }] } };
    }
    case 'CONTRIBUTE': return applyContribution(s, a.entry);
    case 'TOOL_USE': return { ...s, toolUses: { ...s.toolUses, [a.id]: (s.toolUses[a.id] || 0) + 1 } };
    case 'MICRO_SEEN': return { ...s, microSeen: { ...s.microSeen, [a.id]: s.toolUses[a.id] || 0 } };
    case 'VIEW': return s.viewed.includes(a.id) ? s : { ...s, viewed: [a.id, ...s.viewed].slice(0, 8) };
    case 'NOTE': return note(s, a.noteType, a.text, a.to);
    case 'READ': return { ...s, notifications: s.notifications.map((n) => (n.id === a.id ? { ...n, read: true } : n)) };
    case 'READ_ALL': return { ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) };
    case 'POST': return { ...s, createdPosts: [a.post, ...s.createdPosts] };
    case 'CREATE': {
      const c = s.created;
      const map = { project: 'projects', idea: 'ideas', tool: 'tools', community: 'communities', challenge: 'challenges' };
      return { ...s, created: { ...c, [map[a.kind]]: [a.entity, ...c[map[a.kind]]], milestones: a.milestone ? [...c.milestones, a.milestone] : c.milestones }, createdPosts: a.post ? [a.post, ...s.createdPosts] : s.createdPosts };
    }
    case 'COLLAB': return { ...s, collabRequests: [a.request, ...s.collabRequests] };
    case 'MSG': {
      const exists = s.conversations.some((c) => c.id === a.cvId);
      const msg = { from: a.from, text: a.text, ts: Date.now() };
      const conversations = exists
        ? s.conversations.map((c) => (c.id === a.cvId ? { ...c, unread: a.from === 'them' ? c.unread + 1 : c.unread, messages: [...c.messages, msg] } : c))
        : [{ id: a.cvId, userId: a.userId, unread: a.from === 'them' ? 1 : 0, messages: [msg] }, ...s.conversations];
      return { ...s, conversations };
    }
    case 'CV_READ': return { ...s, conversations: s.conversations.map((c) => (c.id === a.id ? { ...c, unread: 0 } : c)) };
    case 'CREATOR_UPDATE': return { ...note({ ...s, createdPosts: [a.post, ...s.createdPosts], creatorUpdated: [...s.creatorUpdated, a.projectId] }, 'update', a.text, `/project/${a.projectId}`) };
    case 'LEARN': {
      const { next, earned } = applyLearn(s.learn, a.payload);
      let out = { ...s, learn: next };
      earned.forEach((id) => { const b = BADGES.find((x) => x.id === id); out = note(out, 'badge', `Badge earned: ${b.emoji} ${b.name}. ${b.desc}`, '/play'); });
      return out;
    }
    case 'ARCADE_WIN': {
      const { next, earned } = applyWin(s.rewards, a.payload);
      let out = { ...s, rewards: next };
      earned.forEach((id) => { const x = ACHIEVEMENTS.find((q) => q.id === id); out = note(out, 'badge', `Achievement: ${x.emoji} ${x.name}. ${x.desc}`, '/rewards'); });
      return out;
    }
    case 'BUY': {
      const it = SHOP.find((x) => x.id === a.id);
      if (!it || s.rewards.unlocked.includes(it.id) || s.rewards.sparks < it.cost) return s;
      return { ...s, rewards: { ...s.rewards, sparks: s.rewards.sparks - it.cost, unlocked: [...s.rewards.unlocked, it.id] } };
    }
    case 'EQUIP': return { ...s, rewards: { ...s.rewards, equipped: { ...s.rewards.equipped, [a.slot]: a.id } } };
    case 'CHEER': {
      if (s.rewards.sparks < a.cost) return s;
      return { ...s, rewards: { ...s.rewards, sparks: s.rewards.sparks - a.cost, cheers: { ...s.rewards.cheers, [a.projectId]: (s.rewards.cheers[a.projectId] || 0) + 1 } } };
    }
    case 'AMBIENT': return { ...s, ambient: a.on };
    case 'PROFILE': return { ...s, profile: { ...s.profile, ...a.patch } };
    case 'PAY_ADD': return { ...s, payments: { methods: [...s.payments.methods, a.method], defaultId: s.payments.defaultId || a.method.id } };
    case 'PAY_REMOVE': {
      const methods = s.payments.methods.filter((m) => m.id !== a.id);
      return { ...s, payments: { methods, defaultId: s.payments.defaultId === a.id ? methods[0]?.id || null : s.payments.defaultId } };
    }
    case 'PAY_DEFAULT': return { ...s, payments: { ...s.payments, defaultId: a.id } };
    case 'LIMIT': return { ...s, monthlyLimit: a.n, wallet: +(s.wallet + (a.n - s.monthlyLimit)).toFixed(2) };
    case 'THEME': return { ...s, theme: a.id };
    case 'RESET': return initialState();
    default: return s;
  }
}
