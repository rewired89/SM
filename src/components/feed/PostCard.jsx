import { useState } from 'react';
import { StoneCard, Badge, TactileButton } from '../ui/index.jsx';
import { PersonChip, SupportBtn } from '../common/bits.jsx';
import { Tag } from '../ui/index.jsx';
import PostActions from './PostActions.jsx';
import CommentThread from './CommentThread.jsx';
import ProjectUpdate from '../projects/ProjectUpdate.jsx';
import FundingMilestone from '../projects/FundingMilestone.jsx';
import IdeaCard from '../ideas/IdeaCard.jsx';
import AIToolCard from '../ai/AIToolCard.jsx';
import MediaGrid from '../media/MediaGrid.jsx';
import LinkChips from '../media/LinkChips.jsx';
import GameResultCard from '../games/GameResultCard.jsx';
import { JoinBtn } from '../communities/CommunityCard.jsx';
import { Link } from '../../lib/router.js';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';
import * as sel from '../../store/selectors.js';
import { ago } from '../../lib/format.js';

const LABEL = { post: 'Post', update: 'Project update', idea: 'New idea', tool: 'AI tool', research: 'Research', question: 'Question', milestone: 'Funding milestone', community: 'Community discussion', collab: 'Collaboration request', game: 'Challenge result' };

function RefChip({ r, entity }) {
  if (!entity || r.type === 'community') return null;
  return <Link to={`/${r.type === 'tool' ? 'ai' : r.type}/${r.id}`} className="refchip">↳ {sel.nameOf(entity)}</Link>;
}

function Body({ post }) {
  const { s } = useStore();
  const { openModal } = useUI();
  const entity = sel.entityOf(s, post.ref);
  const x = post.extra || {};
  switch (post.type) {
    case 'game': return <GameResultCard post={post} />;
    case 'update': return <ProjectUpdate post={post} project={entity} />;
    case 'idea': return (<><p className="post__text">{post.text}</p>{entity && <IdeaCard idea={entity} embedded />}</>);
    case 'tool': return (<><p className="post__text">{post.text}</p>{entity && <AIToolCard tool={entity} />}</>);
    case 'milestone': {
      const m = sel.milestonesOf(s, post.ref.id).find((mm) => mm.id === x.milestoneId) || sel.activeMilestone(s, post.ref.id);
      return (<><p className="post__text">{post.text}</p>{m && <FundingMilestone milestone={m} projectId={post.ref.id} />}</>);
    }
    case 'research': return (
      <div className="research">
        <div className="row"><Badge tone="accent">{x.kind || 'Research'}</Badge></div>
        <h3 className="card-title">{x.title}</h3>
        <p className="secondary">{post.text}</p>
        {entity && <RefChip r={post.ref} entity={entity} />}
      </div>
    );
    case 'question': return (<div className="question"><span className="eyebrow">❓ Question</span><p className="post__text post__text--lg">{post.text}</p></div>);
    case 'community': {
      const d = entity?.discussions?.find((dd) => dd.id === x.discussionId);
      return entity ? (
        <>
          <p className="post__text">{post.text}</p>
          <div className="discussion">
            <div className="row row--between"><Link to={`/community/${entity.id}`} className="eyebrow">{entity.name}</Link><JoinBtn community={entity} /></div>
            {d && <Link to={`/community/${entity.id}`}><h3 className="card-title">“{d.title}”</h3></Link>}
            <span className="muted">{(d?.replies || 0).toLocaleString()} replies · {sel.memberCount(s, entity).toLocaleString()} members</span>
          </div>
        </>
      ) : <p className="post__text">{post.text}</p>;
    }
    case 'collab': return (
      <>
        <p className="post__text">{post.text}</p>
        <div className="looking">
          <span className="eyebrow">Looking for</span>
          <ul>{(x.needs || []).map((n) => <li key={n}>☑ {n}</li>)}</ul>
          {entity && <div className="row row--wrap"><TactileButton size="sm" variant="primary" onClick={() => openModal('collab', { targetType: post.ref.type, targetId: post.ref.id })}>I'm interested</TactileButton><TactileButton size="sm" to={sel.collabPath(entity)}>See collaborators</TactileButton></div>}
        </div>
      </>
    );
    default: return (<><p className="post__text">{post.text}</p>{entity && <RefChip r={post.ref} entity={entity} />}</>);
  }
}

export default function PostCard({ post, reason }) {
  const { s } = useStore();
  const [open, setOpen] = useState(false);
  const author = sel.userById(post.authorId);
  return (
    <StoneCard as="article" className={`post post--${post.type}`} aria-label={`${LABEL[post.type]} by ${author.name}`}>
      <header className="post__head">
        <PersonChip user={author} sub={`@${author.handle} · ${ago(post.ts)}`} />
        <Badge tone={post.type === 'post' ? undefined : 'accent'}>{LABEL[post.type]}</Badge>
      </header>
      {reason && <div className="why" title="Why you are seeing this (simulated recommendation)">✦ {reason}</div>}
      <Body post={post} />
      <MediaGrid media={post.media} />
      <LinkChips links={post.links} />
      {post.tags?.length > 0 && <div className="chips chips--tags">{post.tags.map((t) => <Tag key={t} tag={t} />)}</div>}
      <PostActions post={post} open={open} onToggleComments={() => setOpen((o) => !o)} />
      {open && <CommentThread cKey={sel.K('post', post.id)} />}
    </StoneCard>
  );
}
