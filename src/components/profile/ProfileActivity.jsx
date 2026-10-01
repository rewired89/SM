import PostCard from '../feed/PostCard.jsx';
import { Empty } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';

export default function ProfileActivity({ userId }) {
  const { s } = useStore();
  const list = sel.allPosts(s).filter((p) => p.authorId === userId).sort((a, b) => b.ts - a.ts);
  return list.length ? <div className="stack">{list.map((p) => <PostCard key={p.id} post={p} />)}</div> : <Empty title="No activity yet" />;
}
