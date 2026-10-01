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

import { users, ME } from '../data/users.js';

const meU = users.find((u) => u.id === ME);
const seedProfile = () => ({ name: meU.name, handle: meU.handle, bio: meU.bio, location: meU.location, avatar: null, skills: [...meU.skills], interests: [...meU.interests], career: { ...meU.career, studying: '' }, socials: { ...meU.socials }, openToCollab: meU.openToCollab, collabTypes: [...meU.collabTypes] });

export const initialState = () => ({
  v: 1,
  wallet: 20,
  theme: 'sky',
  profile: seedProfile(),
  payments: { methods: [], defaultId: null },
  monthlyLimit: 20,
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
