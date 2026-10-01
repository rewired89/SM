import { useState } from 'react';
import ProjectCard from '../components/projects/ProjectCard.jsx';
import { TactileButton, Tabs } from '../components/ui/index.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import { useUI } from '../store/UIProvider.jsx';
import * as sel from '../store/selectors.js';

const CATS = ['All', 'AI', 'Science', 'Technology', 'Creative'];

export default function Projects() {
  const { s } = useStore();
  const { openModal } = useUI();
  const [cat, setCat] = useState('All');
  const [only, setOnly] = useState('all');
  let list = sel.allProjects(s).filter((p) => cat === 'All' || p.category === cat);
  if (only === 'following') list = list.filter((p) => sel.has(s, 'following', sel.K('project', p.id)));
  if (only === 'collab') list = list.filter((p) => p.looking?.some((l) => l.open));
  if (only === 'funding') list = list.filter((p) => sel.projectPct(s, p) < 100).sort((a, b) => sel.projectPct(s, b) - sel.projectPct(s, a));
  return (
    <div className="stack stack--lg">
      <div className="row row--between row--wrap"><div><h1>Projects</h1><p className="secondary">Things people are actively building. Read the updates, then help move them forward.</p></div><TactileButton variant="primary" icon="plus" onClick={() => openModal('create', { start: 'project' })}>Start a project</TactileButton></div>
      <Tabs label="Category" tabs={CATS.map((c) => ({ id: c, label: c }))} value={cat} onChange={setCat} />
      <div className="chips" role="group" aria-label="Filters">
        {[['all', 'All'], ['following', 'Following'], ['collab', 'Looking for collaborators'], ['funding', 'Needs funding']].map(([id, label]) => (
          <button key={id} type="button" className="chip" aria-pressed={only === id} onClick={() => setOnly(id)}>{label}</button>
        ))}
      </div>
      <div className="grid grid--2">{list.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
      {!list.length && <p className="empty">Nothing matches. Follow a project from its page and it will appear here.</p>}
    </div>
  );
}
