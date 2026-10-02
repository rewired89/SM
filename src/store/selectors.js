import { users, ME } from '../data/users.js';
import { projects, milestones } from '../data/projects.js';
import { ideas } from '../data/ideas.js';
import { tools } from '../data/tools.js';
import { communities } from '../data/communities.js';
import { posts as basePosts } from '../data/posts.js';
import { commentsSeed } from '../data/social.js';
import { minsAgoToTs } from '../lib/format.js';

export const K = (type, id) => `${type}:${id}`;
const basePostsTs = basePosts.map((p) => ({ ...p, ts: minsAgoToTs(p.m) }));

export const allUsers = () => users;
export const userById = (id) => users.find((u) => u.id === id);
export const me = () => userById(ME);
export const allProjects = (s) => [...projects, ...s.created.projects];
export const allIdeas = (s) => [...s.created.ideas, ...ideas];
export const allTools = (s) => [...s.created.tools, ...tools];
export const allCommunities = (s) => [...s.created.communities, ...communities];
export const allPosts = (s) => [...s.createdPosts, ...basePostsTs];
export const projectById = (s, id) => allProjects(s).find((p) => p.id === id);
export const ideaById = (s, id) => allIdeas(s).find((p) => p.id === id);
export const toolById = (s, id) => allTools(s).find((p) => p.id === id);
export const communityById = (s, id) => allCommunities(s).find((p) => p.id === id);
export const postById = (s, id) => allPosts(s).find((p) => p.id === id);

export const entityOf = (s, ref) => {
  if (!ref) return null;
  const fn = { project: projectById, idea: ideaById, tool: toolById, community: communityById }[ref.type];
  return fn ? fn(s, ref.id) : null;
};
export const nameOf = (e) => e?.title || e?.name || '';

export const has = (s, list, key) => s[list].includes(key);

export const fundedOf = (s, type, e) => e.funded + (s.deltas[K(type, e.id)] || 0);

export function milestonesOf(s, projectId) {
  const p = projectById(s, projectId);
  if (!p) return [];
  let left = fundedOf(s, 'project', p);
  return [...milestones, ...s.created.milestones].filter((m) => m.projectId === projectId).map((m) => {
    const funded = Math.max(0, Math.min(m.needed, left));
    left -= m.needed;
    return { ...m, funded, done: funded >= m.needed - 1e-9 };
  });
}
export const projectGoal = (s, p) => milestonesOf(s, p.id).reduce((a, m) => a + m.needed, 0) || 1;
export const projectPct = (s, p) => Math.min(100, (fundedOf(s, 'project', p) / projectGoal(s, p)) * 100);
export const activeMilestone = (s, projectId) => {
  const ms = milestonesOf(s, projectId);
  return ms.find((m) => !m.done) || ms[ms.length - 1];
};
export const ideaPct = (s, i) => Math.min(100, (fundedOf(s, 'idea', i) / i.goal) * 100);

export const followerCount = (s, type, e) => e.followers + (has(s, 'following', K(type, e.id)) ? 1 : 0);
export const memberCount = (s, c) => c.members + (has(s, 'joined', c.id) ? 1 : 0);
export const interestCount = (s, i) => i.interested + (has(s, 'interested', i.id) ? 1 : 0);
export const likeCount = (s, p) => p.likes + (has(s, 'liked', p.id) ? 1 : 0);
export const commentsFor = (s, key) => [
  ...(commentsSeed[key] || []).map((c) => ({ ...c, ts: minsAgoToTs(c.m) })),
  ...(s.comments[key] || []),
];
export const commentCount = (s, key, base = 0) => base + (s.comments[key] || []).length;

export const toolSupport = (s, t) => (t.supported || 0) + (s.deltas[K('tool', t.id)] || 0);

export function contributionStats(s) {
  const total = s.contributions.reduce((a, c) => a + c.amount, 0);
  const proj = new Set(), tl = new Set(), by = {};
  s.contributions.forEach((c) => c.allocations.forEach((a) => {
    if (a.type === 'project') proj.add(a.id);
    if (a.type === 'tool') tl.add(a.id);
    const k = `${a.type}:${a.id || a.label}`;
    by[k] = by[k] || { ...a, amount: 0 };
    by[k].amount += a.amount;
  }));
  return { total, count: s.contributions.length, projects: proj.size, tools: tl.size, where: Object.values(by).sort((a, b) => b.amount - a.amount) };
}

