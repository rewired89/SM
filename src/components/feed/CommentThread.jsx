import { useState } from 'react';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';
import { ME } from '../../data/users.js';
import { Avatar, TactileButton } from '../ui/index.jsx';
import { Link } from '../../lib/router.js';
import { ago } from '../../lib/format.js';

export default function CommentThread({ cKey, placeholder = 'Add a comment...' }) {
  const { s, a } = useStore();
  const [text, setText] = useState('');
  const list = sel.commentsFor(s, cKey);
  const me = sel.me();
  const submit = (e) => { e.preventDefault(); a.comment(cKey, text); setText(''); };
  return (
    <div className="comments">
      <ul aria-label="Comments" className="stack stack--sm">
        {list.map((c) => {
          const u = sel.userById(c.userId);
          return (
            <li key={c.id} className="comment">
              <Avatar user={u} size={28} />
              <div className="comment__body">
                <div><Link to={c.userId === ME ? '/profile' : `/u/${u.id}`}><strong>{u.name}</strong></Link> <span className="muted">{ago(c.ts)}</span></div>
                <p className="secondary">{c.text}</p>
              </div>
            </li>
          );
        })}
        {!list.length && <li className="muted">No comments yet. Start the conversation.</li>}
      </ul>
      <form className="comment-form" onSubmit={submit}>
        <Avatar user={me} size={28} />
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label="Write a comment" />
        <TactileButton type="submit" size="sm" variant="primary" disabled={!text.trim()}>Post</TactileButton>
      </form>
    </div>
  );
}
