import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react';
import { reducer, applyContribution } from './reducer.js';
import { initialState } from './initialState.js';
import * as sel from './selectors.js';
import { useUI } from './UIProvider.jsx';
import { ME } from '../data/users.js';
import { applyTheme } from '../lib/themes.js';
import { applyLearn, BADGES } from '../lib/learn.js';
import { applyWin, ACHIEVEMENTS, SHOP, CHEER_COST } from '../lib/rewards.js';
import { saveAttachments } from '../lib/media.js';
import { users } from '../data/users.js';
import { uid, cents, pctLabel } from '../lib/format.js';

const KEY = 'nomi_state_v1';

/* the signed-in profile is merged into the shared user record so every component sees edits */
const meUser = users.find((u) => u.id === ME);
function applyProfile(p) {
  if (!p) return;
  Object.assign(meUser, { name: p.name, handle: p.handle, bio: p.bio, location: p.location, avatar: p.avatar, skills: p.skills, interests: p.interests, career: p.career, socials: p.socials, openToCollab: p.openToCollab, collabTypes: p.collabTypes, headline: p.interests.slice(0, 3) });
}
const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const saved = JSON.parse(raw);
    return saved.v === 1 ? { ...initialState(), ...saved, created: { ...initialState().created, ...saved.created } } : initialState();
  } catch { return initialState(); }
}

