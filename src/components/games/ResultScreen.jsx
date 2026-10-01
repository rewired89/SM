import { useState } from 'react';
import { TactileButton } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { navigate } from '../../lib/router.js';
import { dailyGameId } from '../../lib/learn.js';

export default function ResultScreen({ game, score, total, lessons, extra, onAgain, daily }) {
  const { a } = useStore();
  const [shared, setShared] = useState(false);
  const share = () => {
    if (shared) return;
    a.shareGame({ gameId: daily ? 'daily' : game.id, title: game.title, emoji: game.emoji, label: game.learn, score, total });
    setShared(true);
  };
  const another = () => navigate(`/play/${dailyGameId()}?daily=1`);
  return (
    <div className="result-screen stack">
      <span className="eyebrow">I just completed</span>
      <h2>{game.emoji} {game.title}</h2>
      <div className="score"><strong>{score}</strong><span>/ {total}</span></div>
      {extra}
      {lessons.length > 0 && (
        <div className="stack stack--sm">
          <span className="eyebrow">You learned</span>
          <ul className="lessons">{lessons.map((l, i) => <li key={i}>+ {l}</li>)}</ul>
        </div>
      )}
      <div className="row row--wrap">
        <TactileButton variant="primary" icon="share" onClick={share} disabled={shared}>{shared ? 'Shared to your feed' : 'Share'}</TactileButton>
        <TactileButton onClick={onAgain} icon="refresh">Play again</TactileButton>
        <TactileButton variant="ghost" onClick={() => navigate('/play')}>Done</TactileButton>
      </div>
      <p className="muted">Want another one? <button type="button" className="linkbtn" onClick={another}>30-second challenge</button></p>
    </div>
  );
}
