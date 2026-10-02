import { THRESHOLD } from '../data/trust.js';
import { parseLink } from './media.js';

/* PROTOTYPE REVIEWER: a transparent, rule-based first pass. It checks that evidence EXISTS and is coherent.
   It cannot judge whether the science is true. A real version adds an AI model for triage and human experts for the decision. */

export const RUBRIC = [
  { id: 'deck', label: 'Pitch deck', max: 10, tip: 'Upload a PDF (5+ pages is ideal) or PPTX pitch deck.' },
  { id: 'readme', label: 'README quality', max: 20, tip: 'Cover problem, method, results, how to run or reproduce, limitations and license.' },
  { id: 'repo', label: 'Code or lab repository', max: 15, tip: 'Link a GitHub repository (owner/repo) and a website or docs page.' },
  { id: 'demo', label: 'Demos and channel', max: 10, tip: 'Add a demo video (upload or link) and a YouTube channel or project page.' },
  { id: 'plan', label: 'Budget and milestones', max: 15, tip: 'Explain how money is spent with real amounts, and make milestones add up to the goal.' },
  { id: 'team', label: 'Team credibility', max: 10, tip: 'Link two or more profiles: ORCID, Google Scholar, institution page, LinkedIn.' },
  { id: 'honesty', label: 'Honest claims', max: 10, tip: 'State limitations and risks. Avoid words like guaranteed, cure or revolutionary.' },
  { id: 'safety', label: 'Safety and ethics', max: 5, tip: 'If people, animals or biology are involved, explain approvals and safeguards.' },
  { id: 'open', label: 'Open materials', max: 5, tip: 'Share a license, dataset or protocol link.' },
];

const HYPE = ['guaranteed', 'guarantee', 'cure', 'revolutionary', 'breakthrough', 'miracle', '100%', 'no risk', 'risk-free', 'get rich'];
const SECTIONS = [['Problem', /problem|why|motivation|background/i], ['Method', /method|approach|how it works|design|architecture/i], ['Results', /result|evidence|data|findings|benchmark/i], ['How to run', /install|run|usage|reproduce|getting started|setup/i], ['Limitations', /limitation|risk|caveat|known issue/i], ['License', /license|licence|contributing/i]];
const round = (n) => Math.round(n * 10) / 10;

export function scoreProject(m, { milestones = [] } = {}) {
  const out = [];
  const add = (id, pts, notes) => { const r = RUBRIC.find((x) => x.id === id); out.push({ id, label: r.label, max: r.max, pts: Math.max(0, Math.min(r.max, round(pts))), notes, tip: r.tip }); };

  // deck
  let p = 0; const n = [];
  if (m.deck) { if (m.deck.kind === 'pdf') { p = m.deck.pages >= 5 ? 10 : 7; n.push(m.deck.pages >= 5 ? `PDF deck, ${m.deck.pages} pages` : `PDF deck has ${m.deck.pages || 'few'} pages, 5 or more is better`); } else { p = 8; n.push('PowerPoint deck received (contents are not inspected in this prototype)'); } } else n.push('No pitch deck');
  add('deck', p, n);

  // readme
  p = 0; const rn = []; const text = m.readme || '';
  if (text.trim().length >= 200) { p += 5; rn.push('README provided'); } else rn.push(text.trim() ? 'README is very short' : 'No README');
  const hit = SECTIONS.filter(([, re]) => re.test(text)); const miss = SECTIONS.filter(([, re]) => !re.test(text)).map(([k]) => k);
  if (text.trim().length >= 200) { p += hit.length * 2.5; if (miss.length) rn.push(`Missing sections: ${miss.join(', ')}`); }
  add('readme', p, rn);

  // repo
  p = 0; const gn = []; const gh = parseLink(m.github);
  if (gh?.kind === 'repo') { p += 10; gn.push(`Repository ${gh.owner}/${gh.repo}`); } else gn.push(m.github ? 'That does not look like a GitHub repository link (github.com/owner/repo)' : 'No repository link');
  if (parseLink(m.website)) { p += 5; gn.push('Website or docs link'); } else gn.push('No website or docs link');
  add('repo', p, gn);

  // demo
  p = 0; const dn = [];
  if ((m.videoFiles || 0) > 0 || (m.videoLinks || []).some((l) => parseLink(l))) { p += 6; dn.push('Demo video'); } else dn.push('No demo video');
  const yt = parseLink(m.youtube);
  if (yt && /youtube\.com|youtu\.be/.test(yt.host)) { p += 4; dn.push('YouTube channel'); } else dn.push(m.youtube ? 'That is not a YouTube link' : 'No YouTube channel');
  add('demo', p, dn);

  // plan
  p = 0; const pn = []; const sum = milestones.reduce((a, x) => a + x.needed, 0);
  if (milestones.length && milestones.every((x) => x.needed > 0)) { p += 5; pn.push(`${milestones.length} milestone${milestones.length > 1 ? 's' : ''} totaling $${sum}`); } else pn.push('No milestones');
  if ((m.budget || '').trim().length >= 150) { p += 5; pn.push('Budget explained'); } else pn.push('Budget explanation is missing or short (150+ characters)');
  if (/\$\s?\d/.test(m.budget || '')) { p += 5; pn.push('Budget lists real amounts'); } else pn.push('Budget has no dollar amounts');
  add('plan', p, pn);

  // team
  const links = (m.team || []).filter((l) => parseLink(l));
  add('team', links.length >= 2 ? 10 : links.length === 1 ? 5 : 0, [links.length ? `${links.length} credential link${links.length > 1 ? 's' : ''}` : 'No credential links']);

  // honesty
  p = 0; const hn = []; const claim = `${m.claim || ''} ${m.limitations || ''} ${text}`.toLowerCase();
  if ((m.limitations || '').trim().length >= 80) { p += 5; hn.push('Limitations stated'); } else hn.push('Limitations missing or short (80+ characters)');
  const hype = HYPE.filter((h) => claim.includes(h));
  p += Math.max(0, 5 - hype.length * 2.5); hn.push(hype.length ? `Hype wording found: ${hype.join(', ')}` : 'No hype wording');
  add('honesty', p, hn);

  // safety
  const sf = m.safety || { type: '', note: '' };
  const sens = ['humans', 'animals', 'bio', 'dual'].includes(sf.type);
  add('safety', !sf.type ? 0 : sens ? ((sf.note || '').trim().length >= 60 ? 5 : 2) : 5, [!sf.type ? 'Safety question not answered' : sens ? ((sf.note || '').trim().length >= 60 ? 'Approvals and safeguards described' : 'Describe approvals (for example IRB or ethics board) and safeguards, 60+ characters') : 'No sensitive subject matter declared']);

  // open
  add('open', parseLink(m.openLink) || /licen[sc]e/i.test(text) ? 5 : 0, [parseLink(m.openLink) ? 'Open data or protocol link' : /licen[sc]e/i.test(text) ? 'License mentioned in README' : 'No license, dataset or protocol link']);

  const score = Math.round(out.reduce((a, x) => a + x.pts, 0));
  return { score, pass: score >= THRESHOLD, breakdown: out };
}

export async function pdfPages(file) {
  try {
    const buf = new Uint8Array(await file.arrayBuffer());
    let s = ''; for (let i = 0; i < buf.length; i += 8192) s += String.fromCharCode(...buf.subarray(i, i + 8192));
    return (s.match(/\/Type\s*\/Page[^s]/g) || []).length;
  } catch { return 0; }
}
