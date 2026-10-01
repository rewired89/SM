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

export const initialState = () => ({
  v: 1,
  wallet: 20,
  theme: 'sky',
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
  collabRequests: [],
  toolUses: {},
  microSeen: {},
  viewed: [],
  creatorUpdated: [],
});
