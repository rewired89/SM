import { useEffect, useMemo, useRef, useState } from 'react';
import { navigate, Link, back } from '../lib/router.js';
import { GlassPanel, StoneCard, TactileButton, Badge, Empty } from '../components/ui/index.jsx';
import MediaPicker from '../components/media/MediaPicker.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import * as sel from '../store/selectors.js';
import { topTags } from '../data/communities.js';
import { ME } from '../data/users.js';
import { money } from '../lib/format.js';

const CATS = ['Science', 'Technology', 'Creative', 'AI'];
const STEPS = ['Basics', 'The work', 'The money', 'Materials', 'Review'];
const MIN_ASK = 50, MAX_ASK = 50000;
const blank = () => ({ title: '', tagline: '', category: 'Science', tags: [], about: '', problem: '', audience: '', approach: '', experiments: '', timeline: '', success: '', risks: '', needs: '', budget: [{ item: '', amount: '', why: '' }], milestones: [{ title: '', amount: '', unlocks: '', evidence: '' }], github: '', website: '', youtube: '' });
const num = (v) => Number(v) || 0;

const Field = ({ id, label, hint, children, count, min }) => (
  <div className="field"><label htmlFor={id}>{label}</label>{children}
    {(hint || min) && <span className="muted">{hint}{min ? ` ${count}/${min} characters minimum.` : ''}</span>}</div>
);

