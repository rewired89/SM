import { useState } from 'react';
import { useRoute, navigate } from '../lib/router.js';
import { Icon, Tabs, Empty, StoneCard, GlassPanel } from '../components/ui/index.jsx';
import { PersonChip, FollowBtn } from '../components/common/bits.jsx';
import IdeaCard from '../components/ideas/IdeaCard.jsx';
import ProjectCard from '../components/projects/ProjectCard.jsx';
import AIToolCard from '../components/ai/AIToolCard.jsx';
import CommunityCard from '../components/communities/CommunityCard.jsx';
import PostCard from '../components/feed/PostCard.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import * as sel from '../store/selectors.js';
import { topTags } from '../data/communities.js';
import { Link } from '../lib/router.js';

export function Results({ r, tab }) {
  const show = (k) => tab === 'all' || tab === k;
  return (
    <div className="stack stack--lg">
      {show('projects') && r.projects.length > 0 && <section className="stack"><h2>Projects</h2><div className="grid grid--2">{r.projects.slice(0, tab === 'all' ? 4 : 99).map((p) => <ProjectCard key={p.id} project={p} />)}</div></section>}
      {show('people') && r.people.length > 0 && <section className="stack"><h2>People</h2><div className="grid grid--2">{r.people.slice(0, tab === 'all' ? 4 : 99).map((u) => <StoneCard key={u.id} to={`/u/${u.id}`} className="row row--between"><PersonChip user={u} size={40} sub={u.headline.slice(0, 2).join(' • ')} /><FollowBtn type="user" id={u.id} name={u.name} /></StoneCard>)}</div></section>}
      {show('ideas') && r.ideas.length > 0 && <section className="stack"><h2>Ideas</h2><div className="grid grid--2">{r.ideas.slice(0, tab === 'all' ? 4 : 99).map((i) => <IdeaCard key={i.id} idea={i} />)}</div></section>}
      {show('tools') && r.tools.length > 0 && <section className="stack"><h2>AI tools</h2><div className="grid grid--2">{r.tools.slice(0, tab === 'all' ? 4 : 99).map((t) => <AIToolCard key={t.id} tool={t} />)}</div></section>}
      {show('communities') && r.communities.length > 0 && <section className="stack"><h2>Communities</h2><div className="grid grid--2">{r.communities.map((c) => <CommunityCard key={c.id} community={c} />)}</div></section>}
      {show('posts') && r.posts.length > 0 && <section className="stack"><h2>Posts</h2><div className="stack">{r.posts.slice(0, tab === 'all' ? 3 : 99).map((p) => <PostCard key={p.id} post={p} />)}</div></section>}
    </div>
  );
}

export default function SearchPage() {
  const { s } = useStore();
  const { query } = useRoute();
  const qs = query.q || '';
  const [tab, setTab] = useState('all');
  const [text, setText] = useState(qs);
  const r = sel.search(s, qs);
  const total = Object.values(r).reduce((a, l) => a + l.length, 0);
  const tagName = qs.replace(/^#/, '');
  const tagged = [...sel.allProjects(s), ...sel.allIdeas(s)].filter((e) => (e.tags || []).some((t) => t.toLowerCase() === tagName.toLowerCase()));
  const tabs = [{ id: 'all', label: `All ${total}` }, ...[['projects', 'Projects'], ['people', 'People'], ['ideas', 'Ideas'], ['tools', 'AI tools'], ['communities', 'Communities'], ['posts', 'Posts']].map(([id, l]) => ({ id, label: `${l} ${r[id].length}` }))];
  return (
    <div className="stack stack--lg">
      <form className="row" role="search" onSubmit={(e) => { e.preventDefault(); navigate(`/search?q=${encodeURIComponent(text.trim())}`); }}>
        <input className="input" autoFocus aria-label="Search" placeholder="Search people, projects, ideas, tools, communities, posts" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn btn--primary" type="submit"><Icon name="search" size={16} />Search</button>
      </form>
      {!qs ? (
        <div className="stack"><h2>Try a topic</h2><div className="chips">{topTags.map((t) => <Link key={t} className="chip" to={`/search?q=${t}`}>{t}</Link>)}</div></div>
      ) : (
        <>
          {tagged.length > 0 && (
            <GlassPanel className="stack stack--sm tagbanner">
              <span className="eyebrow">Hashtag</span>
              <h2>#{(tagged[0].tags.find((t) => t.toLowerCase() === tagName.toLowerCase()))}</h2>
              <p className="secondary">{r.projects.length} project{r.projects.length === 1 ? '' : 's'} and {r.ideas.length} idea{r.ideas.length === 1 ? '' : 's'} use this hashtag. Open one to see its collaborators and ask to join as a collaborator, advisor or co-founder. The founder decides.</p>
              <div className="row row--wrap">{tagged.map((e) => <Link key={e.id} to={sel.collabPath(e)} className="btn btn--sm">👥 {e.title}</Link>)}</div>
            </GlassPanel>
          )}
          <Tabs label="Result types" tabs={tabs} value={tab} onChange={setTab} />
          {total ? <Results r={r} tab={tab} /> : <Empty title={`No results for "${qs}"`}>Try a broader word, or browse the tags above.</Empty>}
        </>
      )}
    </div>
  );
}
