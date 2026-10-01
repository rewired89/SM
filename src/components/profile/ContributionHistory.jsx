import { Empty } from '../ui/index.jsx';
import { Link } from '../../lib/router.js';
import { cents, ago } from '../../lib/format.js';

const href = (c) => (c.targetType === 'tool' ? `/ai/${c.targetId}` : `/${c.targetType}/${c.targetId}`);

export default function ContributionHistory({ items, limit }) {
  const list = limit ? items.slice(0, limit) : items;
  if (!list.length) return <Empty title="No contributions yet">Support a project and it will show up here.</Empty>;
  return (
    <ul className="history" aria-label="Contribution history">
      {list.map((c) => (
        <li key={c.id} className="history__row">
          <div className="grow">
            <Link to={href(c)}><strong>{c.label}</strong></Link>
            <span className="muted"> · {c.kind === 'micro' ? 'Usage contribution' : 'Direct support'} · {ago(c.ts)} ago</span>
            {c.kind === 'micro' && <div className="muted">{c.allocations.map((a) => `${cents(a.amount)} ${a.note?.toLowerCase()}`).join(' · ')}</div>}
          </div>
          <strong>{cents(c.amount)}</strong>
        </li>
      ))}
    </ul>
  );
}
