import { useState } from 'react';
import { GlassPanel, Avatar, TactileButton } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';
import * as sel from '../../store/selectors.js';

export default function PostComposer() {
  const { a } = useStore();
  const { openModal } = useUI();
  const [text, setText] = useState('');
  const submit = (e) => { e.preventDefault(); if (!text.trim()) return; a.createPost({ text: text.trim() }); setText(''); };
  return (
    <GlassPanel className="composer">
      <form onSubmit={submit} className="row composer__row">
        <Avatar user={sel.me()} size={40} />
        <input className="input" aria-label="Write a post" placeholder="Share what you are building, learning or wondering..." value={text} onChange={(e) => setText(e.target.value)} />
        <TactileButton type="submit" variant="primary" disabled={!text.trim()}>Post</TactileButton>
      </form>
      <div className="chips composer__quick">
        <button type="button" className="chip" onClick={() => openModal('create', { start: 'idea' })}>💡 Idea</button>
        <button type="button" className="chip" onClick={() => openModal('create', { start: 'project' })}>⚙ Project</button>
        <button type="button" className="chip" onClick={() => openModal('create', { start: 'question' })}>❓ Question</button>
        <button type="button" className="chip" onClick={() => openModal('create', { start: 'research' })}>🔬 Research</button>
      </div>
    </GlassPanel>
  );
}
