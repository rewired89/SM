import { useState } from 'react';
import { Link } from '../lib/router.js';
import IdeaCard from '../components/ideas/IdeaCard.jsx';
import ProjectCard from '../components/projects/ProjectCard.jsx';
import AIToolCard from '../components/ai/AIToolCard.jsx';
import CommunityCard from '../components/communities/CommunityCard.jsx';
import PostCard from '../components/feed/PostCard.jsx';
import { PersonChip, FollowBtn } from '../components/common/bits.jsx';
import { StoneCard, Tag } from '../components/ui/index.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import * as sel from '../store/selectors.js';
import { topTags, categoryTree } from '../data/communities.js';
import { ME } from '../data/users.js';

export const Section = ({ title, to, children, cols = 2 }) => (
  <section className="section" aria-label={title}>
    <div className="row row--between"><h2>{title}</h2>{to && <Link to={to} className="muted">See all →</Link>}</div>
    <div className={`grid grid--${cols}`}>{children}</div>
  </section>
);

export default function Explore() {
  const { s } = useStore();
  const posts = sel.allPosts(s);
  const trendingPosts = posts.slice().sort((a, b) => sel.likeCount(s, b) - sel.likeCount(s, a)).slice(0, 2);
  const projects = sel.allProjects(s);
  const ideas = sel.allIdeas(s);
  const needsFunding = projects.filter((p) => p.ownerId !== ME).sort((a, b) => sel.projectPct(s, a) - sel.projectPct(s, b)).slice(0, 2);
  const momentum = projects.slice().sort((a, b) => sel.projectPct(s, b) - sel.projectPct(s, a)).filter((p) => sel.projectPct(s, p) < 100).slice(0, 2);
  const looking = projects.filter((p) => p.looking?.some((l) => l.open) && p.ownerId !== ME).slice(0, 2);
  const research = posts.filter((p) => p.type === 'research').slice(0, 2);
  return (
    <div className="stack stack--lg">
      <div><h1>Explore</h1><p className="secondary">Discover what people are building and how you can take part.</p></div>
      <div className="chips" aria-label="Categories">
        {Object.keys(categoryTree).map((c) => <Link key={c} to={`/category/${c}`} className="chip">{c}</Link>)}
        {['Communities', 'People'].map((c) => <Link key={c} to={c === 'People' ? '/category/People' : '/communities'} className="chip">{c}</Link>)}
      </div>
      <div className="chips chips--tags" aria-label="Popular tags">{topTags.map((t) => <Tag key={t} tag={t} />)}</div>
      <Section title="Trending" cols={1}>{trendingPosts.map((p) => <PostCard key={p.id} post={p} />)}</Section>
      <Section title="New ideas" to="/ideas">{ideas.slice(0, 4).map((i) => <IdeaCard key={i.id} idea={i} />)}</Section>
      <Section title="Projects gaining momentum" to="/projects">{momentum.map((p) => <ProjectCard key={p.id} project={p} />)}</Section>
      <Section title="AI tools" to="/ai">{sel.allTools(s).filter((t) => t.kind === 'tool').slice(0, 4).map((t) => <AIToolCard key={t.id} tool={t} />)}</Section>
      <Section title="Recent research" cols={1}>{research.map((p) => <PostCard key={p.id} post={p} />)}</Section>
      <Section title="Looking for collaborators">{looking.map((p) => <ProjectCard key={p.id} project={p} />)}</Section>
      <Section title="Needs funding">{needsFunding.map((p) => <ProjectCard key={p.id} project={p} />)}</Section>
      <Section title="Communities" to="/communities">{sel.allCommunities(s).slice(0, 4).map((c) => <CommunityCard key={c.id} community={c} />)}</Section>
      <Section title="People to follow" cols={3}>
        {sel.allUsers().filter((u) => u.id !== ME).slice(0, 6).map((u) => (
          <StoneCard key={u.id} className="person-card" to={`/u/${u.id}`} label={`Open ${u.name}'s profile`}>
            <PersonChip user={u} size={44} sub={u.headline.slice(0, 2).join(' • ')} />
            {u.openToCollab && <span className="badge badge--success" style={{ width: 'fit-content' }}>🤝 Open to collaborations</span>}
            <div className="chips">{u.skills.slice(0, 3).map((k) => <span key={k} className="badge badge--plain">{k}</span>)}</div>
            <FollowBtn type="user" id={u.id} name={u.name} />
          </StoneCard>
        ))}
      </Section>
    </div>
  );
}
