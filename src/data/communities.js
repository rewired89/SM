export const communities = [
  { id: 'c_aibuilders', name: 'AI Builders', members: 18421, about: 'People building useful AI systems. Show your work, ask the awkward questions, find a co-builder.', projects: 12, people: 4800, events: 3, tags: ['AI', 'OpenSource'], hue: 262, ownerId: 'u_alex', discussions: [
    { id: 'd1', title: 'What local model are you running?', authorId: 'u_jun', replies: 112 },
    { id: 'd2', title: 'Best way to handle RAG on messy PDFs?', authorId: 'u_priya', replies: 64 },
    { id: 'd3', title: 'Show me what you are building.', authorId: 'u_alex', replies: 203 } ] },
  { id: 'c_indie', name: 'Indie Hackers', members: 9310, about: 'Small teams shipping real things. Pricing, launches, burnout and everything between.', projects: 8, people: 2900, events: 2, tags: ['OpenSource'], hue: 38, ownerId: 'u_nadia', discussions: [
    { id: 'd4', title: 'How do you price something people want to try for free?', authorId: 'u_nadia', replies: 48 },
    { id: 'd5', title: 'First 10 users: where did they come from?', authorId: 'u_tomas', replies: 91 } ] },
  { id: 'c_cyber', name: 'Cybersecurity', members: 12604, about: 'Defence, privacy and honest threat models. Beginners welcome, no gatekeeping.', projects: 9, people: 3600, events: 4, tags: ['Cybersecurity', 'Privacy'], hue: 5, ownerId: 'u_marcus', discussions: [
    { id: 'd6', title: 'Show me your home lab threat model.', authorId: 'u_marcus', replies: 77 },
    { id: 'd7', title: 'Is a hardware key worth it for a small team?', authorId: 'u_dayana', replies: 35 } ] },
  { id: 'c_robotics', name: 'Robotics', members: 7742, about: 'Motors, sensors and the occasional smoke test. Share builds, ask for parts advice.', projects: 7, people: 2200, events: 2, tags: ['Robotics', 'Hardware'], hue: 190, ownerId: 'u_maya', discussions: [
    { id: 'd8', title: 'Cheapest reliable depth sensor right now?', authorId: 'u_maya', replies: 40 },
    { id: 'd9', title: 'Best way to run vision models on a microcontroller?', authorId: 'u_kofi', replies: 58 } ] },
  { id: 'c_bioeng', name: 'Bioengineering', members: 4120, about: 'Wet lab and computational folks comparing notes, protocols and failed experiments.', projects: 5, people: 1300, events: 1, tags: ['Biology', 'Research'], hue: 140, ownerId: 'u_dayana', discussions: [
    { id: 'd10', title: 'Cheapest way to log temperature in a DIY incubator?', authorId: 'u_ines', replies: 29 },
    { id: 'd11', title: 'Bioelectric signalling reading list', authorId: 'u_dayana', replies: 52 } ] },
  { id: 'c_gamedev', name: 'Game Development', members: 10278, about: 'Prototype, playtest, polish. Jams, devlogs and honest feedback.', projects: 11, people: 3100, events: 5, tags: ['Games'], hue: 48, ownerId: 'u_tomas', discussions: [
    { id: 'd12', title: 'How do you playtest a game about darkness?', authorId: 'u_tomas', replies: 37 },
    { id: 'd13', title: 'Licensing indie music on a tiny budget', authorId: 'u_sora', replies: 44 } ] },
  { id: 'c_openscience', name: 'Open Science', members: 6015, about: 'Open data, open protocols and open papers. Fewer paywalls, more reproducibility.', projects: 6, people: 1900, events: 2, tags: ['Research', 'OpenSource'], hue: 90, ownerId: 'u_oliver', discussions: [
    { id: 'd14', title: 'What would make you publish your raw data?', authorId: 'u_oliver', replies: 83 },
    { id: 'd15', title: 'Preprint feedback swap', authorId: 'u_priya', replies: 26 } ] },
];

export const topTags = ['Bioelectricity', 'AI', 'Robotics', 'Cybersecurity', 'Biology', 'Research', 'OpenSource', 'Hardware', 'Space', 'Games', 'Privacy', 'Music'];

export const categoryTree = {
  Ideas: [], Projects: [],
  AI: ['AI Tools', 'AI Agents', 'Models', 'Prompts', 'AI Experiments', 'AI Projects', 'AI Research'],
  Science: ['Biology', 'Physics', 'Chemistry', 'Neuroscience', 'Space', 'Robotics', 'Computational Science'],
  Technology: ['Cybersecurity', 'Software', 'Hardware', 'Robotics', 'Networking', 'Privacy', 'Infrastructure'],
  Creative: ['Art', 'Music', 'Games', 'Writing', 'Film', 'Design'],
};
