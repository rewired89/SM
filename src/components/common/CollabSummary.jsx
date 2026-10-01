import { Link } from '../../lib/router.js';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';
import { money } from '../../lib/format.js';

/* one-line summary that links to /collab/:slug */
export default function CollabSummary({ type, entity }) {
  const { s } = useStore();
  const st = sel.collabStats(s, type, entity);
  return (
    <Link to={`/collab/${sel.collabSlug(entity)}`} className="collab-sum" aria-label={`Collaborators for ${entity.title}: ${st.collaborators} on the team, ${st.open} open roles, ${money(st.funded, 0)} of ${money(st.goal)} funded`}>
      <span>👥 {st.collaborators} {st.collaborators === 1 ? 'collaborator' : 'collaborators'}{st.open ? ` · ${st.open} open` : ''}</span>
      <span>{money(st.funded, 0)} of {money(st.goal)}</span>
    </Link>
  );
}
