import { useState } from 'react';
import { GlassPanel, TactileButton, Badge, StoneCard } from '../components/ui/index.jsx';
import CommunityGame, { SmokeTest } from '../components/games/CommunityGame.jsx';
import { analyzeGame, sha, STARTER, GAME_PASS, MAX_BYTES } from '../lib/gamereview.js';
import { allGames, saveGame } from '../lib/gamestore.js';
import { Link } from '../lib/router.js';
import { ME } from '../data/users.js';
import { useStore } from '../store/StoreProvider.jsx';
import { useUI } from '../store/UIProvider.jsx';

const Field = ({ id, label, hint, children }) => (<div className="field"><label htmlFor={id}>{label}</label>{children}{hint && <small className="muted">{hint}</small>}</div>);
const VERDICT = {
  approved: ['success', 'Approved. Your game goes live right away.'],
  human_review: ['default', 'Almost there. A human reviewer will take a look before it goes live.'],
  needs_changes: ['danger', 'Not approved yet. Fix the items below and check again.'],
};

export default function GameSubmit() {
  const { a } = useStore();
  const { toast } = useUI();
  const [m, setM] = useState({ title: '', description: '', how: '', purpose: '', duration: 30, tags: '' });
  const [html, setHtml] = useState('');
  const [phase, setPhase] = useState('edit');
  const [report, setReport] = useState(null);
  const [saved, setSaved] = useState(null);
  const set = (k) => (e) => setM((x) => ({ ...x, [k]: e.target.value }));
  const onFile = async (e) => { const f = e.target.files?.[0]; if (!f) return; if (f.size > MAX_BYTES) { toast(`Too big. The limit is ${MAX_BYTES / 1024} KB.`, { tone: 'danger' }); return; } setHtml(await f.text()); };
  const download = () => { const u = URL.createObjectURL(new Blob([STARTER], { type: 'text/html' })); const l = document.createElement('a'); l.href = u; l.download = 'nomi-game-starter.html'; l.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); };
  const check = () => { if (!html.trim()) { toast('Add your game file or paste the code first.', { tone: 'danger' }); return; } setPhase('smoke'); };
  const finish = async (smoke) => {
    const hash = await sha(html);
    const duplicate = allGames().some((g) => g.hash === hash);
    const r = analyzeGame({ html, meta: m, smoke, duplicate });
    r.hash = hash; setReport(r); setPhase('result');
  };
  const submit = async () => {
    const meta = { ...m, duration: Number(m.duration), tags: m.tags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean).slice(0, 5), hash: report.hash };
    const g = await saveGame(meta, html, report, ME);
    setSaved(g);
    a.gameSubmitted(g);
  };
  if (saved) return (
    <GlassPanel className="stack"><h1>{saved.status === 'approved' ? 'Your game is live 🎉' : 'Submitted'}</h1>
      <p className="secondary">{saved.status === 'approved' ? `${saved.title} scored ${saved.score}/100 and is in Play & Learn. Approved games build your game creator reputation.` : `${saved.title} scored ${saved.score}/100 and is waiting for a human reviewer. You will get a notification.`}</p>
      <div className="row"><Link to={saved.status === 'approved' ? `/cgame/${saved.id}` : '/play'} className="btn btn--primary">{saved.status === 'approved' ? 'Play it' : 'Back to Play'}</Link><Link to="/profile" className="btn">My profile</Link></div></GlassPanel>
  );
  return (
    <div className="stack stack--lg">
      <GlassPanel className="hero hero--play"><span className="eyebrow">Game creators</span><h1>Submit a tiny game</h1>
        <p className="secondary">Build a game that takes 90 seconds or less, like Cloud Hop. Nomi's reviewer checks that it runs, reports a result, is accessible and plays fair. {GAME_PASS}+ goes live. 60 to {GAME_PASS - 1} goes to a human. Approved games build your creator reputation.</p>
        <div className="row row--wrap"><TactileButton onClick={download}>Download starter template</TactileButton></div>
      </GlassPanel>
      {phase !== 'result' && (
        <GlassPanel className="stack">
          <Field id="gs-title" label="Title"><input id="gs-title" className="input" value={m.title} onChange={set('title')} maxLength={40} /></Field>
          <Field id="gs-desc" label="What is it?" hint="40+ characters"><textarea id="gs-desc" className="textarea" rows={2} value={m.description} onChange={set('description')} maxLength={240} /></Field>
          <Field id="gs-how" label="How to play" hint="30+ characters"><textarea id="gs-how" className="textarea" rows={2} value={m.how} onChange={set('how')} maxLength={240} /></Field>
          <Field id="gs-purpose" label="What does a player take away?" hint="Learn, practice or feel something. 40+ characters"><textarea id="gs-purpose" className="textarea" rows={2} value={m.purpose} onChange={set('purpose')} maxLength={240} /></Field>
          <div className="grid grid--2"><Field id="gs-dur" label="Length in seconds (max 90)"><input id="gs-dur" className="input" type="number" min="5" max="90" value={m.duration} onChange={set('duration')} /></Field><Field id="gs-tags" label="Tags, comma separated"><input id="gs-tags" className="input" value={m.tags} onChange={set('tags')} placeholder="focus, puzzle" /></Field></div>
          <Field id="gs-file" label="Game file (.html, up to 300 KB, one self contained file)"><input id="gs-file" type="file" accept=".html,text/html" onChange={onFile} /></Field>
          <Field id="gs-code" label="Or paste the code"><textarea id="gs-code" className="textarea" rows={8} value={html} onChange={(e) => setHtml(e.target.value)} spellCheck={false} /></Field>
          <details><summary>Rules your game must follow</summary><p className="secondary">One file, no network, no storage, no external files, no popups, no gambling or mining. Call <code>NOMI.ready()</code> when loaded, <code>NOMI.win(score)</code> and <code>NOMI.lose()</code> when it ends. Support keyboard and touch. Runs in a sandbox with no access to the rest of Nomi.</p></details>
          <div><TactileButton variant="primary" disabled={phase === 'smoke'} onClick={check}>{phase === 'smoke' ? 'Reviewer is testing your game...' : 'Check my game'}</TactileButton></div>
          {phase === 'smoke' && <SmokeTest html={html} onDone={finish} />}
        </GlassPanel>
      )}
      {phase === 'result' && report && (
        <GlassPanel className="stack">
          <div className="row row--between row--wrap"><h2>Reviewer result: {report.score}/100</h2><Badge tone={VERDICT[report.verdict][0]}>{report.verdict === 'approved' ? 'Approved' : report.verdict === 'human_review' ? 'Human review' : 'Needs changes'}</Badge></div>
          <p className="secondary">{VERDICT[report.verdict][1]}</p>
          {report.hard.length > 0 && <StoneCard className="stack stack--sm"><strong>Must fix</strong><ul>{report.hard.map((h) => <li key={h}>{h}</li>)}</ul></StoneCard>}
          <ul className="stack stack--sm">{report.checks.map((c) => <li key={c.id}><strong>{c.label}</strong> {c.pts}/{c.max}<br /><small className="muted">{c.notes.join(' · ')}</small></li>)}</ul>
          <details><summary>Try it before you submit</summary><CommunityGame game={{ title: m.title }} html={html} height={360} /></details>
          <div className="row row--wrap"><TactileButton onClick={() => setPhase('edit')}>Edit and check again</TactileButton>{report.verdict !== 'needs_changes' && <TactileButton variant="primary" onClick={submit}>{report.verdict === 'approved' ? 'Publish my game' : 'Send for human review'}</TactileButton>}</div>
          <p className="muted">Prototype reviewer: rule based. A real build adds AI review and a human check before payment features.</p>
        </GlassPanel>
      )}
    </div>
  );
}
