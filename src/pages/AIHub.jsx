import { useState } from 'react';
import AIToolCard from '../components/ai/AIToolCard.jsx';
import { Tabs, TactileButton } from '../components/ui/index.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import { useUI } from '../store/UIProvider.jsx';
import * as sel from '../store/selectors.js';
import { categoryTree } from '../data/communities.js';

export default function AIHub() {
  const { s } = useStore();
  const { openModal } = useUI();
  const [tab, setTab] = useState('tool');
  const [cat, setCat] = useState('All');
  const all = sel.allTools(s).filter((t) => t.kind === tab);
  const cats = ['All', ...new Set(all.map((t) => t.category))];
  const list = all.filter((t) => cat === 'All' || t.category === cat).sort((a, b) => b.uses - a.uses);
  return (
    <div className="stack stack--lg">
      <div className="row row--between row--wrap"><div><h1>AI</h1><p className="secondary">Tools and agents made by people on Cairn. Free to use, and you can tip the creator when it helps.</p></div><TactileButton variant="primary" icon="plus" onClick={() => openModal('create', { start: 'tool' })}>Publish a tool</TactileButton></div>
      <div className="chips" aria-label="AI areas">{categoryTree.AI.map((c) => <span key={c} className="badge badge--plain">{c}</span>)}</div>
      <Tabs label="AI type" tabs={[{ id: 'tool', label: 'AI Tools' }, { id: 'agent', label: 'AI Agents' }]} value={tab} onChange={(t) => { setTab(t); setCat('All'); }} />
      <div className="chips" role="group" aria-label="Filter by category">{cats.map((c) => <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}</div>
      <div className="grid grid--2">{list.map((t) => <AIToolCard key={t.id} tool={t} />)}</div>
    </div>
  );
}
