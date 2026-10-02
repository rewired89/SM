import { useRef, useState } from 'react';
import { TactileButton, Badge } from '../ui/index.jsx';
import { validate, fmtSize } from '../../lib/media.js';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';

const SAFETY = [['', 'Choose one'], ['none', 'None of these'], ['humans', 'Involves people (surveys, trials, data about people)'], ['animals', 'Involves animals'], ['bio', 'Biological or chemical materials'], ['dual', 'Could be misused (security, dual-use)']];
const STEPS = ['Reading your README', 'Inspecting the pitch deck', 'Checking repository and links', 'Weighing budget and milestones', 'Looking for unsupported claims'];

export default function ReviewForm({ project, onResult }) {
  const { s, a } = useStore();
  const { toast } = useUI();
  const prev = s.reviews[project.id]?.materials || {};
  const [m, setM] = useState({ deck: null, readme: prev.readme || '', github: prev.github || '', website: prev.website || '', youtube: prev.youtube || '', videoLinks: (prev.videoLinks || []).join('\n'), team: (prev.team || []).join('\n'), claim: prev.claim || '', budget: prev.budget || '', limitations: prev.limitations || '', safetyType: prev.safety?.type || '', safetyNote: prev.safety?.note || '', openLink: prev.openLink || '' });
  const [videos, setVideos] = useState([]);
  const [busy, setBusy] = useState(-1);
  const deckRef = useRef(null), readmeRef = useRef(null), vidRef = useRef(null);
  const set = (k) => (e) => setM({ ...m, [k]: e.target.value });

  const pickDeck = (f) => { if (!f) return; const v = validate(f); if (!v.ok || !['pdf', 'deck'].includes(v.kind)) return toast('Please upload a PDF or PowerPoint file.', { tone: 'danger' }); setM({ ...m, deck: { file: f, kind: v.kind } }); };
  const pickReadme = async (f) => { if (!f) return; if (f.size > 200000) return toast('README files over 200 KB are too large for this prototype.', { tone: 'danger' }); setM({ ...m, readme: await f.text() }); };
  const pickVideos = (files) => { const out = []; [...files].forEach((f) => { const v = validate(f); if (v.ok && v.kind === 'video') out.push({ file: f, kind: 'video' }); else toast(`${f.name}: please choose a video file.`, { tone: 'danger' }); }); setVideos((x) => [...x, ...out].slice(0, 3)); };
  const lines = (t) => t.split(/\n|,/).map((x) => x.trim()).filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    for (let i = 0; i < STEPS.length; i += 1) { setBusy(i); await new Promise((r) => setTimeout(r, 450)); }
    const review = await a.submitReview(project.id, { deck: m.deck, readme: m.readme, github: m.github, website: m.website, youtube: m.youtube, videoLinks: lines(m.videoLinks), videoItems: videos, team: lines(m.team), claim: m.claim, budget: m.budget, limitations: m.limitations, safety: { type: m.safetyType, note: m.safetyNote }, openLink: m.openLink });
    setBusy(-1); onResult?.(review);
  };

  if (busy >= 0) return (
    <div className="stack" aria-live="polite"><strong>Reviewing your project (automated first pass)</strong>
      <ul className="stack stack--sm">{STEPS.map((x, i) => <li key={x} className="row">{i < busy ? <span className="ok">✓</span> : i === busy ? <span className="spinner" /> : <span className="muted">•</span>}<span className={i > busy ? 'muted' : ''}>{x}</span></li>)}</ul></div>
  );

  return (
    <form className="stack" onSubmit={submit}>
      <div className="banner"><Badge tone="warning">Prototype reviewer</Badge><span className="secondary">A transparent rule-based check that evidence exists. A real version adds AI triage and human experts, who make the final call.</span></div>
      <div className="field"><span className="label">Pitch deck (PDF or PowerPoint)</span>
        <input ref={deckRef} type="file" accept=".pdf,.pptx,.ppt,application/pdf" hidden onChange={(e) => { pickDeck(e.target.files[0]); e.target.value = ''; }} />
        <div className="row"><TactileButton size="sm" onClick={() => deckRef.current.click()}>{m.deck ? 'Replace deck' : 'Choose file'}</TactileButton>{m.deck && <span className="muted">{m.deck.file.name} · {fmtSize(m.deck.file.size)}</span>}</div></div>
      <div className="field"><label htmlFor="rv-readme">README (paste it, or upload a .md or .txt file)</label>
        <input ref={readmeRef} type="file" accept=".md,.txt,text/markdown,text/plain" hidden onChange={(e) => { pickReadme(e.target.files[0]); e.target.value = ''; }} />
        <textarea id="rv-readme" className="textarea" rows={6} value={m.readme} onChange={set('readme')} placeholder="# Problem&#10;# Method&#10;# Results&#10;# How to run&#10;# Limitations&#10;# License" />
        <div><TactileButton size="sm" onClick={() => readmeRef.current.click()}>Upload README file</TactileButton></div></div>
      <div className="grid grid--2">
        <div className="field"><label htmlFor="rv-gh">GitHub repository</label><input id="rv-gh" className="input" value={m.github} onChange={set('github')} placeholder="github.com/owner/repo" /></div>
        <div className="field"><label htmlFor="rv-web">Website or docs</label><input id="rv-web" className="input" value={m.website} onChange={set('website')} placeholder="https://" /></div>
        <div className="field"><label htmlFor="rv-yt">YouTube channel</label><input id="rv-yt" className="input" value={m.youtube} onChange={set('youtube')} placeholder="youtube.com/@yourchannel" /></div>
        <div className="field"><label htmlFor="rv-open">License, dataset or protocol link</label><input id="rv-open" className="input" value={m.openLink} onChange={set('openLink')} placeholder="https://" /></div>
      </div>
      <div className="field"><label htmlFor="rv-vl">Demo video links (one per line)</label><textarea id="rv-vl" className="textarea" rows={2} value={m.videoLinks} onChange={set('videoLinks')} />
        <input ref={vidRef} type="file" accept="video/*" multiple hidden onChange={(e) => { pickVideos(e.target.files); e.target.value = ''; }} />
        <div className="row"><TactileButton size="sm" onClick={() => vidRef.current.click()}>Or upload a video</TactileButton>{videos.length > 0 && <span className="muted">{videos.map((v) => v.file.name).join(', ')}</span>}</div></div>
      <div className="field"><label htmlFor="rv-team">Credential links for the team (ORCID, Google Scholar, institution page, LinkedIn), one per line</label><textarea id="rv-team" className="textarea" rows={3} value={m.team} onChange={set('team')} /></div>
      <div className="field"><label htmlFor="rv-claim">What are you building, and what evidence do you have so far?</label><textarea id="rv-claim" className="textarea" rows={3} value={m.claim} onChange={set('claim')} /></div>
      <div className="field"><label htmlFor="rv-budget">How will the money be spent? Use real amounts.</label><textarea id="rv-budget" className="textarea" rows={3} value={m.budget} onChange={set('budget')} placeholder="$400 sensors, $250 lab time, $350 cloud compute..." /></div>
      <div className="field"><label htmlFor="rv-lim">Limitations and risks, honestly</label><textarea id="rv-lim" className="textarea" rows={3} value={m.limitations} onChange={set('limitations')} /></div>
      <div className="grid grid--2">
        <div className="field"><label htmlFor="rv-safe">Safety and ethics</label><select id="rv-safe" className="select" value={m.safetyType} onChange={set('safetyType')}>{SAFETY.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
        <div className="field"><label htmlFor="rv-sn">Approvals and safeguards (ethics board, safety plan)</label><input id="rv-sn" className="input" value={m.safetyNote} onChange={set('safetyNote')} /></div>
      </div>
      <div><TactileButton type="submit" variant="primary" size="lg">Submit for review</TactileButton></div>
    </form>
  );
}
