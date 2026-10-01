import { phishBank, fallacyBank, humanBank, scienceBank, aiBank, logicBank, moneyBank, historyBank } from './questions.js';

export const BANKS = { phish: phishBank, fallacy: fallacyBank, human: humanBank, science: scienceBank, aihuman: aiBank, logic: logicBank, money: moneyBank, history: historyBank };

/* GAME → SKILL → MECHANIC → FEEDBACK → TAKEAWAY */
export const games = [
  { id: 'phish', title: 'Phish or Fine?', emoji: '🔐', kind: 'quiz', time: '~45 seconds', rounds: 6, topics: ['cybersecurity'], moods: ['For Security', 'For Life', 'For Work'], learn: 'Phishing recognition',
    how: 'Read the message. Decide: trust it, phish, or cannot tell yet.', skill: 'Recognizing phishing', mechanic: 'Choose how to treat a message', feedback: 'Immediate explanation', takeaway: 'Urgency + suspicious link + unexpected attachment are common warning signs.' },
  { id: 'fallacy', title: 'Fallacy Fighter', emoji: '🧠', kind: 'quiz', time: '~40 seconds', rounds: 6, topics: ['critical'], moods: ['For Your Brain', 'For Life'], learn: 'Spotting weak arguments',
    how: 'Read the statement. What is wrong with it?', skill: 'Critical thinking', mechanic: 'Name the flaw in a statement', feedback: 'Plain-language explanation', takeaway: 'Good reasoning checks evidence, not volume or status.' },
  { id: 'human', title: 'Human Moment', emoji: '❤️', kind: 'quiz', time: '~40 seconds', rounds: 5, topics: ['communication', 'emotional'], moods: ['For Communication', 'For Life', 'For Work'], learn: 'Communication choices',
    how: 'Someone says something. Pick the response you would send.', skill: 'Emotional intelligence', mechanic: 'Choose a response in a short scene', feedback: 'Why each choice lands the way it does', takeaway: 'Practice, not therapy: small word choices change conversations.' },
  { id: 'science', title: 'Two Seconds of Science', emoji: '🔬', kind: 'quiz', time: '~30 seconds', rounds: 6, topics: ['science'], moods: ['For Science', 'For Fun', 'For Your Brain'], learn: 'Core science intuition',
    how: 'Quick scenario, quick answer, quick why.', skill: 'Scientific reasoning', mechanic: 'Predict what happens', feedback: 'Tiny explanation after every answer', takeaway: 'Intuition is a starting point. Check it against how things work.' },
  { id: 'aihuman', title: 'AI or Human?', emoji: '🤖', kind: 'quiz', time: '~45 seconds', rounds: 5, topics: ['ai'], moods: ['For AI', 'For Work', 'For Your Brain'], learn: 'AI literacy and verification',
    how: 'Look at the content and any evidence. Sometimes the honest answer is "not enough information".', skill: 'AI literacy', mechanic: 'Judge authorship from evidence', feedback: 'What evidence would settle it', takeaway: 'Do not assume you know. Evidence matters.' },
  { id: 'logic', title: 'Logic Lab', emoji: '🧩', kind: 'quiz', time: '~40 seconds', rounds: 6, topics: ['logic', 'critical'], moods: ['For Your Brain', 'For Fun'], learn: 'Deduction and probability',
    how: 'Read the premises. Does the conclusion follow?', skill: 'Logical reasoning', mechanic: 'Decide what follows from premises', feedback: 'Step-by-step reason', takeaway: '"Not enough information" is a valid answer.' },
  { id: 'dodge', title: 'Knowledge Dodge', emoji: '🏃', kind: 'dodge', time: '~60 seconds', rounds: 10, topics: ['science', 'critical'], moods: ['For Fun', 'For Your Brain'], learn: 'Facts vs myths',
    how: 'Move up and down. Collect true facts. Dodge the myths.', skill: 'Myth busting', mechanic: 'Lane running', feedback: 'A tiny note after every card', takeaway: 'Popular is not the same as true.' },
  { id: 'runner', title: 'Privacy Runner', emoji: '🔑', kind: 'runner', time: '~45 seconds', rounds: 12, topics: ['cybersecurity'], moods: ['For Fun', 'For Security'], learn: 'Everyday privacy habits',
    how: 'Jump to grab protections. Jump over risks.', skill: 'Privacy habits', mechanic: 'Endless runner', feedback: 'Privacy score and lessons', takeaway: 'Small habits stack into real protection.' },
  { id: 'money', title: 'Money Sense', emoji: '💰', kind: 'quiz', time: '~30 seconds', rounds: 5, topics: ['money'], moods: ['For Life', 'For Work'], learn: 'Everyday money ideas',
    how: 'Read the situation and pick what is most likely.', skill: 'Financial literacy', mechanic: 'Choose the likely outcome', feedback: 'Short explanation', takeaway: 'General education, not financial advice.' },
  { id: 'history', title: 'Past & Culture', emoji: '🌎', kind: 'quiz', time: '~30 seconds', rounds: 5, topics: ['history'], moods: ['For Fun', 'For Your Brain'], learn: 'Checking popular history claims',
    how: 'A popular claim, a short check.', skill: 'Source awareness', mechanic: 'Check a claim', feedback: 'What the evidence suggests', takeaway: 'Sometimes the honest answer is "historians debate it".' },
];

