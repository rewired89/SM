import { useState } from 'react';
import { Link } from '../../lib/router.js';
import { GlassPanel, StoneCard, Empty, Tag } from '../ui/index.jsx';
import { PersonChip } from '../common/bits.jsx';
import { JoinBtn } from './CommunityCard.jsx';
import PostCard from '../feed/PostCard.jsx';
import CommentThread from '../feed/CommentThread.jsx';
import { StoneCard as CCard } from '../ui/index.jsx';
import ProjectCard from '../projects/ProjectCard.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';

function Discussion({ d, community }) {
  const { s } = useStore();
  const [open, setOpen] = useState(false);
  const key = `disc:${d.id}`;
  const u = sel.userById(d.authorId);
  return (
    <StoneCard className="stack stack--sm">
      <div className="row row--between">
        <button type="button" className="disc-title" aria-expanded={open} onClick={() => setOpen((o) => !o)}>“{d.title}”</button>
        <span className="muted">{(d.replies + (s.comments[key] || []).length).toLocaleString()} replies</span>
      </div>
      <span className="muted">Started by <Link to={`/u/${u.id}`}>{u.name}</Link></span>
      {open && (sel.has(s, 'joined', community.id) ? <CommentThread cKey={key} placeholder="Reply to the thread..." /> : <p className="muted">Join {community.name} to reply.</p>)}
    </StoneCard>
  );
}

export default function CommunityPage({ id }) {
  const { s, a } = useStore();
  const c = sel.communityById(s, id);
  const [text, setText] = useState('');
  if (!c) return <Empty title="Community not found"><Link to="/communities" className="btn">Browse communities</Link></Empty>;
  const joined = sel.has(s, 'joined', c.id);
  const challenge = sel.allChallenges(s).find((x) => x.communityId === c.id);
  const posts = sel.allPosts(s).filter((p) => p.ref?.type === 'community' && p.ref.id === c.id || p.communityId === c.id);
  const projs = sel.allProjects(s).filter((p) => p.tags.some((t) => c.tags.includes(t))).slice(0, 2);
  const submit = (e) => { e.preventDefault(); if (!text.trim()) return; const post = a.createPost({ text: text.trim(), tags: c.tags.slice(0, 1), ref: { type: 'community', id: c.id } }); setText(''); };
  return (
    <article className="stack stack--lg">
      <GlassPanel className="page-head">
        <span className="eyebrow">Community</span>
        <div className="row row--between row--wrap"><h1>{c.name}</h1><JoinBtn community={c} size="md" /></div>
        <p className="lead">{c.about}</p>
        <div className="facts">
          <div><span className="eyebrow">Members</span><strong>{sel.memberCount(s, c).toLocaleString()}</strong></div>
          <div><span className="eyebrow">Projects</span><strong>{c.projects}</strong></div>
          <div><span className="eyebrow">People</span><strong>{c.people >= 1000 ? (c.people / 1000).toFixed(1) + 'K' : c.people}</strong></div>
          <div><span className="eyebrow">Events</span><strong>{c.events}</strong></div>
        </div>
        <div className="chips chips--tags">{c.tags.map((t) => <Tag key={t} tag={t} />)}</div>
      </GlassPanel>
      <section className="stack" aria-label="Post in this community">
        {joined ? (
          <form className="row" onSubmit={submit}><input className="input" aria-label={`Post in ${c.name}`} placeholder={`Share something with ${c.name}...`} value={text} onChange={(e) => setText(e.target.value)} /><button className="btn btn--primary" type="submit" disabled={!text.trim()}>Post</button></form>
        ) : <p className="tile tile--flat muted">Join this community to post, reply and share projects.</p>}
      </section>
      {challenge && (
        <CCard to={`/play/${challenge.id}`} className="stack stack--sm" label={`Play ${challenge.title}`}>
          <span className="eyebrow">{challenge.emoji} {challenge.title}</span>
          <h3 className="card-title">{challenge.question}</h3>
          <div><Link to={`/play/${challenge.id}`} className="btn btn--sm btn--primary">Play</Link></div>
        </CCard>
      )}
      <section className="stack" aria-label="Discussions"><h2>Discussions</h2><div className="stack stack--sm">{c.discussions.map((d) => <Discussion key={d.id} d={d} community={c} />)}{!c.discussions.length && <Empty title="No discussions yet">Post to start the first one.</Empty>}</div></section>
      {posts.length > 0 && <section className="stack" aria-label="Recent posts"><h2>Recent posts</h2><div className="stack">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div></section>}
      {projs.length > 0 && <section className="stack" aria-label="Projects"><h2>Projects to share and join</h2><div className="grid grid--2">{projs.map((p) => <ProjectCard key={p.id} project={p} compact />)}</div></section>}
    </article>
  );
}
