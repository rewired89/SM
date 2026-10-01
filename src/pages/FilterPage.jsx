import { useState } from 'react';
import { Tabs } from '../components/ui/index.jsx';
import { Results } from './SearchPage.jsx';
import { PersonChip, FollowBtn } from '../components/common/bits.jsx';
import { StoneCard, Empty } from '../components/ui/index.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import * as sel from '../store/selectors.js';
import { categoryTree } from '../data/communities.js';
import { Link } from '../lib/router.js';
import { ME } from '../data/users.js';

export default function FilterPage({ kind, value }) {
  const { s } = useStore();
  const [tab, setTab] = useState('all');
  if (kind === 'category' && value === 'People') {
    return <div className="stack stack--lg"><h1>People</h1><div className="grid grid--2">{sel.allUsers().filter((u) => u.id !== ME).map((u) => <StoneCard key={u.id} to={`/u/${u.id}`} className="row row--between"><PersonChip user={u} size={40} sub={u.headline.slice(0, 2).join(' • ')} /><FollowBtn type="user" id={u.id} name={u.name} /></StoneCard>)}</div></div>;
  }
  const tag = kind === 'tag' ? value.toLowerCase() : null;
  const r = sel.search(s, '');
  const inCat = (e) => [e.category, e.sub, ...(e.subs || []), e.subcategory].some((x) => x && x.toLowerCase() === value.toLowerCase());
  const hasTag = (e) => (e.tags || []).some((t) => t.toLowerCase() === tag);
  const f = kind === 'tag' ? hasTag : inCat;
  const res = {
    projects: sel.allProjects(s).filter((e) => (value === 'Projects' ? true : f(e))),
    ideas: sel.allIdeas(s).filter((e) => (value === 'Ideas' ? true : f(e))),
    tools: sel.allTools(s).filter((e) => (value === 'AI' ? true : f(e))),
    communities: kind === 'tag' ? sel.allCommunities(s).filter(hasTag) : [],
    posts: kind === 'tag' ? sel.allPosts(s).filter(hasTag) : sel.allPosts(s).filter((p) => (p.tags || []).some((t) => t.toLowerCase() === value.toLowerCase()) || (p.ref && f(sel.entityOf(s, p.ref) || {}))),
    people: kind === 'tag' ? sel.allUsers().filter((u) => u.skills.concat(u.headline).some((x) => x.toLowerCase() === tag)) : [],
  };
  if (kind === 'category') { if (value === 'Ideas') res.projects = []; if (value === 'Projects') res.ideas = []; if (['Ideas', 'Projects'].includes(value)) res.tools = []; if (!['AI'].includes(value) && value !== 'Projects' && value !== 'Ideas') res.tools = res.tools.filter(f); }
  const total = Object.values(res).reduce((a, l) => a + l.length, 0);
  const tabs = [{ id: 'all', label: `All ${total}` }, ...[['projects', 'Projects'], ['ideas', 'Ideas'], ['tools', 'AI tools'], ['posts', 'Posts'], ['people', 'People'], ['communities', 'Communities']].filter(([id]) => res[id].length).map(([id, l]) => ({ id, label: `${l} ${res[id].length}` }))];
  const subs = categoryTree[value];
  return (
    <div className="stack stack--lg">
      <div><span className="eyebrow">{kind === 'tag' ? 'Tag' : 'Category'}</span><h1>{kind === 'tag' ? `#${value}` : value}</h1></div>
      {subs?.length > 0 && <div className="chips">{subs.map((x) => <Link key={x} className="chip" to={`/category/${x}`}>{x}</Link>)}</div>}
      {total ? (<><Tabs label="Result types" tabs={tabs} value={tabs.some((t) => t.id === tab) ? tab : 'all'} onChange={setTab} /><Results r={res} tab={tab} /></>) : <Empty title="Nothing here yet">Be the first to share something in {value}.</Empty>}
    </div>
  );
}
