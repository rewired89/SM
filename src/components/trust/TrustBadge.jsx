import { Link } from '../../lib/router.js';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';

export default function TrustBadge({ project }) {
  const { s } = useStore();
  const r = sel.reviewOf(s, project.id);
  const f = sel.fundable(s, 'project', project);
  return (
    <span className="trust">
      {f.ok
        ? <Link to="/trust" className="badge badge--success" title="Passed project review and the creator is verified">✓ Reviewed {r.score}/100 · Verified creator</Link>
        : <Link to="/trust" className="badge badge--warning" title={f.reasons[0]}>Funding not enabled</Link>}
    </span>
  );
}
