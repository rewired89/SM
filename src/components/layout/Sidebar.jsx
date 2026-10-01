import { Link, useRoute } from '../../lib/router.js';
import { Icon, TactileButton } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';

export const NAV = [
  { to: '/', icon: 'home', label: 'Home', match: (p) => p === '/' },
  { to: '/explore', icon: 'compass', label: 'Explore', match: (p) => p.startsWith('/explore') || p.startsWith('/tag') || p.startsWith('/category') || p.startsWith('/search') },
  { to: '/ideas', icon: 'bulb', label: 'Ideas', match: (p) => p.startsWith('/idea') },
  { to: '/projects', icon: 'tool', label: 'Projects', match: (p) => p.startsWith('/project') },
  { to: '/ai', icon: 'bot', label: 'AI', match: (p) => p.startsWith('/ai') },
  { to: '/play', icon: 'gamepad', label: 'Play', match: (p) => p.startsWith('/play') },
  { to: '/communities', icon: 'users', label: 'Communities', match: (p) => p.startsWith('/communit') },
  { to: '/fund', icon: 'coin', label: 'Fund', match: (p) => p.startsWith('/fund') },
  { to: '/messages', icon: 'mail', label: 'Messages', match: (p) => p.startsWith('/messages'), badge: 'msg' },
  { to: '/notifications', icon: 'bell', label: 'Notifications', match: (p) => p.startsWith('/notifications'), badge: 'note' },
  { to: '/profile', icon: 'user', label: 'Profile', match: (p) => p === '/profile' || p.startsWith('/u/') },
  { to: '/settings', icon: 'settings', label: 'Settings', match: (p) => p.startsWith('/settings') },
];

export default function Sidebar() {
  const { path } = useRoute();
  const { s } = useStore();
  const { openModal } = useUI();
  const badge = { msg: s.conversations.reduce((a, c) => a + c.unread, 0), note: s.notifications.filter((n) => !n.read).length };
  return (
    <aside className="sidebar">
      <nav aria-label="Main">
        <TactileButton variant="primary" size="lg" className="btn--block sidebar__create" icon="plus" onClick={() => openModal('create')}><span className="sidebar__label">Create</span></TactileButton>
        <ul>
          {NAV.map((n) => {
            const on = n.match(path);
            const count = n.badge ? badge[n.badge] : 0;
            return (
              <li key={n.to}>
                <Link to={n.to} className={`navlink ${on ? 'is-active' : ''}`} aria-current={on ? 'page' : undefined} title={n.label}>
                  <Icon name={n.icon} size={20} /><span className="sidebar__label">{n.label}</span>
                  {count > 0 && <span className="count" aria-label={`${count} unread`}>{count}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <p className="sidebar__tag sidebar__label muted">Participation over popularity.</p>
    </aside>
  );
}
