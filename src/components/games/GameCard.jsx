import { StoneCard, Badge } from '../ui/index.jsx';
import { Link } from '../../lib/router.js';
import { useStore } from '../../store/StoreProvider.jsx';

export default function GameCard({ game }) {
  const { s } = useStore();
  const plays = s.learn.plays[game.id];
  return (
    <StoneCard to={`/play/${game.id}`} className="game-card" label={`Play ${game.title}`}>
      <div className="row row--between"><span className="game-card__emoji" aria-hidden="true">{game.emoji}</span><Badge>{game.time}</Badge></div>
      <h3 className="card-title">{game.title}</h3>
      <span className="eyebrow">{game.moods.slice(0, 2).join(' · ')}</span>
      <p className="secondary"><strong>Learn:</strong> {game.learn}</p>
      <div className="row row--between">
        <span className="muted">{plays ? `Played ${plays.count}×` : 'New'}</span>
        <Link to={`/play/${game.id}`} className="btn btn--sm btn--primary">Play</Link>
      </div>
    </StoneCard>
  );
}
