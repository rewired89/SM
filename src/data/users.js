const U = (id, name, handle, headline, skills, bio, hue, location) => ({ id, name, handle, headline, skills, bio, hue, location });

export const ME = 'u_dayana';

export const users = [
  U('u_dayana', 'Dayana', 'rewired', ['Cybersecurity', 'Bioinformatics', 'AI'], ['Cybersecurity', 'Python', 'AI', 'Research', 'Bioinformatics'], 'Security engineer by day, bioelectricity nerd by night. Building ways to keep information alive in strange places.', 28, 'Miami, FL'),
  U('u_maya', 'Maya Chen', 'mayabuilds', ['Robotics', 'Embedded', 'Computer Vision'], ['Python', 'Robotics', 'C++', 'Computer Vision'], 'Making small robots that think for themselves, no cloud required.', 190, 'Vancouver, CA'),
  U('u_alex', 'Alex Okafor', 'alexo', ['AI Tools', 'NLP', 'Open Source'], ['Python', 'NLP', 'ML Ops', 'Technical Writing'], 'I build boring-but-useful AI tools for researchers. Local-first whenever possible.', 262, 'Lagos, NG'),
  U('u_priya', 'Priya Raman', 'priyar', ['Neuroscience', 'Data Science'], ['Python', 'Statistics', 'Neuroscience', 'R'], 'Computational neuroscientist. Sleep, memory, and open datasets.', 330, 'Bangalore, IN'),
  U('u_tomas', 'Tomás Herrera', 'tomash', ['Game Dev', 'Pixel Art'], ['Unity', 'Game Design', 'Pixel Art', 'C#'], 'Indie dev making cozy games with too much lighting.', 48, 'Madrid, ES'),
  U('u_lena', 'Lena Fischer', 'lenaf', ['Space', 'Orbital Mechanics'], ['Rust', 'Orbital Mechanics', 'RF', 'Python'], 'Tracking small satellites with cheap antennas and stubbornness.', 215, 'Munich, DE'),
  U('u_kofi', 'Kofi Mensah', 'kofi', ['Hardware', 'Open Source'], ['Electronics', 'CAD', 'Firmware', 'Sourcing'], 'Open-hardware tinkerer. If it costs over $40, I try to redesign it.', 12, 'Accra, GH'),
  U('u_sora', 'Sora Tanaka', 'sorat', ['Music', 'Generative Art'], ['Composition', 'SuperCollider', 'Data Sonification'], 'Composer turning data into music people can feel.', 300, 'Osaka, JP'),
  U('u_ines', 'Inés Duarte', 'inesd', ['Bioengineering', 'Wet Lab'], ['Cell Culture', 'Biology', 'Lab Automation', 'Microscopy'], 'Bioengineer with a budget lab and a lot of opinions about pipettes.', 140, 'Lisbon, PT'),
  U('u_marcus', 'Marcus Bell', 'marcusb', ['Cybersecurity', 'Privacy'], ['Cybersecurity', 'Go', 'Cryptography', 'Threat Modeling'], 'Privacy engineer. I like tools that protect people who cannot afford a security team.', 5, 'Austin, TX'),
  U('u_nadia', 'Nadia Haddad', 'nadiah', ['Design', 'UX Research'], ['UI Design', 'UX Research', 'Figma', 'Prompt Design'], 'Designer helping technical people explain what they built.', 345, 'Beirut, LB'),
  U('u_oliver', 'Oliver Strand', 'olivers', ['Open Science', 'Writing'], ['Scientific Writing', 'Open Science', 'Git', 'Policy'], 'Science writer and open-protocol evangelist.', 90, 'Edinburgh, UK'),
  U('u_jun', 'Jun Park', 'junpark', ['Networking', 'Infrastructure'], ['Networking', 'Linux', 'Go', 'Infrastructure'], 'Building community networks that survive without a telecom.', 205, 'Seoul, KR'),
  U('u_amara', 'Amara Nwosu', 'amaran', ['Chemistry', 'Climate'], ['Chemistry', 'Sensors', 'Data Analysis', 'Field Work'], 'Soil chemist. Measuring carbon one cheap sensor at a time.', 120, 'Abuja, NG'),
  U('u_felix', 'Felix Romano', 'felixr', ['Film', 'Creative Tech'], ['Film Restoration', 'Video', 'Web Dev'], 'Film archivist teaching crowds to save old reels.', 25, 'Turin, IT'),
];

