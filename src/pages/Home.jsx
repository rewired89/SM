import { useState } from 'react';
import Feed from '../components/feed/Feed.jsx';
import PostComposer from '../components/feed/PostComposer.jsx';
import { Tabs, GlassPanel, TactileButton } from '../components/ui/index.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import * as sel from '../store/selectors.js';
import { Link } from '../lib/router.js';

const TABS = [{ id: 'foryou', label: 'For you' }, { id: 'following', label: 'Following' }, { id: 'watch', label: 'Watch' }, { id: 'updates', label: 'Updates' }, { id: 'collab', label: 'Collaborate' }];

export default function Home() {
  const { s } = useStore();
  const [tab, setTab] = useState('foryou');
  const aurora = sel.projectById(s, 'p_aurora');
  return (
    <div className="stack">
      <GlassPanel className="hero">
        <span className="eyebrow">Start here</span>
        <h1>Find something interesting. Help it exist.</h1>
        <p className="secondary">Nomi is where ideas, projects and AI tools get discovered, joined and funded one small step at a time. Try the loop: open a project, use a related tool, then contribute $0.50 and watch the progress move.</p>
        <div className="row row--wrap">
          <TactileButton variant="primary" to={`/project/${aurora.id}`}>Open Project Aurora</TactileButton>
          <TactileButton to="/explore">Explore everything</TactileButton>
          <TactileButton to="/play">Play & learn</TactileButton>
          <Link to="/fund" className="btn btn--ghost">See where $0.50 goes</Link>
        </div>
      </GlassPanel>
      <PostComposer />
      <Tabs label="Feed filters" tabs={TABS} value={tab} onChange={setTab} />
      <Feed tab={tab} />
    </div>
  );
}