/* ---------- deterministic recommendation ---------- */
export function interestTags(s) {
  const t = {};
  const add = (tags, w) => (tags || []).forEach((x) => (t[x] = (t[x] || 0) + w));
  s.liked.forEach((id) => add(postById(s, id)?.tags, 1));
  s.following.forEach((k) => { const [ty, id] = k.split(':'); if (ty !== 'user') add(entityOf(s, { type: ty, id })?.tags, 2); });
  s.joined.forEach((id) => add(communityById(s, id)?.tags, 2));
  s.interested.forEach((id) => add(ideaById(s, id)?.tags, 2));
  s.viewed.forEach((id) => add(projectById(s, id)?.tags, 1));
  return t;
}

export function rankFeed(s, tab = 'foryou') {
  const tags = interestTags(s);
  let list = allPosts(s).map((p) => {
    const reasons = [];
    let score = 0;
    const add = (v, r) => { score += v; reasons.push([v, r]); };
    if (p.authorId === ME) add(1, 'You posted this');
    if (has(s, 'following', K('user', p.authorId))) add(4, `You follow ${userById(p.authorId)?.name.split(' ')[0]}`);
    if (p.ref && has(s, 'following', K(p.ref.type, p.ref.id))) add(5, `You follow ${nameOf(entityOf(s, p.ref))}`);
    if (p.ref?.type === 'community' && has(s, 'joined', p.ref.id)) add(3.5, 'From a community you joined');
    if (p.ref?.type === 'project' && s.viewed.includes(p.ref.id)) add(2.5, 'You viewed this project');
    const overlap = (p.tags || []).filter((x) => tags[x]);
    if (overlap.length) add(Math.min(4, overlap.reduce((a, x) => a + tags[x], 0) * 0.5), `Matches #${overlap[0]}`);
    if (p.type === 'collab') add(1.5, 'Looking for collaborators');
    if (p.type === 'milestone') add(1, 'Close to a funding milestone');
    const hours = (Date.now() - p.ts) / 3600000;
    score += Math.max(0, 6 - hours / 6) + Math.log10(likeCount(s, p) + 1);
    if (p.createdByMe) score += 20;
    reasons.sort((a, b) => b[0] - a[0]);
    return { post: p, score, reason: reasons[0]?.[1] || (hours < 3 ? 'New today' : 'Popular right now') };
  });
  if (tab === 'following') list = list.filter((x) => x.reason.startsWith('You follow') || x.reason.startsWith('From a community') || x.post.authorId === ME || has(s, 'following', K('user', x.post.authorId)));
  if (tab === 'watch') list = list.filter((x) => x.post.media?.some((m) => m.kind === 'video'));
  if (tab === 'updates') list = list.filter((x) => ['update', 'milestone'].includes(x.post.type));
  if (tab === 'collab') list = list.filter((x) => x.post.type === 'collab' || x.post.type === 'idea');
  return list.sort((a, b) => b.score - a.score);
}

