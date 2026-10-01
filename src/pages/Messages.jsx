import { useEffect, useRef, useState } from 'react';
import { Link, navigate } from '../lib/router.js';
import { Avatar, GlassPanel, Empty, TactileButton, Icon } from '../components/ui/index.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import * as sel from '../store/selectors.js';
import { ago } from '../lib/format.js';

export default function Messages({ id }) {
  const { s, a } = useStore();
  const [text, setText] = useState('');
  const end = useRef(null);
  const sorted = s.conversations.slice().sort((x, y) => y.messages[y.messages.length - 1].ts - x.messages[x.messages.length - 1].ts);
  const cv = sorted.find((c) => c.id === id);
  useEffect(() => { if (cv?.unread) a.readConversation(cv.id); end.current?.scrollIntoView({ block: 'end' }); }, [cv?.id, cv?.messages.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const send = (e) => { e.preventDefault(); a.sendMessage(cv.id, text, cv.userId); setText(''); };
  return (
    <div className={`messages ${cv ? 'has-thread' : ''}`}>
      <GlassPanel className="messages__list" as="nav" aria-label="Conversations">
        <h1 className="messages__title">Messages</h1>
        <ul>
          {sorted.map((c) => {
            const u = sel.userById(c.userId);
            const last = c.messages[c.messages.length - 1];
            return (
              <li key={c.id}><Link to={`/messages/${c.id}`} className={`conv ${c.id === id ? 'is-active' : ''}`} aria-current={c.id === id ? 'true' : undefined}>
                <Avatar user={u} size={40} />
                <span className="grow"><strong>{u.name}</strong><span className="conv__last muted">{last.from === 'me' ? 'You: ' : ''}{last.text}</span></span>
                <span className="muted conv__time">{ago(last.ts)}</span>
                {c.unread > 0 && <span className="count">{c.unread}</span>}
              </Link></li>
            );
          })}
        </ul>
      </GlassPanel>
      <GlassPanel className="messages__thread">
        {cv ? (() => {
          const u = sel.userById(cv.userId);
          return (
            <>
              <div className="thread__head row"><button type="button" className="iconbtn thread__back" onClick={() => navigate('/messages')} aria-label="Back to conversations"><Icon name="back" /></button><Avatar user={u} size={36} /><Link to={`/u/${u.id}`}><strong>{u.name}</strong></Link></div>
              <ul className="thread__body" aria-label={`Conversation with ${u.name}`}>
                {cv.messages.map((m, i) => <li key={i} className={`bubble bubble--${m.from}`}><p>{m.text}</p><span className="muted">{ago(m.ts)}</span></li>)}
                <li ref={end} aria-hidden="true" />
              </ul>
              <form className="thread__form row" onSubmit={send}><input className="input" aria-label="Write a message" placeholder={`Message ${u.name.split(' ')[0]}...`} value={text} onChange={(e) => setText(e.target.value)} /><TactileButton type="submit" variant="primary" icon="send" disabled={!text.trim()}>Send</TactileButton></form>
            </>
          );
        })() : <Empty title="Select a conversation">Message collaborators, discuss projects, and answer collaboration requests.</Empty>}
      </GlassPanel>
    </div>
  );
}
