import { notificationsSeed, conversationsSeed } from '../data/social.js';
import { minsAgoToTs } from '../lib/format.js';
import { seedLearn } from '../lib/learn.js';
import { seedRewards } from '../lib/rewards.js';

const seedContributions = () => {
  const direct = (type, id, label, n) => Array.from({ length: n }, () => ({ type, id, label }));
  const targets = [
    ...direct('project', 'p_aurora', 'Project Aurora', 6),
    ...direct('project', 'p_acheron', 'Acheron', 5),
    ...direct('tool', 't_research', 'Research AI', 3),
    ...direct('project', 'p_robotlab', 'RobotLab', 2),
    ...direct('project', 'p_nyx', 'Nyx', 2),
    ...direct('project', 'p_hearthlight', 'Hearthlight', 2),
    ...direct('project', 'p_petripal', 'Petri-Pal', 1),
    ...direct('project', 'p_openmesh', 'OpenMesh', 1),
    ...direct('tool', 't_logwhisper', 'Log Whisperer', 1),
    ...direct('tool', 't_promptlint', 'Prompt Linter', 1),
    ...direct('tool', 't_levelsketch', 'Level Sketch', 1),
  ];
  return targets.map((t, i) => ({
    id: `seed${i}`, ts: minsAgoToTs(60 * 24 * (1 + i)), kind: 'direct', targetType: t.type, targetId: t.id, label: t.label, amount: 0.5,
    allocations: [{ type: t.type, id: t.id, label: t.label, amount: 0.5 }],
  })).reverse();
};

import { users } from '../data/users.js';

const meU = users.find((u) => u.id === 'u_dayana');
const seedProfile = () => ({ name: meU.name, handle: meU.handle, bio: meU.bio, location: meU.location, avatar: null, skills: [...meU.skills], interests: [...meU.interests], career: { ...meU.career, studying: '' }, socials: { ...meU.socials }, openToCollab: meU.openToCollab, collabTypes: [...meU.collabTypes] });