const EXTRA = {
  u_maya: { interests: ['Robotics', 'AI', 'Hardware'], career: { field: 'Engineering / Hardware', status: 'working' }, openToCollab: true, collabTypes: ['Tech collaborator'], socials: { website: 'https://example.com/maya' } },
  u_alex: { interests: ['AI', 'OpenSource', 'Research'], career: { field: 'AI & Machine Learning', status: 'working' }, openToCollab: true, collabTypes: ['Tech with AI · Vibe Code'], socials: {} },
  u_priya: { interests: ['Research', 'Biology', 'AI'], career: { field: 'Science & Research', status: 'working' }, openToCollab: true, collabTypes: ['Scientist collaborator', 'Researcher / Academic'], socials: {} },
  u_tomas: { interests: ['Games', 'Music', 'OpenSource'], career: { field: 'Design & Creative', status: 'working' }, openToCollab: true, collabTypes: ['Creative collaborator'], socials: { website: 'https://example.com/tomas' } },
  u_lena: { interests: ['Space', 'Hardware', 'OpenSource'], career: { field: 'Engineering / Hardware', status: 'studying' }, openToCollab: true, collabTypes: ['Tech collaborator', 'Scientist collaborator'], socials: {} },
  u_kofi: { interests: ['Hardware', 'OpenSource', 'Biology'], career: { field: 'Engineering / Hardware', status: 'working' }, openToCollab: true, collabTypes: ['Hardware / Maker', 'Tech collaborator'], socials: {} },
  u_sora: { interests: ['Music', 'Research'], career: { field: 'Design & Creative', status: 'working' }, openToCollab: false, collabTypes: [], socials: {} },
  u_ines: { interests: ['Biology', 'Research', 'Hardware'], career: { field: 'Healthcare & Biology', status: 'progress' }, openToCollab: true, collabTypes: ['Scientist collaborator'], socials: {} },
  u_marcus: { interests: ['Cybersecurity', 'Privacy'], career: { field: 'Cybersecurity', status: 'working' }, openToCollab: true, collabTypes: ['Tech collaborator'], socials: {} },
  u_nadia: { interests: ['AI', 'Privacy'], career: { field: 'Design & Creative', status: 'working' }, openToCollab: true, collabTypes: ['Designer collaborator', 'Tech with AI · Vibe Code'], socials: {} },
  u_oliver: { interests: ['Research', 'OpenSource'], career: { field: 'Writing & Media', status: 'working' }, openToCollab: true, collabTypes: ['Writer / Storyteller', 'Scientist collaborator'], socials: {} },
  u_jun: { interests: ['Hardware', 'OpenSource', 'Privacy'], career: { field: 'Technology / Software', status: 'working' }, openToCollab: false, collabTypes: [], socials: {} },
  u_amara: { interests: ['Research', 'Biology', 'Hardware'], career: { field: 'Science & Research', status: 'working' }, openToCollab: true, collabTypes: ['Scientist collaborator'], socials: {} },
  u_felix: { interests: ['OpenSource', 'Research'], career: { field: 'Design & Creative', status: 'working' }, openToCollab: true, collabTypes: ['Creative collaborator'], socials: {} },
  u_dayana: { interests: ['Cybersecurity', 'Biology', 'AI', 'Research'], career: { field: 'Cybersecurity', status: 'working' }, openToCollab: true, collabTypes: ['Tech with AI · Vibe Code', 'Scientist collaborator'], socials: { github: 'https://github.com/rewired89' } },
};
users.forEach((u) => Object.assign(u, { avatar: null, interests: [], career: null, socials: {}, openToCollab: false, collabTypes: [] }, EXTRA[u.id]));