const SPLIT_MICRO = { creator: 0.4, pool: 0.4, infra: 0.2 };
const REPLIES = [
  'Thanks for reaching out, your intro is exactly what we needed. Can you share a bit about what you have built before?',
  'Love this. Let us set up a quick call this week and map out where you can help first.',
  'Welcome aboard! I will add you to the project channel. Start with the open issues on the board.',
];

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const { toast, openModal } = useUI();
  const ref = useRef(state);
  ref.current = state;
  applyProfile(state.profile);

  useLayoutEffect(() => { applyTheme(state.theme); }, [state.theme]);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  }, [state]);

  const actions = useMemo(() => {
    const toggle = (list, key, onMsg, offMsg) => {
      const on = ref.current[list].includes(key);
      dispatch({ type: 'TOGGLE', list, key });
      toast(on ? offMsg : onMsg);
    };
    const mk = {
      follow: (type, id, name) => toggle('following', sel.K(type, id), `Following ${name}`, `Unfollowed ${name}`),
      setTheme: (id, name) => { dispatch({ type: 'THEME', id }); if (name) toast(`Colors: ${name}`); },
      like: (id) => dispatch({ type: 'TOGGLE', list: 'liked', key: id }),
      save: (id) => toggle('saved', id, 'Saved to bookmarks', 'Removed from bookmarks'),
      join: (id, name) => toggle('joined', id, `You joined ${name}`, `You left ${name}`),
      interest: (id, title) => toggle('interested', id, `Marked interested in ${title}`, `No longer interested in ${title}`),
      comment: (key, text) => text.trim() && dispatch({ type: 'COMMENT', key, text: text.trim(), userId: ME }),
      view: (id) => dispatch({ type: 'VIEW', id }),
      markRead: (id) => dispatch({ type: 'READ', id }),
      markAllRead: () => dispatch({ type: 'READ_ALL' }),
      readConversation: (id) => dispatch({ type: 'CV_READ', id }),
      reset: () => { dispatch({ type: 'RESET' }); toast('Demo reset'); },

      useTool: (id) => dispatch({ type: 'TOOL_USE', id }),
      dismissMicro: (id) => dispatch({ type: 'MICRO_SEEN', id }),

      sendMessage: (cvId, text, userId) => {
        if (!text.trim()) return;
        dispatch({ type: 'MSG', cvId, userId, from: 'me', text: text.trim() });
      },
      startConversation: (userId) => {
        const id = `cv_${userId.replace('u_', '')}`;
        if (!ref.current.conversations.some((c) => c.id === id)) dispatch({ type: 'MSG', cvId: id, userId, from: 'me', text: 'Hi! I found you on Nomi.' });
        return id;
      },

      contribute({ targetType, targetId, amount, micro = false }) {
        const s = ref.current;
        if (!s.payments.methods.length) { toast('Add a payment method first. It only takes a moment.', { tone: 'danger' }); openModal('payment'); return null; }
        if (s.wallet < amount) { toast('Monthly limit reached. Raise it in Settings → Payments.', { tone: 'danger', to: '/settings' }); return null; }
        const pm = s.payments.methods.find((m) => m.id === s.payments.defaultId) || s.payments.methods[0];
        const e = sel.entityOf(s, { type: targetType, id: targetId });
        const r2 = (n) => +n.toFixed(2);
        let allocations;
        if (micro) {
          const proj = sel.projectById(s, e.projectId);
          allocations = [
            { type: 'tool', id: e.id, label: e.name, amount: r2(amount * SPLIT_MICRO.creator), note: 'Tool creator' },
            ...(proj ? [{ type: 'project', id: proj.id, label: proj.title, amount: r2(amount * SPLIT_MICRO.pool), note: 'Project funding pool' }] : []),
            { type: 'platform', id: 'platform', label: 'Platform infrastructure', amount: r2(amount * SPLIT_MICRO.infra), note: 'Platform infrastructure' },
          ];
        } else {
          allocations = [{ type: targetType, id: targetId, label: sel.nameOf(e), amount, note: 'Direct support' }];
        }
        const entry = { id: uid('ct'), method: pm.label, ts: Date.now(), kind: micro ? 'micro' : 'direct', targetType, targetId, label: sel.nameOf(e), amount, allocations };
        const next = applyContribution(s, entry);
        const pid = allocations.find((a) => a.type === 'project')?.id;
        const proj = pid ? sel.projectById(s, pid) : null;
        const result = { entry, allocations };
        if (proj) {
          result.before = { funded: sel.fundedOf(s, 'project', proj), pct: sel.projectPct(s, proj) };
          result.after = { funded: sel.fundedOf(next, 'project', proj), pct: sel.projectPct(next, proj) };
          result.goal = sel.projectGoal(s, proj);
          const was = sel.milestonesOf(s, pid), now = sel.milestonesOf(next, pid);
          result.completed = now.find((m, i) => m.done && !was[i].done) || null;
          result.project = proj;
        } else if (targetType === 'idea') {
          result.before = { funded: sel.fundedOf(s, 'idea', e), pct: sel.ideaPct(s, e) };
          result.after = { funded: sel.fundedOf(next, 'idea', e), pct: sel.ideaPct(next, e) };
          result.goal = e.goal;
        }
        dispatch({ type: 'CONTRIBUTE', entry });
        toast(`${cents(amount)} contributed to ${entry.label}`, { tone: 'success' });
        if (proj && !s.creatorUpdated.includes(proj.id) && proj.ownerId !== ME) {
          setTimeout(() => {
            const cur = ref.current;
            if (cur.creatorUpdated.includes(proj.id)) return;
            const owner = sel.userById(proj.ownerId);
            const pc = sel.projectPct(cur, proj);
            const post = {
              id: uid('s'), type: 'update', authorId: proj.ownerId, ts: Date.now(), tags: proj.tags, likes: 0, comments: 0, ref: { type: 'project', id: proj.id },
              text: `Thank you to everyone who supported ${proj.title} today. Your small contributions are moving us forward.`,
              extra: { day: 60, prev: `Funding ${pctLabel(result.before.pct)}`, curr: `Funding ${pctLabel(pc)}`, changed: 'Supporters like you, every $0.50 counts' },
            };
            dispatch({ type: 'CREATOR_UPDATE', post, projectId: proj.id, text: `${owner.name} posted an update on ${proj.title}: "Thank you to everyone who supported today."` });
            toast(`${owner.name} posted an update on ${proj.title}`, { to: `/project/${proj.id}` });
          }, 7000);
        }
        return result;
      },

      sendCollab({ targetType, targetId, skill, message }) {
        const s = ref.current;
        const e = sel.entityOf(s, { type: targetType, id: targetId });
        const ownerId = e.ownerId || e.authorId;
        const owner = sel.userById(ownerId);
        const cvId = `cv_${ownerId.replace('u_', '')}`;
        dispatch({ type: 'COLLAB', request: { id: uid('cr'), targetType, targetId, skill, message, ts: Date.now() } });
        dispatch({ type: 'MSG', cvId, userId: ownerId, from: 'me', text: `Collaboration request for ${sel.nameOf(e)} (${skill}): ${message || 'Happy to help where useful.'}` });
        dispatch({ type: 'NOTE', noteType: 'collab', text: `Your collaboration request for ${sel.nameOf(e)} was sent to ${owner.name}.`, to: `/${targetType}/${targetId}` });
        toast(`Request sent to ${owner.name}`, { tone: 'success' });
        setTimeout(() => {
          dispatch({ type: 'MSG', cvId, userId: ownerId, from: 'them', text: REPLIES[Math.floor(Math.random() * REPLIES.length)] });
          dispatch({ type: 'NOTE', noteType: 'collab', text: `${owner.name} replied to your collaboration request.`, to: `/messages/${cvId}` });
          toast(`${owner.name} replied to your request`, { to: `/messages/${cvId}` });
        }, 5000);
      },

      arcadeWin(p) {
        const { gained, parts, capped, earned } = applyWin(ref.current.rewards, p);
        dispatch({ type: 'ARCADE_WIN', payload: p });
        earned.forEach((id) => { const x = ACHIEVEMENTS.find((q) => q.id === id); toast(`Achievement: ${x.emoji} ${x.name}`, { tone: 'success', to: '/rewards', ms: 5000 }); });
        return { gained, parts, capped };
      },
      buy(id) {
        const it = SHOP.find((x) => x.id === id);
        if (ref.current.rewards.sparks < it.cost) { toast('Not enough sparks yet. Win a quick game!', { tone: 'danger' }); return; }
        dispatch({ type: 'BUY', id });
        if (it.kind !== 'theme') dispatch({ type: 'EQUIP', slot: it.kind, id });
        toast(`Unlocked: ${it.name}`, { tone: 'success' });
      },
      equip(slot, id) { dispatch({ type: 'EQUIP', slot, id }); },
      cheer(projectId, name) {
        if (ref.current.rewards.sparks < CHEER_COST) { toast('Not enough sparks yet. Win a quick game!', { tone: 'danger' }); return; }
        dispatch({ type: 'CHEER', projectId, cost: CHEER_COST });
        toast(`You cheered ${name} with ${CHEER_COST} sparks`, { tone: 'success' });
      },
      saveProfile(patch) { dispatch({ type: 'PROFILE', patch }); toast('Profile saved', { tone: 'success' }); },
      addPayment(m) { dispatch({ type: 'PAY_ADD', method: { id: uid('pm'), createdAt: Date.now(), ...m } }); toast(`${m.label} added (simulated)`, { tone: 'success' }); },
      removePayment(id) { dispatch({ type: 'PAY_REMOVE', id }); toast('Payment method removed'); },
      setDefaultPayment: (id) => dispatch({ type: 'PAY_DEFAULT', id }),
      setLimit(n) { dispatch({ type: 'LIMIT', n }); toast(`Monthly limit: $${n}`); },
      async publishPost({ type = 'post', text, tags = [], items = [], links = [], ref: r, extra }) {
        const media = await saveAttachments(items);
        return mk.createPost({ type, text, tags, ref: r, extra, media, links });
      },
      setAmbient: (on) => dispatch({ type: 'AMBIENT', on }),
      learn(payload) {
        const { earned } = applyLearn(ref.current.learn, payload);
        dispatch({ type: 'LEARN', payload });
        earned.forEach((id) => { const b = BADGES.find((x) => x.id === id); toast(`Badge earned: ${b.emoji} ${b.name}`, { tone: 'success', to: '/play', ms: 5000 }); });
      },
      shareGame({ gameId, title, emoji, label, score, total }) {
        const name = sel.me().name;
        return mk.createPost({ type: 'game', text: `${name} completed ${gameId === 'daily' ? 'today\'s 30-second challenge' : title}: ${score}/${total}.`, tags: [], extra: { gameId, title, emoji, label, score, total } });
      },
      createChallenge(d) {
        const id = `ch_${uid('n')}`;
        const entity = { id, title: 'Community challenge', emoji: '🏆', skill: 'community challenge', sourceType: 'community', topic: d.category, takeaway: d.explanation.split(/(?<=[.!?])\s/)[0], authorId: ME, ...d };
        dispatch({ type: 'CREATE', kind: 'challenge', entity });
        toast('Challenge published', { tone: 'success' });
        return id;
      },
      createPost({ type = 'post', text, tags = [], ref: r, extra, media = [], links = [] }) {
        const post = { id: uid('s'), type, authorId: ME, ts: Date.now(), text, tags, likes: 0, comments: 0, ref: r, extra, media, links, createdByMe: true };
        dispatch({ type: 'POST', post });
        toast('Posted', { tone: 'success' });
        return post;
      },
      async createEntity(kind, rawData) {
        const data = { ...rawData, media: await saveAttachments(rawData.items || []) };
        const id = `${{ project: 'p', idea: 'i', tool: 't', community: 'c' }[kind]}_${uid('n')}`;
        const common = { id, tags: data.tags || [], followers: 0 };
        let entity, milestone, text, ntype = 'post';
        if (kind === 'project') {
          entity = { ...common, title: data.title, tagline: data.tagline, kind: 'Project', status: 'Just started', category: data.category, subs: [], about: data.about || data.tagline, progress: [{ label: 'Planning', pct: 5 }], team: [{ userId: ME, role: 'Creator' }], needs: data.needs, looking: data.needs.map((n) => ({ skill: n, open: true })), ownerId: ME, funded: 0 };
          milestone = { id: uid('m'), projectId: id, title: 'First milestone', needed: 500 };
          text = `Started a new project: ${data.title}. ${data.tagline}`;
        } else if (kind === 'idea') {
          entity = { ...common, title: data.title, pitch: data.pitch, body: data.pitch, authorId: ME, category: data.category, sub: data.sub || data.category, stage: 0, interested: 0, comments: 0, looking: data.needs.length, funded: 0, goal: 500, needs: data.needs };
          text = `New idea: ${data.title}. ${data.pitch}`; ntype = 'idea';
        } else if (kind === 'tool') {
          entity = { id, kind: 'tool', name: data.title, description: data.pitch, creatorId: ME, category: data.category, subcategory: 'AI Tools', uses: 0, rating: 0, capabilities: ['New'], communityId: 'c_aibuilders', projectId: null, analyzer: 'keywords', placeholder: 'Paste something to analyze...', sample: '', fee: null, tags: data.tags || ['AI'] };
          text = `Published a new AI tool: ${data.title}. ${data.pitch}`; ntype = 'tool';
        } else {
          entity = { id, name: data.title, members: 1, about: data.pitch, projects: 0, people: 1, events: 0, tags: data.tags || [], hue: 30, ownerId: ME, discussions: [] };
          text = `Started a new community: ${data.title}. ${data.pitch}`; ntype = 'community';
        }
        Object.assign(entity, { media: data.media, links: data.links || [] });
        const post = { id: uid('s'), type: ntype, authorId: ME, ts: Date.now(), text, tags: entity.tags || [], likes: 0, comments: 0, ref: { type: kind, id }, media: data.media, links: data.links || [], createdByMe: true };
        dispatch({ type: 'CREATE', kind, entity, milestone, post });
        if (kind === 'community') dispatch({ type: 'TOGGLE', list: 'joined', key: id });
        toast(`${kind[0].toUpperCase() + kind.slice(1)} created`, { tone: 'success' });
        return id;
      },
    };
    return mk;
  }, [toast]);

  const value = useMemo(() => ({ s: state, a: actions }), [state, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
