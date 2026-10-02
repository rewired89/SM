import { ProgressBar, Badge } from '../ui/index.jsx';
import { SupportBtn } from '../common/bits.jsx';
import { money, pct } from '../../lib/format.js';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';
import * as sel from '../../store/selectors.js';
import { ME } from '../../data/users.js';
import { TactileButton } from '../ui/index.jsx';

export default function FundingMilestone({ milestone, projectId, compact }) {
  const { s } = useStore();
  const { openModal } = useUI();
  const proj = sel.projectById(s, projectId);
  const evidence = milestone.done ? sel.evidenceFor(s, milestone.id) : [];
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
        {done ? <span className="success">Milestone fully funded.</span> : <span className="muted">Remaining {money(milestone.needed - milestone.funded, 2)}</span>}
      </div>
      {milestone.done && !compact && (evidence.length ? <p className="ok">✓ Results posted: {evidence[0].extra.changed}</p> : proj?.ownerId === ME ? <div className="banner banner--warn"><strong>Backers are waiting for results</strong><span className="secondary">This milestone is funded. Post what you did with the money. It counts toward your reputation.</span><div><TactileButton size="sm" variant="primary" onClick={() => openModal('create', { start: 'update', projectId, milestoneId: milestone.id })}>Post evidence</TactileButton></div></div> : <p className="muted">Funded. Waiting for the founder to post results.</p>)}
      {milestone.unlocks && <p className="secondary"><strong>Unlocks:</strong> {milestone.unlocks}</p>}
      {milestone.evidence && <p className="muted"><strong>Evidence we will post:</strong> {milestone.evidence}</p>}
      {!compact && !done && <SupportBtn type="project" id={projectId} label={milestone.title} />}
    </div>
  );
}