/* ---------- search ---------- */
const match = (qs, ...fields) => fields.flat().filter(Boolean).join(' ').toLowerCase().includes(qs);
export function search(s, query) {
  const qs = query.trim().toLowerCase().replace(/^#/, '');
  if (!qs) return { people: [], projects: [], ideas: [], tools: [], communities: [], posts: [] };
  return {
    people: allUsers().filter((u) => match(qs, u.name, u.handle, u.headline, u.skills, u.bio)),
    projects: allProjects(s).filter((p) => match(qs, p.title, p.tagline, p.tags, p.subs, p.category, p.about)),
    ideas: allIdeas(s).filter((i) => match(qs, i.title, i.pitch, i.tags, i.sub, i.category)),
    tools: allTools(s).filter((t) => match(qs, t.name, t.description, t.category, t.capabilities)),
    communities: allCommunities(s).filter((c) => match(qs, c.name, c.about, c.tags)),
    posts: allPosts(s).filter((p) => match(qs, p.text, p.tags, p.extra?.title)),
  };
}

/* ---------- games ---------- */
import { seededChallenges } from '../data/games.js';
export const allChallenges = (s) => [...s.created.challenges, ...seededChallenges];
export const challengeById = (s, id) => allChallenges(s).find((c) => c.id === id);

/* ---------- collaboration pages: /collab/:slug ---------- */
import { slugify } from '../lib/format.js';
export const collabSlug = (e) => slugify(e.title);
export const collabPath = (e) => `/collab_${slugify(e.title)}`;
export function collabTarget(s, key) {
  const k = slugify(key);
  const p = allProjects(s).find((x) => x.id === key || collabSlug(x) === k);
  if (p) return { type: 'project', entity: p };
  const i = allIdeas(s).find((x) => x.id === key || collabSlug(x) === k);
  return i ? { type: 'idea', entity: i } : null;
}
/* base team plus anyone whose join request the founder accepted */
export function collabTeam(s, type, e) {
  const base = type === 'project' ? e.team : [{ userId: e.authorId, role: 'Idea author' }];
  const have = new Set(base.map((m) => m.userId));
  const added = s.collabRequests.filter((r) => r.targetType === type && r.targetId === e.id && r.status === 'accepted' && !have.has(r.fromId)).map((r) => ({ userId: r.fromId, role: r.role, joined: true }));
  return [...base, ...added];
}
export const incomingRequests = (s, type, e) => s.collabRequests.filter((r) => r.targetType === type && r.targetId === e.id && r.fromId !== ME);
export const myRequests = (s, type, e) => s.collabRequests.filter((r) => r.targetType === type && r.targetId === e.id && r.fromId === ME);
export function collabStats(s, type, e) {
  if (type === 'project') {
    const goal = projectGoal(s, e), funded = fundedOf(s, 'project', e);
    return { collaborators: collabTeam(s, type, e).length, open: (e.looking || []).filter((l) => l.open).length, goal, funded, remaining: Math.max(0, goal - funded), pct: projectPct(s, e) };
  }
  const funded = fundedOf(s, 'idea', e);
  return { collaborators: collabTeam(s, type, e).length, open: e.looking, goal: e.goal, funded, remaining: Math.max(0, e.goal - funded), pct: ideaPct(s, e) };
}
const words = (t) => t.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3 && !['collaborator', 'developer', 'researcher', 'engineer'].includes(w) || ['python', 'rust'].includes(w));
export function collabCandidates(s, type, e, role) {
  const wants = role ? words(role) : [...(Array.isArray(e.looking) ? e.looking : []).filter((l) => l.open !== false).map((l) => l.skill), ...(e.needs || []), ...(e.tags || [])].flatMap(words);
  const inTeam = new Set(collabTeam(s, type, e).map((t) => t.userId));
  return allUsers().filter((u) => !inTeam.has(u.id) && u.openToCollab).map((u) => {
    const have = [...u.skills, ...u.collabTypes, ...(u.interests || [])];
    const hit = have.filter((h) => words(h).some((w) => wants.includes(w)));
    return { user: u, score: hit.length, reason: [...new Set(hit)].slice(0, 2).join(', ') };
  }).filter((x) => x.score > 0 || !role).sort((a, b) => b.score - a.score);
}

/* ---------- trust: project review, identity, payout ---------- */
import { TRUST, THRESHOLD } from '../data/trust.js';
export const reviewOf = (s, id) => s.reviews[id] || (TRUST[id] ? { score: TRUST[id].score, status: 'approved', submittedAt: TRUST[id].at, seeded: true } : null);
export function fundable(s, type, e) {
  const reasons = [];
  if (type === 'project') {
    const r = reviewOf(s, e.id);
    if (!r) reasons.push('This project has not been reviewed for funding yet');
    else if (r.score < THRESHOLD) reasons.push(`Review score ${r.score}/100, funding needs ${THRESHOLD} or more`);
    if (e.ownerId === ME && s.identity.status !== 'verified') reasons.push('The creator has not verified their identity yet');
    if (e.ownerId === ME && !s.payout.connected) reasons.push('The creator has not connected a payout account yet');
  } else if (type === 'idea') {
    if (s.created.ideas.some((i) => i.id === e.id)) reasons.push('Ideas cannot receive money yet. Turn it into a project and apply for funding');
  } else if (type === 'tool') {
    if (s.created.tools.some((t) => t.id === e.id) && s.identity.status !== 'verified') reasons.push('Tool creators must verify their identity before receiving contributions');
  }
  return { ok: reasons.length === 0, reasons };
}
