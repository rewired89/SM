import { useState } from 'react';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';

export function ReputationBadge({ userId, compact }) {
  const { s } = useStore();
  const r = sel.reputationOf(s, userId);
  return <span className={`rep rep--${r.tier.replace(' ', '-').toLowerCase()}`} title={`${r.tier}. Earned through results, updates and respectful conduct.`}><span aria-hidden="true">★</span> {r.score}%{!compact && <span className="rep__tier"> {r.tier}</span>}<span className="sr-only"> reputation</span></span>;
}

export function ReputationPanel({ userId, name }) {
  const { s } = useStore();
  const [open, setOpen] = useState(false);
  const r = sel.reputationOf(s, userId);
  return (
    <div className="stack stack--sm">
      <div className="row row--between row--wrap">
        <div><span className="eyebrow">Reputation</span><div className="rep-big"><strong>{r.score}%</strong> <span className="muted">{r.tier}</span></div></div>
        <button type="button" className="linkbtn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? 'Hide' : 'How is this calculated?'}</button>
      </div>
      {r.launched > 0 && <p className="secondary">{r.funded} of {r.launched} projects got funded{r.evidenceRatio !== null ? `, and ${Math.round(r.evidenceRatio * 100)}% of completed milestones have results posted` : ''}.</p>}
      {open && (
        <ul className="stack stack--sm">
          {r.factors.map((f) => <li key={f.label} className="row row--between"><span><strong>{f.label}</strong><span className="muted"> · {f.note}</span></span><strong className={f.delta < 0 ? 'danger' : 'ok'}>{f.delta > 0 ? '+' : ''}{f.delta}</strong></li>)}
          <li className="muted">Disrespect lowers it: each strike costs 10 points, and repeated violations lead to suspension or removal. {name} earns it back by posting real results.</li>
        </ul>
      )}
    </div>
  );
}
