const N = (id, type, m, text, to, read = false) => ({ id, type, m, text, to, read });

export const notificationsSeed = [
  N('n1', 'comment', 12, 'Maya Chen commented on your project Acheron.', '/project/p_acheron'),
  N('n2', 'join', 38, 'Someone joined your community Bioengineering. 4,120 members now.', '/community/c_bioeng'),
  N('n3', 'interest', 75, 'Your idea Bioelectric Memory reached 100 interested people.', '/idea/i_bioelectric'),
  N('n4', 'update', 130, 'A project you follow posted an update: RobotLab, day 48.', '/project/p_robotlab'),
  N('n5', 'milestone', 190, 'Your contribution helped complete a milestone: RobotLab second camera module.', '/project/p_robotlab'),
  N('n6', 'collab', 260, 'Marcus Bell wants to collaborate on HSIP.', '/messages/cv_marcus'),
  N('n7', 'tool', 340, 'Your AI tool Sim Summarizer was used 20 times today.', '/ai/t_simsum'),
  N('n8', 'comment', 410, 'Priya Raman replied to your question about error correction.', '/profile'),
  N('n9', 'follow', 480, 'Lena Fischer started following Acheron.', '/project/p_acheron'),
  N('n10', 'update', 560, 'Alex Okafor posted an update on Project Aurora.', '/project/p_aurora'),
  N('n11', 'support', 640, 'Someone supported Nyx with $1. Funding is now 62%.', '/project/p_nyx', true),
  N('n12', 'comment', 720, 'Inés Duarte commented on your idea Bioelectric Memory.', '/idea/i_bioelectric', true),
  N('n13', 'join', 800, 'Five people joined AI Builders from your recommendation.', '/community/c_aibuilders', true),
  N('n14', 'collab', 900, 'Kofi Mensah offered hardware advice on Acheron.', '/messages/cv_kofi', true),
  N('n15', 'tool', 1000, 'Your AI tool Sim Summarizer got a 5 star rating.', '/ai/t_simsum', true),
  N('n16', 'milestone', 1200, 'HSIP reached 34% of its audit milestone.', '/project/p_hsip', true),
  N('n17', 'interest', 1300, 'Three more people are interested in Bioelectric Memory.', '/idea/i_bioelectric', true),
  N('n18', 'update', 1500, 'Tomás Herrera posted an update on Hearthlight.', '/project/p_hearthlight', true),
  N('n19', 'follow', 1700, 'Sora Tanaka followed you.', '/u/u_sora', true),
  N('n20', 'comment', 2000, 'Oliver Strand mentioned you in Open Science.', '/community/c_openscience', true),
];

const M = (from, text, m) => ({ from, text, m });

export const conversationsSeed = [
  { id: 'cv_maya', userId: 'u_maya', unread: 1, messages: [M('them', 'Hey! I saw your project.', 62), M('them', 'I work with Python and robotics. I would love to help with the simulation.', 60)] },
  { id: 'cv_marcus', userId: 'u_marcus', unread: 1, messages: [M('them', 'Your HSIP threat model has a gap around update signing.', 240), M('me', 'Good catch. Want to pair on it this week?', 220), M('them', 'Yes. I can do Thursday. Collab request sent on the project page.', 215)] },
  { id: 'cv_alex', userId: 'u_alex', unread: 0, messages: [M('me', 'Aurora evals look great. Can I use Research Assistant for Acheron papers?', 900), M('them', 'Of course, it is free. If it helps, an optional $0.50 goes to compute.', 880)] },
  { id: 'cv_priya', userId: 'u_priya', unread: 0, messages: [M('them', 'Would you share the Acheron stability numbers? I want to compare with spindle models.', 1300), M('me', 'Sending the CSV tomorrow.', 1290)] },
  { id: 'cv_ines', userId: 'u_ines', unread: 1, messages: [M('them', 'I can run a pilot with cultured networks if you give me the voltage protocol.', 1500)] },
  { id: 'cv_kofi', userId: 'u_kofi', unread: 0, messages: [M('them', 'Cheap electrodes: try the 0.3mm silver wire from the Petri-Pal parts list.', 1700), M('me', 'That saves me a fortune. Thank you.', 1690)] },
  { id: 'cv_lena', userId: 'u_lena', unread: 0, messages: [M('them', 'Do you know any Rust developers who like security?', 2000)] },
  { id: 'cv_tomas', userId: 'u_tomas', unread: 0, messages: [M('them', 'Playtest invite for Hearthlight is out. Tell me if the lanterns feel too dim.', 2400)] },
  { id: 'cv_nadia', userId: 'u_nadia', unread: 0, messages: [M('them', 'Sent a redesign of the Nyx onboarding. Check the mockups when you can.', 2900), M('me', 'Looks excellent. Shipping it in beta 3.', 2850)] },
  { id: 'cv_oliver', userId: 'u_oliver', unread: 0, messages: [M('them', 'Would you review the open notebook protocol draft? You think in versions.', 3200)] },
];

export const commentsSeed = {
  'project:p_acheron': [{ id: 'cs1', userId: 'u_maya', text: 'The repair curve in the latest run is wild. Is the replica count fixed at 3?', m: 120 }, { id: 'cs2', userId: 'u_priya', text: 'Happy to cross-check with my spindle data once you share the numbers.', m: 95 }],
  'project:p_aurora': [{ id: 'cs3', userId: 'u_nadia', text: 'The training log page is a joy to read.', m: 300 }],
  'idea:i_bioelectric': [{ id: 'cs4', userId: 'u_ines', text: 'I can run a pilot with cultured networks if someone shares a voltage protocol.', m: 400 }, { id: 'cs5', userId: 'u_priya', text: 'What is the expected retention window? Hours, days, longer?', m: 380 }, { id: 'cs6', userId: 'u_dayana', text: 'Simulation says days at 91% stability. Wet-lab data is the missing piece.', m: 360 }],
  'idea:i_dropbox': [{ id: 'cs7', userId: 'u_alex', text: 'Have you looked at anonymous credentials? Might simplify the proof step.', m: 700 }],
  'post:s1': [{ id: 'cs8', userId: 'u_kofi', text: 'No cloud and three objects? That is the right direction.', m: 20 }, { id: 'cs9', userId: 'u_alex', text: 'Which quantisation scheme did you land on?', m: 15 }],
  'post:s6': [{ id: 'cs10', userId: 'u_dayana', text: 'age plus OS keychain for the master key works nicely in Nyx.', m: 300 }],
  'disc:d1': [{ id: 'cs11', userId: 'u_jun', text: 'Running a 7B on a mini PC. Good enough for summaries.', m: 500 }],
};