export default function Apply({ id }) {
  const { s, a } = useStore();
  const existing = id ? sel.projectById(s, id) : null;
  const edit = !!existing;
  const createdProject = edit && s.created.projects.some((p) => p.id === id);
  const moneyOpen = !edit || (createdProject && !existing.fundingLocked);

  const initial = useMemo(() => {
    if (!edit) return { ...blank(), ...(s.appDraft || {}) };
    const ms = sel.milestonesOf(s, id);
    return { ...blank(), title: existing.title, tagline: existing.tagline, category: existing.category, tags: existing.tags || [], about: existing.about || '', problem: existing.problem || '', audience: existing.audience || '', approach: existing.approach || '', experiments: existing.experiments || '', timeline: existing.timeline || '', success: existing.success || '', risks: existing.risks || '', needs: (existing.needs || []).join(', '), budget: (existing.budget || []).map((b) => ({ ...b, amount: String(b.amount) })), milestones: ms.map((m) => ({ title: m.title, amount: String(m.needed), unlocks: m.unlocks || '', evidence: m.evidence || '' })) };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const [A, setA] = useState(initial);
  const [step, setStep] = useState(0);
  const [errs, setErrs] = useState([]);
  const [items, setItems] = useState([]);
  const [links, setLinks] = useState([]);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const top = useRef(null);

  useEffect(() => {
    if (edit) return undefined;
    const t = setTimeout(() => { a.saveDraft(A); setSaved(true); }, 700);
    return () => clearTimeout(t);
  }, [A]); // eslint-disable-line react-hooks/exhaustive-deps

  if (id && !existing) return <Empty title="Project not found"><Link to="/projects" className="btn">Browse projects</Link></Empty>;
  if (edit && existing.ownerId !== ME) return <Empty title="Only the founder can edit this project"><Link to={`/project/${id}`} className="btn">Back to the project</Link></Empty>;

  const set = (k) => (e) => { setSaved(false); setA({ ...A, [k]: e.target.value }); };
  const total = sel.budgetTotal(A.budget);
  const msTotal = A.milestones.reduce((x, m) => x + num(m.amount), 0);
  const setRow = (key, i, k) => (e) => setA({ ...A, [key]: A[key].map((r, j) => (j === i ? { ...r, [k]: e.target.value } : r)) });
  const L = (t) => t.trim().length;

  const validate = (n) => {
    const e = [];
    if (n === 0) {
      if (!L(A.title)) e.push('Give your project a name.');
      if (!L(A.tagline)) e.push('Add a one-line summary.');
      if (L(A.about) < 60) e.push('Explain what the project is about (at least 60 characters).');
      if (L(A.problem) < 60) e.push('Describe the problem it solves (at least 60 characters).');
    }
    if (n === 1) {
      if (L(A.approach) < 60) e.push('Explain your approach (at least 60 characters).');
      if (L(A.experiments) < 100) e.push('Describe the tests and experiments you need to run in detail (at least 100 characters).');
      if (!L(A.timeline)) e.push('Add a rough timeline.');
      if (!L(A.success)) e.push('Say what success looks like.');
      if (L(A.risks) < 40) e.push('Be honest about risks and limits (at least 40 characters).');
    }
    if (n === 2 && moneyOpen) {
      if (!A.budget.length || A.budget.some((b) => !L(b.item) || num(b.amount) <= 0 || L(b.why) < 15)) e.push('Every budget line needs a name, an amount above $0 and a reason (15+ characters).');
      if (total < MIN_ASK || total > MAX_ASK) e.push(`Your total ask must be between ${money(MIN_ASK)} and ${money(MAX_ASK)}.`);
      if (!A.milestones.length || A.milestones.some((m) => !L(m.title) || num(m.amount) <= 0 || L(m.unlocks) < 15 || L(m.evidence) < 10)) e.push('Every milestone needs a title, an amount, what it unlocks (15+ characters) and the evidence you will post (10+).');
      if (Math.round(msTotal * 100) !== Math.round(total * 100)) e.push(`Milestones add up to ${money(msTotal, 2)} but your budget is ${money(total, 2)}. They must match exactly.`);
    }
    return e;
  };
  const next = () => { const e = validate(step); setErrs(e); if (!e.length) { setStep(step + 1); top.current?.scrollIntoView({ behavior: 'smooth' }); } };
  const go = (n) => { if (n <= step) { setErrs([]); setStep(n); } };

  const submit = async () => {
    const all = [0, 1, 2].flatMap(validate);
    if (all.length) { setErrs(all); return; }
    setBusy(true);
    try {
      const allLinks = [A.github, A.website, A.youtube];
      if (!edit) {
        const pid = await a.submitApplication({ ...A, github: A.github, website: A.website, youtube: A.youtube }, items);
        navigate(`/project/${pid}`);
      } else {
        const patch = { title: A.title.trim(), tagline: A.tagline.trim(), category: A.category, tags: A.tags, about: A.about.trim(), problem: A.problem.trim(), audience: A.audience.trim(), approach: A.approach.trim(), experiments: A.experiments.trim(), timeline: A.timeline.trim(), success: A.success.trim(), risks: A.risks.trim(), needs: A.needs.split(',').map((x) => x.trim()).filter(Boolean) };
        patch.looking = patch.needs.map((n) => ({ skill: n, open: true }));
        const moneyPatch = moneyOpen && createdProject ? { budget: A.budget.map((b) => ({ item: b.item.trim(), amount: Number(b.amount), why: b.why.trim() })), askTotal: total, milestones: A.milestones.map((m) => ({ id: `m_${Math.random().toString(36).slice(2, 8)}`, projectId: id, title: m.title.trim(), needed: Number(m.amount), unlocks: m.unlocks.trim(), evidence: m.evidence.trim() })) } : null;
        await a.updateProject(id, patch, items, moneyPatch);
        navigate(`/project/${id}`);
      }
      void allLinks;
    } finally { setBusy(false); }
  };

  return (
    <div className="stack stack--lg" ref={top}>
      <div className="row row--between"><TactileButton variant="ghost" size="sm" icon="back" onClick={back}>Back</TactileButton>{!edit && <span className="muted">{saved ? 'Draft saved on this device' : 'Saving draft...'}</span>}</div>
      <div><span className="eyebrow">{edit ? 'Edit project' : 'Post a project'}</span><h1>{edit ? existing.title : 'Tell people what you want to build'}</h1>
        <p className="secondary">{edit ? 'You can improve the story any time. The funding terms are locked once submitted so backers know exactly what they are backing.' : 'The more specific you are, the more people trust you. You can post for free and apply for funding afterward.'}</p></div>

      <ol className="wizard" aria-label="Steps">{STEPS.map((x, i) => <li key={x}><button type="button" className={`wizard__step ${i === step ? 'is-now' : i < step ? 'is-done' : ''}`} onClick={() => go(i)} aria-current={i === step ? 'step' : undefined} disabled={i > step}><span className="step-no" aria-hidden="true">{i < step ? '✓' : i + 1}</span><span className="wizard__label">{x}</span></button></li>)}</ol>

      <GlassPanel className="settings-panel stack">
        {step === 0 && (<>
          <Field id="ap-title" label="Name of the project"><input id="ap-title" className="input" value={A.title} onChange={set('title')} maxLength={60} /></Field>
          <Field id="ap-tag" label="One-line summary"><input id="ap-tag" className="input" value={A.tagline} onChange={set('tagline')} maxLength={100} placeholder="Plant-powered sensor node for remote farms" /></Field>
          <Field id="ap-about" label="What is it about?" count={L(A.about)} min={60}><textarea id="ap-about" className="textarea" rows={4} value={A.about} onChange={set('about')} maxLength={1200} /></Field>
          <Field id="ap-prob" label="What problem does it solve?" count={L(A.problem)} min={60} hint="Who has this problem today, and what happens because of it?"><textarea id="ap-prob" className="textarea" rows={4} value={A.problem} onChange={set('problem')} maxLength={1200} /></Field>
          <Field id="ap-aud" label="Who benefits?"><input id="ap-aud" className="input" value={A.audience} onChange={set('audience')} placeholder="Small farms, student labs, journalists..." maxLength={160} /></Field>
          <div className="grid grid--2">
            <Field id="ap-cat" label="Category"><select id="ap-cat" className="select" value={A.category} onChange={set('category')}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field id="ap-needs" label="Who are you looking for?" hint="Comma separated, for example Python developer, Biologist"><input id="ap-needs" className="input" value={A.needs} onChange={set('needs')} /></Field>
          </div>
          <div className="field"><span className="label">Hashtags</span><div className="chips">{topTags.map((t) => <button type="button" key={t} className="chip" aria-pressed={A.tags.includes(t)} onClick={() => setA({ ...A, tags: A.tags.includes(t) ? A.tags.filter((x) => x !== t) : [...A.tags, t] })}>#{t}</button>)}</div></div>
        </>)}

        {step === 1 && (<>
          <Field id="ap-appr" label="How will you solve it?" count={L(A.approach)} min={60}><textarea id="ap-appr" className="textarea" rows={4} value={A.approach} onChange={set('approach')} maxLength={1500} /></Field>
          <Field id="ap-exp" label="Explain in detail the tests and experiments you need to run" count={L(A.experiments)} min={100} hint="What will you build or measure, how many times, with what equipment, and how will you know it worked?"><textarea id="ap-exp" className="textarea" rows={7} value={A.experiments} onChange={set('experiments')} maxLength={3000} /></Field>
          <div className="grid grid--2">
            <Field id="ap-time" label="Timeline"><textarea id="ap-time" className="textarea" rows={3} value={A.timeline} onChange={set('timeline')} placeholder="Weeks 1-4: build. Weeks 5-8: test..." maxLength={600} /></Field>
            <Field id="ap-succ" label="What does success look like?"><textarea id="ap-succ" className="textarea" rows={3} value={A.success} onChange={set('success')} maxLength={600} /></Field>
          </div>
          <Field id="ap-risk" label="Risks and limits, honestly" count={L(A.risks)} min={40} hint="What could go wrong, and what will you do if it does?"><textarea id="ap-risk" className="textarea" rows={3} value={A.risks} onChange={set('risks')} maxLength={1000} /></Field>
        </>)}

        {step === 2 && (<>
          {!moneyOpen && <div className="banner"><strong>🔒 Funding terms are locked</strong><span className="secondary">{createdProject ? 'You submitted them already. If nobody has contributed yet you can withdraw and edit them from the project page.' : 'Money has been raised, so backers are relying on these numbers.'}</span></div>}
          <h2>Budget: what the money pays for</h2>
          <div className="stack stack--sm">
            {A.budget.map((b, i) => (
              <StoneCard key={i} className="stack stack--sm tile--flat">
                <div className="row row--wrap"><input className="input grow" placeholder="Item, for example 3 EEG sensors" aria-label={`Budget item ${i + 1}`} value={b.item} onChange={setRow('budget', i, 'item')} disabled={!moneyOpen} /><div className="money-in"><span>$</span><input className="input" type="number" min="1" step="1" inputMode="decimal" aria-label={`Amount for item ${i + 1}`} value={b.amount} onChange={setRow('budget', i, 'amount')} disabled={!moneyOpen} /></div>{moneyOpen && A.budget.length > 1 && <button type="button" className="iconbtn" aria-label={`Remove budget item ${i + 1}`} onClick={() => setA({ ...A, budget: A.budget.filter((_, j) => j !== i) })}>✕</button>}</div>
                <input className="input" placeholder="Why this amount? What does it buy and why can you not do it cheaper?" aria-label={`Reason for item ${i + 1}`} value={b.why} onChange={setRow('budget', i, 'why')} disabled={!moneyOpen} />
              </StoneCard>
            ))}
            {moneyOpen && A.budget.length < 10 && <div><TactileButton size="sm" icon="plus" onClick={() => setA({ ...A, budget: [...A.budget, { item: '', amount: '', why: '' }] })}>Add a budget line</TactileButton></div>}
          </div>
          <div className="row row--between totals"><span>Total you are asking for</span><strong>{money(total, 2)}</strong></div>

          <h2>Milestones: when the money is used</h2>
          <p className="secondary">Each milestone is a checkpoint backers can watch. Say what it unlocks and what evidence you will post. They must add up to your budget.</p>
          <div className="stack stack--sm">
            {A.milestones.map((m, i) => (
              <StoneCard key={i} className="stack stack--sm tile--flat">
                <div className="row row--wrap"><input className="input grow" placeholder={`Milestone ${i + 1}, for example Build the lab prototype`} aria-label={`Milestone ${i + 1} title`} value={m.title} onChange={setRow('milestones', i, 'title')} disabled={!moneyOpen} /><div className="money-in"><span>$</span><input className="input" type="number" min="1" step="1" inputMode="decimal" aria-label={`Amount for milestone ${i + 1}`} value={m.amount} onChange={setRow('milestones', i, 'amount')} disabled={!moneyOpen} /></div>{moneyOpen && A.milestones.length > 1 && <button type="button" className="iconbtn" aria-label={`Remove milestone ${i + 1}`} onClick={() => setA({ ...A, milestones: A.milestones.filter((_, j) => j !== i) })}>✕</button>}</div>
                <input className="input" placeholder="What does reaching this unlock?" aria-label={`What milestone ${i + 1} unlocks`} value={m.unlocks} onChange={setRow('milestones', i, 'unlocks')} disabled={!moneyOpen} />
                <input className="input" placeholder="Evidence you will post (photos, data, a demo video...)" aria-label={`Evidence for milestone ${i + 1}`} value={m.evidence} onChange={setRow('milestones', i, 'evidence')} disabled={!moneyOpen} />
              </StoneCard>
            ))}
            {moneyOpen && A.milestones.length < 6 && <div><TactileButton size="sm" icon="plus" onClick={() => setA({ ...A, milestones: [...A.milestones, { title: '', amount: '', unlocks: '', evidence: '' }] })}>Add a milestone</TactileButton></div>}
          </div>
          <div className={`row row--between totals ${Math.round(msTotal * 100) === Math.round(total * 100) ? 'is-ok' : 'is-bad'}`}><span>Milestones add up to</span><strong>{money(msTotal, 2)} {Math.round(msTotal * 100) === Math.round(total * 100) ? '✓' : `(needs ${money(total, 2)})`}</strong></div>
        </>)}

        {step === 3 && (<>
          <p className="secondary">Optional now, but the funding review will ask for these. You can add them later.</p>
          <div className="field"><span className="label">Pitch deck, photos, videos and links</span><MediaPicker items={items} setItems={setItems} links={links} setLinks={setLinks} deck /></div>
          <div className="grid grid--2">
            <Field id="ap-gh" label="GitHub repository"><input id="ap-gh" className="input" value={A.github} onChange={set('github')} placeholder="github.com/owner/repo" /></Field>
            <Field id="ap-web" label="Website or docs"><input id="ap-web" className="input" value={A.website} onChange={set('website')} placeholder="https://" /></Field>
            <Field id="ap-yt" label="YouTube channel"><input id="ap-yt" className="input" value={A.youtube} onChange={set('youtube')} placeholder="youtube.com/@channel" /></Field>
          </div>
        </>)}

        {step === 4 && (<>
          <h2>{A.title || 'Untitled project'}</h2>
          <p className="secondary">{A.tagline}</p>
          <div className="grid grid--2">
            <StoneCard className="tile--flat stack stack--sm"><span className="eyebrow">Funding ask</span><strong className="big">{money(total, 2)}</strong><span className="muted">{A.budget.length} budget lines · {A.milestones.length} milestones</span></StoneCard>
            <StoneCard className="tile--flat stack stack--sm"><span className="eyebrow">Looking for</span><span>{A.needs || 'Nobody specific yet'}</span><span className="muted">{A.category} · {A.tags.map((t) => `#${t}`).join(' ') || 'no hashtags'}</span></StoneCard>
          </div>
          <StoneCard className="tile--flat stack stack--sm"><span className="eyebrow">What you will post</span><ul className="secondary"><li>• The problem: {A.problem.slice(0, 120)}{A.problem.length > 120 ? '…' : ''}</li><li>• The tests: {A.experiments.slice(0, 120)}{A.experiments.length > 120 ? '…' : ''}</li></ul></StoneCard>
          {moneyOpen
            ? <div className="banner banner--warn"><strong>🔒 Your amounts lock when you submit</strong><span className="secondary">Backers rely on these numbers, so you cannot change the budget or milestones afterward. You can still edit the story. If nobody has contributed yet, you can withdraw and edit the numbers.</span></div>
            : <div className="banner"><strong>Funding terms stay as submitted.</strong></div>}
          {moneyOpen && <label className="row" style={{ alignItems: 'flex-start' }}><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 4 }} /> <span>I understand the funding amounts lock after submitting, and that funding opens only after my identity and project review pass.</span></label>}
        </>)}

        {errs.length > 0 && <ul className="danger" role="alert">{errs.map((e) => <li key={e}>• {e}</li>)}</ul>}
        <div className="row row--between">
          <TactileButton variant="ghost" disabled={step === 0} onClick={() => { setErrs([]); setStep(step - 1); }}>Back</TactileButton>
          {step < STEPS.length - 1 ? <TactileButton variant="primary" onClick={next}>Continue</TactileButton> : <TactileButton variant="primary" size="lg" disabled={busy || (moneyOpen && !agree)} onClick={submit}>{busy ? 'Saving...' : edit ? 'Save changes' : 'Post project'}</TactileButton>}
        </div>
      </GlassPanel>
    </div>
  );
}
