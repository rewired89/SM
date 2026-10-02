import { StoneCard, Badge } from '../ui/index.jsx';
import * as sel from '../../store/selectors.js';
import { money } from '../../lib/format.js';

const Block = ({ title, text }) => text ? <div className="stack stack--sm"><h3>{title}</h3><p className="secondary prose pre">{text}</p></div> : null;

export default function ProjectStory({ project: p }) {
  const total = sel.budgetTotal(p.budget);
  const has = p.problem || p.approach || p.experiments || p.budget?.length;
  if (!has) return null;
  return (
    <section className="stack stack--lg" aria-label="Project details">
      <div className="stack">
        <Block title="The problem it solves" text={p.problem} />
        <Block title="Who benefits" text={p.audience} />
        <Block title="How we will solve it" text={p.approach} />
        <Block title="Tests and experiments" text={p.experiments} />
        <div className="grid grid--2"><Block title="Timeline" text={p.timeline} /><Block title="What success looks like" text={p.success} /></div>
        <Block title="Risks and limits" text={p.risks} />
      </div>
      {p.budget?.length > 0 && (
        <div className="stack">
          <div className="row row--between row--wrap"><h2>Where the money goes</h2>{p.fundingLocked && <Badge tone="accent">🔒 Locked {p.lockedAt ? new Date(p.lockedAt).toLocaleDateString() : ''}</Badge>}</div>
          <StoneCard className="stack stack--sm">
            <ul className="budget" aria-label="Budget breakdown">{p.budget.map((b, i) => <li key={i}><div className="row row--between"><strong>{b.item}</strong><strong>{money(b.amount, 2)}</strong></div><span className="muted">{b.why}</span></li>)}</ul>
            <div className="row row--between totals"><span>Total ask</span><strong>{money(total, 2)}</strong></div>
          </StoneCard>
          {p.fundingLocked && <p className="muted">The founder cannot change these amounts after submitting, so backers always know what they are backing.</p>}
        </div>
      )}
    </section>
  );
}
