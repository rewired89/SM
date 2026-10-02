import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react';
import { reducer, applyContribution } from './reducer.js';
import { initialState } from './initialState.js';
import * as sel from './selectors.js';
import { useUI } from './UIProvider.jsx';
import { ME } from '../data/users.js';
import { applyTheme } from '../lib/themes.js';
import { applyLearn, BADGES } from '../lib/learn.js';
import { applyWin, ACHIEVEMENTS, SHOP, CHEER_COST } from '../lib/rewards.js';
import { saveAttachments, parseLink } from '../lib/media.js';
import { scoreProject, pdfPages } from '../lib/review.js';
import { THRESHOLD } from '../data/trust.js';
import { MEETING_MIN } from '../lib/profile.js';
import { fmtSlot } from '../lib/meetings.js';
import { classify, STRIKE_WINDOW_DAYS, SUSPENSION_DAYS } from '../lib/conduct.js';
import { setBan } from '../lib/bans.js';
import { useAuth } from '../components/auth/AuthGate.jsx';
import { users } from '../data/users.js';
import { uid, cents, pctLabel } from '../lib/format.js';

const keyFor = (id) => (id === 'u_dayana' ? 'nomi_state_v1' : `nomi_state_v1:${id}`);

/* the signed-in profile is merged into the shared user record so every component sees edits */
function applyProfile(p) {
  const meUser = users.find((u) => u.id === ME);
  if (!p || !meUser) return;
  Object.assign(meUser, { name: p.name, handle: p.handle, bio: p.bio, location: p.location, avatar: p.avatar, skills: p.skills, interests: p.interests, career: p.career, socials: p.socials, openToCollab: p.openToCollab, collabTypes: p.collabTypes, headline: p.interests.slice(0, 3) });
}
const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

function load(accountId) {
  try {
    const raw = localStorage.getItem(keyFor(accountId));
    if (!raw) return initialState(accountId);
    const saved = JSON.parse(raw);
    if (saved.v !== 1) return initialState(accountId);
    const base = initialState(accountId);
    const out = { ...base, ...saved, conduct: saved.conduct ?? base.conduct, dailyLimit: saved.dailyLimit ?? 500, meetings: saved.meetings ?? base.meetings, created: { ...base.created, ...saved.created } };
    out.collabRequests = (out.collabRequests || []).map((r) => ({ fromId: ME, role: 'Collaborator', status: 'pending', ...r }));
    if (out.profile?.collabTypes) out.profile = { ...out.profile, collabTypes: [...new Set(out.profile.collabTypes.map((t) => (t === 'Tech with AI collaborator' ? 'Tech with AI · Vibe Code' : t)))] };
    return out;
  } catch { return initialState(accountId); }
}

const SPLIT_MICRO = { creator: 0.4, pool: 0.4, infra: 0.2 };
const kindTone = (k) => (k === 'accept' ? 'success' : 'default');
const ROOM_REPLIES = ['Got it, thanks.', 'Good question. I will look into it tonight.', 'Sounds right to me.', 'Can you share the latest numbers?', 'I can help with that this week.', 'Agreed. Let us write it down in the plan.'];
const REPLIES = [
  'Thanks for reaching out, your intro is exactly what we needed. Can you share a bit about what you have built before?',
  'Love this. Let us set up a quick call this week and map out where you can help first.',
  'Welcome aboard! I will add you to the project channel. Start with the open issues on the board.',
];

const cleanPeople = (list = []) => list.map((x) => x.name.trim()).filter(Boolean).map((name) => ({ name, userId: (users.find((u) => u.name.toLowerCase() === name.toLowerCase()) || {}).id || null }));

