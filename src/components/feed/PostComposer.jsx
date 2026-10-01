import { useState } from 'react';
import { GlassPanel, Avatar, TactileButton } from '../ui/index.jsx';
import MediaPicker from '../media/MediaPicker.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';
import * as sel from '../../store/selectors.js';

export default function PostComposer() {
  const { a } = useStore();
  const { openModal } = useUI();
  const [text, setText] = useState('');
  const [items, setItems] = useState([]);
  const [links, setLinks] = useState([]);
  const [attach, setAttach] = useState(false);
  const [busy, setBusy] = useState(false);
  const empty = !text.trim() && !items.length && !links.length;
  const submit = async (e) => {
    e.preventDefault();
    if (empty || busy) return;
    setBusy(true);
    try { await a.publishPost({ text: text.trim(), items, links }); setText(''); setItems([]); setLinks([]); setAttach(false); } finally { setBusy(false); }
  };
  return (
    <GlassPanel className="composer">
      <form onSubmit={submit} className="row composer__row">
        <Avatar user={sel.me()} size={40} />
        <input className="input" aria-label="Write a post" placeholder="Share what you are building, learning or wondering..." value={text} onChange={(e) => setText(e.target.value)} />
        <TactileButton type="submit" variant="primary" disabled={empty || busy}>{busy ? '...' : 'Post'}</TactileButton>
      </form>
      {(attach || items.length > 0 || links.length > 0) && <MediaPicker items={items} setItems={setItems} links={links} setLinks={setLinks} />}
      <div className="chips composer__quick">
        <button type="button" className="chip" aria-expanded={attach} onClick={() => setAttach((x) => !x)}>📎 Photo, video, deck or link</button>
        <button type="button" className="chip" onClick={() => openModal('create', { start: 'idea' })}>💡 Idea</button>
        <button type="button" className="chip" onClick={() => openModal('create', { start: 'project' })}>⚙ Project</button>
        <button type="button" className="chip" onClick={() => openModal('create', { start: 'question' })}>❓ Question</button>
        <button type="button" className="chip" onClick={() => openModal('create', { start: 'research' })}>🔬 Research</button>
      </div>
    </GlassPanel>
  );
}