export const gameById = (id) => games.find((g) => g.id === id);

export const HUB_CHIPS = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'critical', label: 'Critical Thinking', icon: '🧠' },
  { id: 'cybersecurity', label: 'Cybersecurity', icon: '🔐' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'ai', label: 'AI', icon: '🤖' },
  { id: 'emotional', label: 'Emotional Intelligence', icon: '❤️' },
  { id: 'history', label: 'History & Culture', icon: '🌎' },
  { id: 'money', label: 'Money', icon: '💰' },
  { id: 'logic', label: 'Logic', icon: '🧩' },
  { id: 'communication', label: 'Communication', icon: '🗣' },
];
export const MOODS = ['For Fun', 'For Your Brain', 'For Work', 'For Life', 'For Security', 'For Science', 'For AI', 'For Communication'];

/* Community challenges, each a single curated question */
export const seededChallenges = [
  { id: 'ch_ai', communityId: 'c_aibuilders', title: 'Today\'s AI challenge', emoji: '🤖', category: 'ai', topic: 'hallucinations', difficulty: 3, question: 'Which answer contains a hallucinated citation?', choices: ['"Water boils at 100 C at sea level."', '"As shown by Lindqvist & Park (2019, Journal of Applied Cognition), 80% of readers retain more from short paragraphs."', '"Most trees get their mass from carbon dioxide."', 'None of them, I would need to check'], correctAnswer: 3, explanation: 'The citation in option two could be fabricated, but you cannot know until you look it up. Verifying beats guessing.', takeaway: 'Check the source before trusting a confident citation.', skill: 'source verification', sourceType: 'educational', source: 'Educational reference: AI literacy and source verification' },
  { id: 'ch_cyber', communityId: 'c_cyber', title: 'Can you spot the attack?', emoji: '🔐', category: 'cybersecurity', topic: 'social engineering', difficulty: 2, question: 'A caller says they are from IT and asks you to read out the code that was just texted to you. What should you do?', choices: ['Read it out, they are IT', 'Hang up and call IT on a number you already trust', 'Ask them to email it instead', 'Give half the code'], correctAnswer: 1, explanation: 'One-time codes are for you alone. A caller can fake a number or a name.', takeaway: 'Never share a one-time code. Verify by calling back on a trusted number.', skill: 'social engineering', sourceType: 'educational', source: 'Educational reference: general phishing awareness guidance' },
  { id: 'ch_science', communityId: 'c_openscience', title: 'Science minute', emoji: '🔬', category: 'science', topic: 'physics', difficulty: 2, question: 'Why is the sky blue?', choices: ['The sky reflects the ocean', 'Air scatters shorter blue wavelengths of sunlight more than longer red ones', 'Blue is the color of oxygen', 'Dust turns sunlight blue'], correctAnswer: 1, explanation: 'This is called Rayleigh scattering. Blue light is scattered in all directions, so the sky appears blue.', takeaway: 'Short wavelengths scatter more, so the sky looks blue.', skill: 'light and waves', sourceType: 'educational', source: 'Educational reference: introductory science' },
];
