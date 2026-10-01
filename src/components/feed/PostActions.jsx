import { IconButton } from '../ui/index.jsx';
import { SupportBtn } from '../common/bits.jsx';
import { navigate } from '../../lib/router.js';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';
import * as sel from '../../store/selectors.js';

export const supportTargetFor = (s, post) => {
  if (post.type === 'game') return null;
  if (post.ref && ['project', 'idea', 'tool'].includes(post.ref.type)) return post.ref;
  const p = sel.allProjects(s).find((x) => x.ownerId === post.authorId);
  return p ? { type: 'project', id: p.id } : null;
};

export default function PostActions({ post, onToggleComments, open }) {
  const { s, a } = useStore();
  const { toast } = useUI();
  const liked = sel.has(s, 'liked', post.id);
  const saved = sel.has(s, 'saved', post.id);
  const target = supportTargetFor(s, post);
  const share = () => {
    const url = `${location.origin}${location.pathname}#/`;
    try { navigator.clipboard?.writeText(url); } catch { /* clipboard blocked */ }
    toast('Link copied. Shared to your circle.');
  };
  return (
    <div className="actions">
      <IconButton icon="heart" variant="like" pressed={liked} label={liked ? 'Unlike' : 'Like'} count={sel.likeCount(s, post)} onClick={() => a.like(post.id)} />
      <IconButton icon="comment" pressed={open} label="Comments" count={sel.commentCount(s, sel.K('post', post.id), post.comments)} onClick={onToggleComments} aria-expanded={open} />
      <IconButton icon="share" label="Share" onClick={share}>Share</IconButton>
      <IconButton icon="bookmark" variant="save" pressed={saved} label={saved ? 'Remove bookmark' : 'Save'} onClick={() => a.save(post.id)} />
      {post.ref && ['project', 'idea'].includes(post.ref.type) && sel.entityOf(s, post.ref) && <IconButton icon="users" label="Collaborators" onClick={() => navigate(`/collab/${sel.collabSlug(sel.entityOf(s, post.ref))}`)}>Collaborators</IconButton>}
      <span className="grow" />
      {target && <SupportBtn type={target.type} id={target.id} label="this" />}
    </div>
  );
}
