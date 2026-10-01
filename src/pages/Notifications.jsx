import { navigate } from '../lib/router.js';
import { GlassPanel, TactileButton, Icon, Empty } from '../components/ui/index.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import { ago } from '../lib/format.js';

const ICON = { comment: 'comment', join: 'users', interest: 'bulb', update: 'tool', milestone: 'flag', collab: 'users', tool: 'bot', follow: 'user', support: 'coin' };

export default function Notifications() {
  const { s, a } = useStore();
  const unread = s.notifications.filter((n) => !n.read).length;
  const open = (n) => { a.markRead(n.id); navigate(n.to); };
  return (
    <div className="stack stack--lg">
      <div className="row row--between row--wrap"><div><h1>Notifications</h1><p className="secondary">{unread ? `${unread} new` : 'You are all caught up.'}</p></div>{unread > 0 && <TactileButton onClick={a.markAllRead}>Mark all read</TactileButton>}</div>
      {s.notifications.length ? (
        <ul className="stack stack--sm" aria-label="Notifications">
          {s.notifications.map((n) => (
            <li key={n.id}><button type="button" className={`tile tile--interactive notif ${n.read ? '' : 'is-new'}`} onClick={() => open(n)}>
              <span className="notif__ico"><Icon name={ICON[n.type] || 'bell'} size={18} /></span>
              <span className="grow notif__text">{n.text}</span>
              <span className="muted">{ago(n.ts)}</span>
              {!n.read && <span className="notif__dot" aria-label="Unread" />}
            </button></li>
          ))}
        </ul>
      ) : <Empty title="Nothing yet" />}
    </div>
  );
}
