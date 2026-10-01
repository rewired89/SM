import { Link, useRoute } from '../../lib/router.js';
import { Icon } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';

export default function MobileNav() {
  const { path } = useRoute();
  const { s } = useStore();
  const { openModal } = useUI();
  const unread = s.notifications.filter((n) => !n.read).length;
  const item = (to, icon, label, on, badge) => (
    <Link to={to} className={`mnav__item ${on ? 'is-active' : ''}`} aria-current={on ? 'page' : undefined}>
      <span className="mnav__ico"><Icon name={icon} size={22} />{badge > 0 && <span className="dot">{badge}</span>}</span><span>{label}</span>
    </Link>
  );
  return (
    <nav className="mnav glass" aria-label="Primary">
      {item('/', 'home', 'Home', path === '/')}
      {item('/explore', 'compass', 'Explore', path.startsWith('/explore') || path.startsWith('/search') || path.startsWith('/tag'))}
      <button type="button" className="mnav__create" aria-label="Create" onClick={() => openModal('create')}><Icon name="plus" size={26} strokeWidth={2.4} /></button>
      {item('/notifications', 'activity', 'Activity', path.startsWith('/notifications') || path.startsWith('/messages'), unread)}
      {item('/profile', 'user', 'Profile', path === '/profile' || path.startsWith('/u/'))}
    </nav>
  );
}
