import { Link } from '../../lib/router.js';
import { dailyGameId } from '../../lib/learn.js';

export default function GameResultCard({ post }) {
  const x = post.extra || {};
  const to = x.gameId === 'daily' ? `/play/${dailyGameId()}?daily=1` : `/play/${x.gameId}`;
  return (
    <div className="gameres">
      <span className="gameres__emoji" aria-hidden="true">{x.emoji}</span>
      <div className="grow">
        <p className="post__text">{post.text}</p>
        <div className="row"><strong className="gameres__score">{x.score}/{x.total}</strong><span className="muted">{x.label}</span></div>
      </div>
      <Link to={to} className="btn btn--sm btn--primary">Play the challenge</Link>
    </div>
  );
}
