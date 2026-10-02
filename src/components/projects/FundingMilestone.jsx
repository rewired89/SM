import { ProgressBar, Badge } from '../ui/index.jsx';
import { SupportBtn } from '../common/bits.jsx';
import { money, pct } from '../../lib/format.js';

export default function FundingMilestone({ milestone, projectId, compact }) {
  const done = milestone.done;
  const value = pct(milestone.funded, milestone.needed);
  return (
    <div className={`milestone ${done ? 'milestone--done' : ''}`}>
      <div className="row row--between">
        <span className="eyebrow">{done ? 'Milestone complete' : 'Milestone'}</span>
        {done && <Badge tone="success">Funded</Badge>}
      </div>
      <h3>{done && <span aria-hidden="true">🎉 </span>}{milestone.title}</h3>
      <ProgressBar value={value} done={done} label={`${milestone.title} funding`} />
      <div className="row row--between row--wrap">
        <span className="secondary">{money(milestone.funded, Number.isInteger(milestone.funded) ? 0 : 2)} funded of {money(milestone.needed)}</span>
        {done ? <span className="success">The creator has posted an update.</span> : <span className="muted">Remaining {money(milestone.needed - milestone.funded, 2)}</span>}
      </div>
      {milestone.unlocks && <p className="secondary"><strong>Unlocks:</strong> {milestone.unlocks}</p>}
      {milestone.evidence && <p className="muted"><strong>Evidence we will post:</strong> {milestone.evidence}</p>}
      {!compact && !done && <SupportBtn type="project" id={projectId} label={milestone.title} />}
    </div>
  );
}
