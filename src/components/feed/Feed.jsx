import { useMemo } from 'react';
import PostCard from './PostCard.jsx';
import { Empty } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';

export default function Feed({ tab = 'foryou', filter, limit }) {
  const { s } = useStore();
  const items = useMemo(() => {
    let l = sel.rankFeed(s, tab);
    if (filter) l = l.filter((x) => filter(x.post));
    return limit ? l.slice(0, limit) : l;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.following, s.liked, s.joined, s.interested, s.viewed, s.createdPosts, s.created, tab, filter, limit, s.deltas]);
  if (!items.length) return <Empty title="Nothing here yet">Follow a few people or projects and this fills up.</Empty>;
  return <div className="stack feed" role="feed" aria-label="Feed">{items.map((x) => <PostCard key={x.post.id} post={x.post} reason={tab === 'foryou' ? x.reason : undefined} />)}</div>;
}
