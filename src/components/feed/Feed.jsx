import { useMemo } from 'react';
import PostCard from './PostCard.jsx';
import GameBreak from '../games/GameBreak.jsx';
import ArcadeCard from '../games/ArcadeCard.jsx';
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
  if (!items.length) return <Empty title={tab === 'watch' ? 'No videos yet' : 'Nothing here yet'}>{tab === 'watch' ? 'Post a short video from the composer and it shows up here.' : 'Follow a few people or projects and this fills up.'}</Empty>;
  const breaks = tab === 'foryou' && !filter && !limit;
  return (
    <div className="stack feed" role="feed" aria-label="Feed">
      {items.map((x, i) => (
        <div key={x.post.id} className="stack">
          <PostCard post={x.post} reason={tab === 'foryou' ? x.reason : undefined} />
          {breaks && [2, 6, 10, 14].includes(i) && <GameBreak index={[2, 6, 10, 14].indexOf(i)} />}
          {breaks && [4, 9, 13].includes(i) && <ArcadeCard id={['cloudhop', 'orbpop', 'stopper'][[4, 9, 13].indexOf(i)]} />}
        </div>
      ))}
    </div>
  );
}
