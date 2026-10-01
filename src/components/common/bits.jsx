import { Link } from '../../lib/router.js';
import { Avatar, Badge } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';
import * as sel from '../../store/selectors.js';
import { ME } from '../../data/users.js';

export const PersonChip = ({ user, size = 36, sub }) => (
  <Link to={user.id === ME ? '/profile' : `/u/${user.id}`} className="person">
    <Avatar user={user} size={size} />
    <span className="person__txt"><strong>{user.name}</strong><span className="muted">{sub || `@${user.handle}`}</span></span>
  </Link>
);

export function SupportBtn({ type, id, amount = 0.5, label, className = 'btn btn--sm btn--primary' }) {
  const { openModal } = useUI();
  return (
    <button type="button" className={className} onClick={() => openModal('support', { targetType: type, targetId: id })} aria-label={`Support ${label || ''} with $${amount.toFixed(2)}`}>
      Support ${amount.toFixed(2)}
    </button>
  );
}

export function FollowBtn({ type, id, name, size = 'sm' }) {
  const { s, a } = useStore();
  const on = sel.has(s, 'following', sel.K(type, id));
  return (
    <button type="button" className={`btn btn--${size} ${on ? 'btn--active' : ''}`} aria-pressed={on} onClick={() => a.follow(type, id, name)}>
      {on ? 'Following' : 'Follow'}
    </button>
  );
}

export const StageBadge = ({ stage }) => <Badge tone="accent">{['Idea', 'Exploring', 'Prototype', 'Active project', 'Validation', 'Released'][stage]}</Badge>;

export const NeedsList = ({ needs }) => (
  <div className="chips">{needs.map((n) => <span key={n} className="badge badge--plain">{n}</span>)}</div>
);
