import { useState } from 'react';
import IdeaCard from '../components/ideas/IdeaCard.jsx';
import { Stepper } from '../components/ideas/IdeaPage.jsx';
import { TactileButton, Tabs } from '../components/ui/index.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import { useUI } from '../store/UIProvider.jsx';
import * as sel from '../store/selectors.js';

const CATS = ['All', 'AI', 'Science', 'Technology', 'Creative'];

export default function Ideas() {
  const { s } = useStore();
  const { openModal } = useUI();
  const [cat, setCat] = useState('All');
  const [sort, setSort] = useState('hot');
  let list = sel.allIdeas(s).filter((i) => cat === 'All' || i.category === cat);
  list = list.slice().sort((a, b) => (sort === 'hot' ? sel.interestCount(s, b) - sel.interestCount(s, a) : sort === 'need' ? b.looking - a.looking : sel.ideaPct(s, a) - sel.ideaPct(s, b)));
  return (
    <div className="stack stack--lg">
      <div className="row row--between row--wrap"><div><h1>Ideas</h1><p className="secondary">Early concepts that might become something. Show interest, add thinking, find co-builders.</p></div><TactileButton variant="primary" icon="plus" onClick={() => openModal('create', { start: 'idea' })}>Share an idea</TactileButton></div>
      <div className="tile tile--flat"><span className="eyebrow">Every idea can grow</span><Stepper stage={1} /></div>
      <div className="row row--between row--wrap"><Tabs label="Category" tabs={CATS.map((c) => ({ id: c, label: c }))} value={cat} onChange={setCat} />
        <label className="row"><span className="muted">Sort</span><select className="select" style={{ width: 'auto' }} value={sort} onChange={(e) => setSort(e.target.value)}><option value="hot">Most interest</option><option value="need">Needs collaborators</option><option value="fund">Least funded</option></select></label></div>
      <div className="grid grid--2">{list.map((i) => <IdeaCard key={i.id} idea={i} />)}</div>
    </div>
  );
}