export function StoreProvider({ children, accountId }) {
  const [state, dispatch] = useReducer(reducer, accountId, load);
  const { toast, openModal } = useUI();
  const auth = useAuth();
  const skipSave = useRef(false);
  const ref = useRef(state);
  ref.current = state;
  applyProfile(state.profile);

  useLayoutEffect(() => { applyTheme(state.theme); }, [state.theme]);
  useEffect(() => {
    if (skipSave.current) return;
    try { localStorage.setItem(keyFor(accountId), JSON.stringify(state)); } catch { /* storage unavailable */ }
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
      comment: (key, text) => text.trim() && mk.moderate(text) && dispatch({ type: 'COMMENT', key, text: text.trim(), userId: ME }),
      view: (id) => dispatch({ type: 'VIEW', id }),
      markRead: (id) => dispatch({ type: 'READ', id }),
      markAllRead: () => dispatch({ type: 'READ_ALL' }),
      readConversation: (id) => dispatch({ type: 'CV_READ', id }),
      reset: () => { dispatch({ type: 'RESET', state: initialState(accountId) }); toast('Data reset'); },

      useTool: (id) => dispatch({ type: 'TOOL_USE', id }),
      dismissMicro: (id) => dispatch({ type: 'MICRO_SEEN', id }),

      sendMessage: (cvId, text, userId) => {
        if (!text.trim()) return;
        if (!mk.moderate(text)) return;
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
        if (!(amount >= 0.5)) { toast('The smallest contribution is $0.50.', { tone: 'danger' }); return null; }
        if (amount > sel.remainingToday(s)) { toast(`The daily limit is $${sel.dailyLimit(s)}. You can give ${cents(sel.remainingToday(s))} more today. It resets at midnight.`, { tone: 'danger', ms: 5500 }); return null; }
        const pm = s.payments.methods.find((m) => m.id === s.payments.defaultId) || s.payments.methods[0];
        const e = sel.entityOf(s, { type: targetType, id: targetId });
        const gate = sel.fundable(s, targetType, e);
        if (!gate.ok) { toast(gate.reasons[0], { tone: 'danger', ms: 5000 }); return null; }
        const r2 = (n) => +n.toFixed(2);
        let allocations;
        if (micro) {
          const proj0 = sel.projectById(s, e.projectId);
          const proj = proj0 && sel.fundable(s, 'project', proj0).ok ? proj0 : null;
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
          if (proj.ownerId !== ME && sel.backedTotal(next, proj.id) >= MEETING_MIN && !sel.activeMeeting(next, proj.id)) {
            result.meeting = true;
            result.meetingNew = sel.backedTotal(s, proj.id) < MEETING_MIN;
          }
        } else if (targetType === 'idea') {
          result.before = { funded: sel.fundedOf(s, 'idea', e), pct: sel.ideaPct(s, e) };
          result.after = { funded: sel.fundedOf(next, 'idea', e), pct: sel.ideaPct(next, e) };
          result.goal = e.goal;
        }
        dispatch({ type: 'CONTRIBUTE', entry });
        toast(`${cents(amount)} contributed to ${entry.label}`, { tone: 'success' });
        if (result.meetingNew) {
          dispatch({ type: 'NOTE', noteType: 'collab', text: `🤝 You unlocked a meeting with the founder of ${proj.title}. Request it now.`, to: `/project/${proj.id}?meeting=1` });
          toast(`Meeting unlocked with ${sel.userById(proj.ownerId).name}. Tap to request it.`, { tone: 'success', to: `/project/${proj.id}?meeting=1`, ms: 7000 });
        }
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

      sendCollab({ targetType, targetId, skill, message, role = 'Collaborator' }) {
        const s = ref.current;
        const e = sel.entityOf(s, { type: targetType, id: targetId });
        const ownerId = e.ownerId || e.authorId;
        const owner = sel.userById(ownerId);
        const cvId = `cv_${ownerId.replace('u_', '')}`;
        if (!mk.moderate(message || '')) return;
        if (sel.isBlocked(s, targetId, ME)) { toast('The founder is not accepting requests from you.', { tone: 'danger' }); return; }
        const id = uid('cr');
        dispatch({ type: 'COLLAB', request: { id, targetType, targetId, fromId: ME, role, skill, message, ts: Date.now(), status: 'pending' } });
        dispatch({ type: 'MSG', cvId, userId: ownerId, from: 'me', text: `Request to join ${sel.nameOf(e)} as ${role} (${skill}): ${message || 'Happy to help where useful.'}` });
        dispatch({ type: 'NOTE', noteType: 'collab', text: `Your request to join ${sel.nameOf(e)} as ${role} was sent to ${owner.name}. They decide.`, to: sel.collabPath(e) });
        toast(`Request sent to ${owner.name}`, { tone: 'success' });
        setTimeout(() => {
          const founder = role === 'Co-founder';
          dispatch({ type: 'MSG', cvId, userId: ownerId, from: 'them', text: founder ? 'Thanks for the offer. Co-founding is a big step, so let us talk first. When are you free this week?' : REPLIES[Math.floor(Math.random() * REPLIES.length)] });
          if (!founder) {
            dispatch({ type: 'COLLAB_DECIDE', id, status: 'accepted' });
            if (targetType === 'project') {
              const room = ref.current.rooms[targetId];
              dispatch({ type: 'ROOM_SET', projectId: targetId, room: room ? { ...room, members: [...new Set([...room.members, ME])] } : { name: `${sel.nameOf(e)} team room`, ownerId, members: [ownerId, ME], createdAt: Date.now(), messages: [{ id: uid('rm'), system: true, text: 'Room created by the founder.', ts: Date.now() }] } });
            }
          }
          dispatch({ type: 'NOTE', noteType: 'collab', text: founder ? `${owner.name} wants to talk before deciding on your co-founder request for ${sel.nameOf(e)}.` : `${owner.name} accepted you as ${role} on ${sel.nameOf(e)}.`, to: founder ? `/messages/${cvId}` : sel.collabPath(e) });
          toast(founder ? `${owner.name} wants to talk first` : `${owner.name} said yes! You joined ${sel.nameOf(e)}`, { tone: founder ? 'default' : 'success', to: sel.collabPath(e) });
        }, 5000);
      },
      decideCollab(id, status) {
        const r = ref.current.collabRequests.find((x) => x.id === id);
        const e = sel.entityOf(ref.current, { type: r.targetType, id: r.targetId });
        const who = sel.userById(r.fromId);
        dispatch({ type: 'COLLAB_DECIDE', id, status });
        toast(status === 'accepted' ? `${who.name} joined ${sel.nameOf(e)} as ${r.role}` : `Request from ${who.name} declined`, { tone: status === 'accepted' ? 'success' : 'default' });
      },

      arcadeWin(p) {
        const { gained, parts, capped, earned } = applyWin(ref.current.rewards, p);
        dispatch({ type: 'ARCADE_WIN', payload: p });
        earned.forEach((id) => { const x = ACHIEVEMENTS.find((q) => q.id === id); toast(`Achievement: ${x.emoji} ${x.name}`, { tone: 'success', to: '/rewards', ms: 5000 }); });
        return { gained, parts, capped };
      },
      gameSubmitted(g) {
        dispatch({ type: 'NOTE', noteType: 'badge', text: g.status === 'approved' ? `${g.title} was approved (${g.score}/100) and is live in Play & Learn.` : `${g.title} scored ${g.score}/100 and is waiting for a human reviewer.`, to: g.status === 'approved' ? `/cgame/${g.id}` : '/play' });
        toast(g.status === 'approved' ? 'Your game is live' : 'Sent for human review', { tone: 'success' });
      },
      communityWin(id, score) {
        const day = new Date().toISOString().slice(0, 10), r = ref.current.rewards, n = r.cg?.day === day ? (r.cg.counts[id] || 0) : 0;
        dispatch({ type: 'CG_WIN', id, day });
        if (n >= 3) return { gained: 0, limited: true };
        return mk.arcadeWin({ gameId: `cg_${id}`, flawless: false, score: Math.round(score || 1) });
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
      setLimit(n) { dispatch({ type: 'LIMIT', n }); toast(`Daily limit: $${n}`); },
      async publishPost({ type = 'post', text, tags = [], items = [], links = [], ref: r, extra }) {
        if (!mk.moderate(`${text} ${extra?.title || ''} ${extra?.changed || ''}`)) return null;
        const media = await saveAttachments(items);
        return mk.createPost({ type, text, tags, ref: r, extra, media, links });
      },
      async submitReview(projectId, m) {
        const s = ref.current;
        const proj = sel.projectById(s, projectId);
        const items = [...(m.deck ? [m.deck] : []), ...(m.videoItems || [])];
        const saved = await saveAttachments(items);
        const pages = m.deck?.kind === 'pdf' ? await pdfPages(m.deck.file) : 0;
        const mats = { ...m, deck: m.deck ? { name: m.deck.file.name, kind: m.deck.kind, size: m.deck.file.size, pages } : null, videoFiles: (m.videoItems || []).length, videoItems: undefined };
        const res = scoreProject(mats, { milestones: sel.milestonesOf(s, projectId) });
        const review = { score: res.score, status: res.pass ? 'approved' : 'not_approved', breakdown: res.breakdown, submittedAt: Date.now(), attempts: (s.reviews[projectId]?.attempts || 0) + 1, materials: { ...mats, readme: (m.readme || '').slice(0, 20000) }, media: saved };
        dispatch({ type: 'REVIEW', id: projectId, review });
        dispatch({ type: 'NOTE', noteType: 'milestone', text: res.pass ? `${proj.title} passed review with ${res.score}/100. Funding can open once your checklist is complete.` : `${proj.title} scored ${res.score}/100. You need ${THRESHOLD} to receive funds. See what to improve.`, to: `/funding/${projectId}` });
        return review;
      },
      setIdentity(identity) { dispatch({ type: 'IDENTITY', identity }); toast(identity.status === 'verified' ? 'Identity verified' : 'Verification did not pass', { tone: identity.status === 'verified' ? 'success' : 'danger' }); },
      connectPayout() { dispatch({ type: 'PAYOUT', payout: { connected: true, label: 'Sandbox payout account', connectedAt: Date.now() } }); toast('Payout account connected (sandbox)', { tone: 'success' }); },
      reportProject(projectId, reason) { dispatch({ type: 'REPORT', report: { id: uid('rp'), projectId, reason, ts: Date.now() } }); toast('Thanks. A human reviewer will take a look.', { tone: 'success' }); },
      /* returns true when the text may be posted. Directed abuse is blocked and counts as a strike. */
      moderate(text) {
        const r = classify(text);
        if (r.level === 0) return true;
        if (r.level === 1) { toast('Heads up: strong language. Keep it kind and it is fine to be direct.'); return true; }
        const s = ref.current;
        const now = Date.now();
        const recent = s.conduct.strikes.filter((x) => now - x.ts < STRIKE_WINDOW_DAYS * 86400000);
        dispatch({ type: 'STRIKE', strike: { ts: now, level: r.level, reason: r.reason } });
        const count = recent.length + 1;
        const repeat = (s.conduct.suspensions || 0) >= 1;
        if (r.level === 3 || count >= 3) {
          if (repeat) {
            const refunds = sel.allProjects(s).filter((p) => p.ownerId === ME && sel.fundedOf(s, 'project', p) > 0).map((p) => ({ title: p.title, amount: sel.fundedOf(s, 'project', p) }));
            setBan(accountId, { permanent: true, reason: r.reason, at: now, refunds });
            skipSave.current = true;
            try { localStorage.removeItem(keyFor(accountId)); } catch { /* ignore */ }
          } else {
            dispatch({ type: 'SUSPENDED' });
            setBan(accountId, { permanent: false, until: now + SUSPENSION_DAYS * 86400000, reason: r.reason, at: now });
          }
          auth.applyBan();
          return false;
        }
        toast(`That cannot be posted: ${r.reason.toLowerCase()}. Strike ${count} of 3 in ${STRIKE_WINDOW_DAYS} days. A third strike suspends your account for ${SUSPENSION_DAYS} days.`, { tone: 'danger', ms: 7000 });
        return false;
      },
      saveDraft: (draft) => dispatch({ type: 'DRAFT', draft }),
      async submitApplication(app, items) {
        if (!mk.moderate([app.title, app.tagline, app.about, app.problem, app.approach, app.experiments, app.risks].join(' '))) return null;
        const media = await saveAttachments(items);
        const id = `p_${uid('n')}`;
        const budget = app.budget.map((b) => ({ item: b.item.trim(), amount: Number(b.amount), why: b.why.trim() }));
        const askTotal = sel.budgetTotal(budget);
        const milestones = app.milestones.map((m) => ({ id: uid('m'), projectId: id, title: m.title.trim(), needed: Number(m.amount), unlocks: m.unlocks.trim(), evidence: m.evidence.trim() }));
        const needs = app.needs.split(',').map((x) => x.trim()).filter(Boolean);
        const links = [app.github, app.website, app.youtube].map((u) => parseLink(u)).filter(Boolean);
        const founders = cleanPeople(app.founders), cofounders = cleanPeople(app.cofounders);
        const teamFrom = (list, role) => list.filter((x) => x.userId && x.userId !== ME).map((x) => ({ userId: x.userId, role }));
        const entity = { id, title: app.title.trim(), tagline: app.tagline.trim(), kind: 'Project', status: 'Just started', category: app.category, subs: [], tags: app.tags, about: app.about.trim(), problem: app.problem.trim(), audience: app.audience.trim(), approach: app.approach.trim(), experiments: app.experiments.trim(), timeline: app.timeline.trim(), success: app.success.trim(), risks: app.risks.trim(), team: [{ userId: ME, role: 'Founder' }, ...teamFrom(founders.slice(1), 'Founder'), ...teamFrom(cofounders, 'Co-founder')], founders, cofounders, needs, looking: needs.map((n) => ({ skill: n, open: true })), ownerId: ME, funded: 0, followers: 0, progress: [{ label: 'Planning', pct: 5 }], budget, askTotal, fundingLocked: true, lockedAt: Date.now(), media, links };
        const post = { id: uid('s'), type: 'post', authorId: ME, ts: Date.now(), text: `Started a new project: ${entity.title}. ${entity.tagline}`, tags: app.tags, likes: 0, comments: 0, ref: { type: 'project', id }, media, links, createdByMe: true };
        dispatch({ type: 'CREATE', kind: 'project', entity, milestones, post });
        dispatch({ type: 'ROOM_SET', projectId: id, room: { name: `${entity.title} team room`, ownerId: ME, members: [ME], createdAt: Date.now(), messages: [{ id: uid('rm'), system: true, text: 'Room created. Add the collaborators you trust.', ts: Date.now() }] } });
        dispatch({ type: 'DRAFT', draft: null });
        toast('Project posted. Next: verify and request funding.', { tone: 'success' });
        return id;
      },
      async updateProject(id, patch, items = [], money) {
        if (!mk.moderate([patch.title, patch.tagline, patch.about, patch.problem, patch.approach, patch.experiments, patch.risks].filter(Boolean).join(' '))) return false;
        const saved = await saveAttachments(items);
        const cur = sel.projectById(ref.current, id);
        dispatch({ type: 'PROJECT_EDIT', id, patch: { ...patch, ...(saved.length ? { media: [...(cur.media || []), ...saved] } : {}) } });
        if (money) dispatch({ type: 'PROJECT_MONEY', id, patch: { budget: money.budget, askTotal: money.askTotal, fundingLocked: true, lockedAt: Date.now() }, milestones: money.milestones });
        toast('Project updated', { tone: 'success' });
      },
      withdrawFunding(id) {
        const p = sel.projectById(ref.current, id);
        if (sel.fundedOf(ref.current, 'project', p) > 0) { toast('Money has already been raised, so the funding terms stay locked.', { tone: 'danger' }); return false; }
        dispatch({ type: 'FUNDING_UNLOCK', id });
        toast('Funding terms unlocked. Review the numbers and submit again.');
        return true;
      },
      requestMeeting(projectId, d) {
        const s = ref.current;
        const p = sel.projectById(s, projectId);
        if (!sel.canRequestMeeting(s, p)) { toast('Meetings unlock after you back a project with $500.', { tone: 'danger' }); return false; }
        const id = uid('mt');
        const meeting = { id, projectId, backerId: ME, founderId: p.ownerId, topic: d.topic, message: d.message, duration: d.duration, format: d.format, place: '', slots: d.slots, proposedBy: ME, turn: p.ownerId, status: 'negotiating', final: null, createdAt: Date.now(), history: [{ by: ME, type: 'propose', ts: Date.now() }] };
        dispatch({ type: 'MEETING_SET', meeting });
        dispatch({ type: 'NOTE', noteType: 'collab', text: `Meeting request sent to ${sel.userById(p.ownerId).name} for ${p.title}.`, to: '/meetings' });
        toast('Meeting request sent', { tone: 'success' });
        setTimeout(() => {
          const cur = ref.current.meetings.find((m) => m.id === id);
          if (!cur || cur.status !== 'negotiating') return;
          const shift = (iso, h) => new Date(new Date(iso).getTime() + h * 3600000).toISOString();
          const counter = { ...cur, slots: [shift(cur.slots[0], 24), shift(cur.slots[0], 26), shift(cur.slots[0], 48)], place: cur.format === 'Video call' ? `https://meet.example.com/${sel.collabSlug(p)}` : cur.format === 'In person' ? 'A coffee shop near me, I will send the address' : '', proposedBy: p.ownerId, turn: ME, note: 'Those times are tight for me, how about one of these?', history: [...cur.history, { by: p.ownerId, type: 'counter', ts: Date.now() }] };
          dispatch({ type: 'MEETING_SET', meeting: counter });
          dispatch({ type: 'NOTE', noteType: 'collab', text: `${sel.userById(p.ownerId).name} suggested new times for your meeting about ${p.title}.`, to: '/meetings' });
          toast(`${sel.userById(p.ownerId).name} suggested new times`, { to: '/meetings' });
        }, 5000);
        return true;
      },
      respondMeeting(id, kind, d = {}) {
        const m = ref.current.meetings.find((x) => x.id === id);
        const p = sel.projectById(ref.current, m.projectId);
        const other = m.backerId === ME ? m.founderId : m.backerId;
        const done = (meeting, text) => { dispatch({ type: 'MEETING_SET', meeting }); toast(text, { tone: kindTone(kind) }); };
        const hist = (type) => [...m.history, { by: ME, type, ts: Date.now() }];
        if (kind === 'accept') {
          const place = d.place ?? m.place;
          done({ ...m, status: 'confirmed', turn: null, place, final: { slot: d.slot, place }, history: hist('accept') }, 'Meeting confirmed');
          dispatch({ type: 'NOTE', noteType: 'collab', text: `Meeting with ${sel.userById(other).name} confirmed for ${p.title}.`, to: '/meetings' });
        } else if (kind === 'counter') {
          const next = { ...m, slots: d.slots, place: d.place ?? m.place, proposedBy: ME, turn: other, note: d.note || '', history: hist('counter') };
          done(next, 'New times sent');
          if (m.founderId === ME) setTimeout(() => {
            const cur = ref.current.meetings.find((x) => x.id === id);
            if (!cur || cur.status !== 'negotiating' || cur.turn !== other) return;
            dispatch({ type: 'MEETING_SET', meeting: { ...cur, status: 'confirmed', turn: null, final: { slot: cur.slots[0], place: cur.place }, history: [...cur.history, { by: other, type: 'accept', ts: Date.now() }] } });
            dispatch({ type: 'NOTE', noteType: 'collab', text: `${sel.userById(other).name} accepted ${fmtSlot(cur.slots[0])}. Your meeting about ${p.title} is confirmed.`, to: '/meetings' });
            toast(`${sel.userById(other).name} accepted. Meeting confirmed`, { tone: 'success', to: '/meetings' });
          }, 4000);
        } else if (kind === 'decline') done({ ...m, status: 'declined', turn: null, history: hist('decline') }, 'Request declined');
        else if (kind === 'cancel') done({ ...m, status: 'cancelled', turn: null, history: hist('cancel') }, 'Meeting cancelled');
      },
      hideComment: (id) => { dispatch({ type: 'HIDE_COMMENT', id }); toast('Comment hidden'); },
      blockUser(projectId, userId) { dispatch({ type: 'BLOCK', projectId, userId }); toast(`${sel.userById(userId).name} can no longer join, comment or see the room`); },
      unblockUser(projectId, userId) { dispatch({ type: 'UNBLOCK', projectId, userId }); toast('Unblocked'); },
      createRoom(projectId) {
        const p = sel.projectById(ref.current, projectId);
        dispatch({ type: 'ROOM_SET', projectId, room: { name: `${p.title} team room`, ownerId: ME, members: [ME], createdAt: Date.now(), messages: [{ id: uid('rm'), system: true, text: 'Room created. Add the collaborators you trust.', ts: Date.now() }] } });
      },
      addRoomMember(projectId, userId) {
        const r = ref.current.rooms[projectId];
        if (!r || r.ownerId !== ME || r.members.includes(userId) || sel.isBlocked(ref.current, projectId, userId)) return;
        dispatch({ type: 'ROOM_SET', projectId, room: { ...r, members: [...r.members, userId], messages: [...r.messages, { id: uid('rm'), system: true, text: `${sel.userById(userId).name} was added to the room`, ts: Date.now() }] } });
        toast(`${sel.userById(userId).name} added`);
      },
      removeRoomMember(projectId, userId, block) {
        const r = ref.current.rooms[projectId];
        if (!r || r.ownerId !== ME || userId === ME) return;
        dispatch({ type: 'ROOM_SET', projectId, room: { ...r, members: r.members.filter((m) => m !== userId), messages: [...r.messages, { id: uid('rm'), system: true, text: `${sel.userById(userId).name} was removed from the room`, ts: Date.now() }] } });
        if (block) mk.blockUser(projectId, userId); else toast(`${sel.userById(userId).name} removed from the room`);
      },
      leaveRoom(projectId) {
        const r = ref.current.rooms[projectId];
        if (!r || r.ownerId === ME) return;
        dispatch({ type: 'ROOM_SET', projectId, room: { ...r, members: r.members.filter((m) => m !== ME), messages: [...r.messages, { id: uid('rm'), system: true, text: `${sel.userById(ME).name} left the room`, ts: Date.now() }] } });
        toast('You left the room');
      },
      sendRoomMessage(projectId, text) {
        const r = ref.current.rooms[projectId];
        if (!r || !r.members.includes(ME) || !text.trim() || !mk.moderate(text)) return;
        dispatch({ type: 'ROOM_SET', projectId, room: { ...r, messages: [...r.messages, { id: uid('rm'), from: ME, text: text.trim(), ts: Date.now() }] } });
        const others = r.members.filter((m) => m !== ME);
        if (others.length) setTimeout(() => {
          const cur = ref.current.rooms[projectId];
          if (!cur) return;
          const from = others.filter((m) => cur.members.includes(m))[Math.floor(Math.random() * others.length)];
          if (!from) return;
          dispatch({ type: 'ROOM_SET', projectId, room: { ...cur, messages: [...cur.messages, { id: uid('rm'), from, text: ROOM_REPLIES[Math.floor(Math.random() * ROOM_REPLIES.length)], ts: Date.now() }] } });
        }, 2600);
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
        const entity = { id, title: 'Community challenge', emoji: '🏆', skill: 'community challenge', sourceType: 'community', topic: d.category, takeaway: (d.explanation.match(/[^.!?]+[.!?]*/) || [d.explanation])[0].trim(), authorId: ME, ...d };
        dispatch({ type: 'CREATE', kind: 'challenge', entity });
        toast('Challenge published', { tone: 'success' });
        return id;
      },
      deletePost(id) {
        const post = sel.postById(ref.current, id);
        if (!post || !sel.canDeletePost(post)) { toast('Project and funding posts cannot be erased.', { tone: 'danger' }); return false; }
        dispatch({ type: 'POST_DELETE', id });
        toast('Post erased', { tone: 'success' });
        return true;
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
