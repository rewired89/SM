import { useState } from 'react';
import { Modal, TactileButton, ProgressBar, Badge } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';
import * as sel from '../../store/selectors.js';
import { navigate } from '../../lib/router.js';
import { money, cents, pctLabel } from '../../lib/format.js';

const AMOUNTS = [0.5, 1, 2, 5];
const pc = (before, after) => (after - before < 0.1 ? 2 : 1);

export default function SupportModal({ targetType, targetId }) {
  const { s, a } = useStore();
  const { closeModal } = useUI();
  const [amount, setAmount] = useState(0.5);
  const [result, setResult] = useState(null);
  const e = sel.entityOf(s, { type: targetType, id: targetId });
  const name = sel.nameOf(e);
  const isProject = targetType === 'project';
  const funded = targetType === 'tool' ? null : sel.fundedOf(s, targetType, e);
  const goal = isProject ? sel.projectGoal(s, e) : targetType === 'idea' ? e.goal : null;
  const ms = isProject ? sel.activeMilestone(s, e.id) : null;

  if (result) {
    const r = result;
    const d = r.before ? pc(r.before.pct, r.after.pct) : 1;
    return (
      <Modal title="Thank you" onClose={closeModal} label="Contribution confirmation">
        <div className="stack">
          <div className="thanks">
            <span className="confetti" aria-hidden="true">{r.completed ? '🎉' : '✦'}</span>
            <p>Your <strong>{cents(r.entry.amount)}</strong> contributed to:</p>
            <h3 className="card-title">{r.entry.label}</h3>
          </div>
          {r.completed && <div className="banner banner--success"><strong>Milestone complete</strong><span>{r.completed.title} is funded. The creator will post an update.</span></div>}
          {r.before && (
            <div className="stack stack--sm">
              <span className="eyebrow">Funding progress</span>
              <ProgressBar value={r.after.pct} done={r.completed} label="Funding progress" />
              <span className="secondary">{pctLabel(r.before.pct, d)} → <strong>{pctLabel(r.after.pct, d)}</strong> · {money(r.before.funded, 2)} → {money(r.after.funded, 2)}</span>
            </div>
          )}
          <ul className="alloc">{r.allocations.map((al) => <li key={al.label + al.type}><span>{al.note || al.label}</span><strong>{cents(al.amount)}</strong></li>)}</ul>
          <p className="muted">You helped move the project forward. Prototype only: no real money moved.</p>
          <div className="row row--wrap">
            <TactileButton variant="primary" onClick={() => { closeModal(); navigate('/fund'); }}>View funding</TactileButton>
            <TactileButton variant="ghost" onClick={closeModal}>Done</TactileButton>
          </div>
        </div>
      </Modal>
    );
  }

  const submit = () => { const r = a.contribute({ targetType, targetId, amount }); if (r) setResult(r); };
  return (
    <Modal title={`Support ${name}`} onClose={closeModal} label="Support">
      <div className="stack">
        <div className="banner">
          <Badge tone="accent">Optional contribution</Badge>
          <span className="secondary">Free to use. Nothing here is required. Prototype with simulated money.</span>
        </div>
        {funded !== null ? (
          <div className="stack stack--sm">
            <div className="row row--between"><span className="eyebrow">{isProject ? 'Current funding' : 'Idea funding'}</span><strong>{money(funded, 0)} <span className="muted">of {money(goal)}</span></strong></div>
            <ProgressBar value={Math.min(100, (funded / goal) * 100)} label="Current funding" />
            {ms && <span className="muted">Next milestone: {ms.title}, {money(ms.needed - ms.funded, 2)} to go</span>}
          </div>
        ) : <p className="secondary">100% of a direct tool contribution goes to its creator in this prototype.</p>}
        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="label">Choose contribution</legend>
          <div className="chips" role="radiogroup" aria-label="Contribution amount">
            {AMOUNTS.map((v) => (
              <button key={v} type="button" role="radio" aria-checked={amount === v} className="chip chip--amount" onClick={() => setAmount(v)}>{cents(v)}</button>
            ))}
          </div>
        </fieldset>
        <div className="row row--between"><span className="muted">Prototype wallet {cents(s.wallet)}</span></div>
        <TactileButton variant="primary" size="lg" className="btn--block" onClick={submit}>Contribute {cents(amount)}</TactileButton>
      </div>
    </Modal>
  );
}