const demoState = () => ({
  v: 1,
  wallet: 20,
  rooms: {
    p_acheron: { name: 'Acheron team room', ownerId: 'u_dayana', members: ['u_dayana', 'u_priya', 'u_maya'], createdAt: minsAgoToTs(3000), messages: [
      { id: 'rm1', from: 'u_dayana', text: 'Welcome! This room is for the people actually helping build Acheron. Ask me anything about the plan.', ts: minsAgoToTs(2900) },
      { id: 'rm2', from: 'u_priya', text: 'Can you share the replica counts you used for the 91% run?', ts: minsAgoToTs(1500) },
      { id: 'rm3', from: 'u_maya', text: 'I can port the simulation loop to run faster this weekend.', ts: minsAgoToTs(400) },
    ] },
    p_hsip: { name: 'HSIP team room', ownerId: 'u_dayana', members: ['u_dayana', 'u_marcus'], createdAt: minsAgoToTs(2000), messages: [{ id: 'rm4', from: 'u_marcus', text: 'Update signing is the gap. I will draft a threat model note.', ts: minsAgoToTs(300) }] },
  },
  blocks: {}, hiddenComments: [], appDraft: null, projectEdits: {},
  reviews: {},
  identity: { status: 'verified', checkedAt: Date.now() - 20 * 86400000, vendorRef: 'sbx_demo_account', reason: '' },
  payout: { connected: true, label: 'Sandbox payout account', connectedAt: Date.now() - 20 * 86400000 },
  reports: [],
  theme: 'sky',
  profile: seedProfile(),
  payments: { methods: [], defaultId: null },
  dailyLimit: 500,
  conduct: { strikes: [], suspensions: 0 },
  meetings: (() => {
    const at = (days, h, m = 0) => { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(h, m, 0, 0); return d.toISOString(); };
    return [
      { id: 'mt_s1', projectId: 'p_acheron', backerId: 'u_ines', founderId: 'u_dayana', topic: 'Explore working together', message: 'I backed Acheron with $500 because I can run a pilot with cultured networks. Could we talk through the voltage protocol?', duration: 30, format: 'Video call', place: '', slots: [at(1, 10), at(2, 15), at(3, 11, 30)], proposedBy: 'u_ines', turn: 'u_dayana', status: 'negotiating', final: null, createdAt: minsAgoToTs(180), history: [{ by: 'u_ines', type: 'propose', ts: minsAgoToTs(180) }] },
      { id: 'mt_s2', projectId: 'p_hsip', backerId: 'u_marcus', founderId: 'u_dayana', topic: 'Ask questions about the work', message: 'Quick sync on the update signing design.', duration: 30, format: 'Video call', place: 'https://meet.example.com/hsip-sync', slots: [at(4, 9)], proposedBy: 'u_dayana', turn: null, status: 'confirmed', final: { slot: at(4, 9), place: 'https://meet.example.com/hsip-sync' }, createdAt: minsAgoToTs(1500), history: [{ by: 'u_marcus', type: 'propose', ts: minsAgoToTs(1500) }, { by: 'u_dayana', type: 'counter', ts: minsAgoToTs(1400) }, { by: 'u_marcus', type: 'accept', ts: minsAgoToTs(1300) }] },
    ];
  })(),
  learn: seedLearn(),
  rewards: seedRewards(),
  ambient: true,
  following: ['user:u_maya', 'user:u_alex', 'project:p_robotlab'],
  liked: ['s3'],
  saved: [],
  joined: ['c_bioeng', 'c_cyber'],
  interested: ['i_notebook'],
  deltas: {},
  contributions: seedContributions(),
  comments: {},
  notifications: notificationsSeed.map((n) => ({ ...n, ts: minsAgoToTs(n.m) })),
  conversations: conversationsSeed.map((c) => ({ ...c, messages: c.messages.map((m) => ({ ...m, ts: minsAgoToTs(m.m) })) })),
  createdPosts: [],
  created: { projects: [], ideas: [], tools: [], communities: [], milestones: [], challenges: [] },
  collabRequests: [
    { id: 'cr_s1', targetType: 'project', targetId: 'p_acheron', fromId: 'u_maya', role: 'Collaborator', skill: 'Python developer', message: 'I work with Python and robotics. I would love to help with the simulation.', ts: minsAgoToTs(60), status: 'pending' },
    { id: 'cr_s2', targetType: 'project', targetId: 'p_hsip', fromId: 'u_marcus', role: 'Co-founder', skill: 'Security researcher', message: 'I have been threat modeling HSIP for weeks. I would like to co-own it with you.', ts: minsAgoToTs(215), status: 'pending' },
    { id: 'cr_s3', targetType: 'idea', targetId: 'i_bioelectric', fromId: 'u_ines', role: 'Advisor', skill: 'Biology researcher', message: 'I can run a pilot with cultured networks if you share a voltage protocol.', ts: minsAgoToTs(400), status: 'pending' },
  ],
  toolUses: {},
  microSeen: {},
  viewed: [],
  creatorUpdated: [],
});

const blankLearn = () => ({ xp: 0, stats: {}, topics: {}, maybes: 0, protections: 0, dailyCount: 0, plays: {}, seen: [], lessons: [], badges: [], daily: { date: '', done: false } });

/* a brand new account starts empty: no history, no contributions, nothing followed */
const freshState = (accountId) => {
  const u = users.find((x) => x.id === accountId);
  return {
    ...demoState(),
    profile: { name: u.name, handle: u.handle, bio: '', location: '', avatar: null, skills: [], interests: [], career: null, socials: {}, openToCollab: false, collabTypes: [] },
    following: [], liked: [], saved: [], joined: [], interested: [], deltas: {}, contributions: [], comments: {},
    notifications: [{ id: 'n_welcome', type: 'follow', text: 'Welcome to Nomi! Set up your profile, then explore a project or play a quick game.', to: '/settings', ts: Date.now(), read: false }],
    rooms: {}, blocks: {}, hiddenComments: [], appDraft: null, projectEdits: {},
    meetings: [], conduct: { strikes: [], suspensions: 0 },
    conversations: [], createdPosts: [], created: { projects: [], ideas: [], tools: [], communities: [], milestones: [], challenges: [] },
    collabRequests: [], toolUses: {}, microSeen: {}, viewed: [], creatorUpdated: [],
    learn: blankLearn(), rewards: seedRewards(),
    identity: { status: 'none', checkedAt: 0, vendorRef: '', reason: '' }, payout: { connected: false }, reviews: {}, reports: [],
    payments: { methods: [], defaultId: null },
  };
};

export const initialState = (accountId = 'u_dayana') => (accountId === 'u_dayana' ? demoState() : freshState(accountId));
