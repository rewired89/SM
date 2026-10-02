import { useState } from 'react';
import { Link, navigate, useRoute } from '../../lib/router.js';
import { Icon, Avatar } from '../ui/index.jsx';
import Logo from './Logo.jsx';
import SearchBox from './SearchBox.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';
import { useUI } from '../../store/UIProvider.jsx';
import { cents } from '../../lib/format.js';

export default function TopBar() {
  const { s } = useStore();
  const { openModal } = useUI();
  const { path, query } = useRoute();
  const [text, setText] = useState('');
  const unread = s.notifications.filter((n) => !n.read).length;
  const submit = (e) => { e.preventDefault(); if (text.trim()) navigate(`/search?q=${encodeURIComponent(text.trim())}`); };
  const value = path === '/search' && query.q && !text ? query.q : text;
  return (
    <header className="topbar glass">
      <Link to="/" className="brand" aria-label="Nomi home"><Logo /><span className="brand__name">Nomi</span></Link>
      <SearchBox initial={path === '/search' ? query.q : ''} key={path === '/search' ? query.q : 'x'} />
      <div className="topbar__right">
        <Link to="/search" className="iconbtn topbar__searchicon" aria-label="Search"><Icon name="search" /></Link>
        <Link to="/play" className="iconbtn" aria-label="Play and learn" title="Play & Learn"><Icon name="gamepad" /></Link>
        <button type="button" className="iconbtn" aria-label="Change colors" title="Colors" onClick={() => openModal('theme')}><Icon name="palette" /></button>
        <Link to="/rewards" className="wallet wallet--sparks" aria-label={`${s.rewards.sparks} sparks. Open rewards`}><span aria-hidden="true">✦</span><span>{s.rewards.sparks}</span></Link>
        <Link to="/fund" className="wallet" aria-label={`${cents(sel.remainingToday(s))} left to contribute today. Open funding`}><Icon name="coin" size={15} /><span>{cents(sel.remainingToday(s))}</span></Link>
        <Link to="/notifications" className="iconbtn bell" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
          <Icon name="bell" />{unread > 0 && <span className="dot">{unread > 9 ? '9+' : unread}</span>}
        </Link>
        <Link to="/profile" aria-label="Your profile"><Avatar user={sel.me()} size={34} /></Link>
      </div>
    </header>
  );
}
