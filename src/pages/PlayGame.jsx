import { useState } from 'react';
import { useRoute, back } from '../lib/router.js';
import { GlassPanel, TactileButton, Empty } from '../components/ui/index.jsx';
import QuizGame from '../components/games/QuizGame.jsx';
import DodgeGame from '../components/games/DodgeGame.jsx';
import RunnerGame from '../components/games/RunnerGame.jsx';
import { gameById, BANKS } from '../data/games.js';
import { useStore } from '../store/StoreProvider.jsx';
import * as sel from '../store/selectors.js';
import { Link } from '../lib/router.js';

export default function PlayGame({ id }) {
  const { s } = useStore();
  const { query } = useRoute();
  const [attempt, setAttempt] = useState(0);
  const again = () => setAttempt((n) => n + 1);
  const ch = id.startsWith('ch_') ? sel.challengeById(s, id) : null;
  const game = ch ? { id: ch.id, title: ch.title, emoji: ch.emoji, learn: ch.skill, how: ch.question, time: '~20 seconds', kind: 'quiz' } : gameById(id);
  if (!game) return <Empty title="Game not found"><Link to="/play" className="btn">Back to Play & Learn</Link></Empty>;
  const daily = query.daily === '1';
  let body;
  if (ch) body = <QuizGame key={attempt} game={game} bank={[{ ...ch, game: 'challenge', difficulty: ch.difficulty || 2, topic: ch.topic || ch.category }]} rounds={1} single onAgain={again} />;
  else if (game.kind === 'dodge') body = <DodgeGame key={attempt} game={game} onAgain={again} />;
  else if (game.kind === 'runner') body = <RunnerGame key={attempt} game={game} onAgain={again} offline={query.offline === '1'} />;
  else body = <QuizGame key={attempt} game={game} bank={BANKS[game.id]} rounds={daily ? 5 : game.rounds} daily={daily} onAgain={again} />;
  return (
    <div className="stack">
      <div className="row row--between"><TactileButton variant="ghost" size="sm" icon="back" onClick={back}>Back</TactileButton><span className="eyebrow">{daily ? '🔥 Daily challenge' : 'Play & learn'}</span></div>
      <GlassPanel className="play-stage">{body}</GlassPanel>
      {game.skill && <p className="muted purpose">Purpose: {game.skill} · {game.mechanic} · {game.feedback}. Takeaway: {game.takeaway}</p>}
    </div>
  );
}
