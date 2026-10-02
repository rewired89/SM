import { nomiAnswer } from '../lib/assistant.js';
import { ME } from '../data/users.js';
import { useCallback, useState } from 'react';
import { GlassPanel, TactileButton, Badge, Empty } from '../components/ui/index.jsx';
import CommunityGame from '../components/games/CommunityGame.jsx';
import { ReputationBadge } from '../components/common/ReputationBadge.jsx';
import { gameById, bumpGame } from '../lib/gamestore.js';
import { Link } from '../lib/router.js';
import { userById } from '../store/selectors.js';
import { useStore } from '../store/StoreProvider.jsx';

export default function CommunityGamePage({ id }) {
  const { a } = useStore();
  const game = gameById(id);
  const [round, setRound] = useState(0);
  const [res, setRes] = useState(null);
  const onEvent = useCallback((e) => {
    if (e.type === 'win') { bumpGame(id, true); setRes(a.communityWin(id, e.score)); }
    else if (e.type === 'lose') { bumpGame(id, false); setRes({ lost: true }); }
    else if (e.type === 'instant') setRes({ lost: true, note: 'That win came too fast to count.' });
  }, [id, a]);
  if (!game || (game.status !== 'approved' && game.creatorId !== ME)) return <Empty title="Game not found"><Link to="/play" className="btn">Back to Play & Learn</Link></Empty>;
  const maker = userById(game.creatorId);
  return (
    <div className="stack">
      <div className="row row--between"><Link to={game.kind === 'tool' ? '/ai' : '/play'} className="btn btn--ghost btn--sm">Back</Link>{game.status !== 'approved' && <Badge>{game.status === 'human_review' ? 'Waiting for review' : game.status}</Badge>}</div>
      <GlassPanel className="stack">
        <span className="eyebrow">{game.kind === 'tool' ? 'Sandboxed AI demo' : 'Community game'} · reviewer score {game.score}/100</span>
        <h1>{game.title}</h1>
        <p className="secondary">{game.description}</p>
        <p className="row row--wrap">By <Link to={`/u/${game.creatorId}`}><strong>{maker?.name}</strong></Link> <ReputationBadge userId={game.creatorId} compact /></p>
        <CommunityGame key={round} game={game} onEvent={onEvent} onAsk={nomiAnswer} height={game.kind === 'tool' ? 440 : 420} />
        {game.kind === 'tool' && <p className="muted">🛡️ Runs in a locked sandbox: no network, no storage, no access to your device or to Nomi. The creator never sees what you type. Answers here come from a simple prototype assistant.</p>}
        <small className="muted"><strong>{game.kind === 'tool' ? 'How to use it' : 'How to play'}:</strong> {game.how}</small>
        {res && (
          <div className="row row--wrap"><strong>{res.lost ? (res.note || 'So close! No penalty.') : res.gained > 0 ? `You won! +${res.gained} ✦ sparks` : res.limited ? 'You won! Sparks for this game are capped for today, play for fun.' : 'You won!'}</strong>
            <TactileButton variant="primary" size="sm" onClick={() => { setRes(null); setRound((r) => r + 1); }}>Play again</TactileButton></div>
        )}
        <small className="muted">{game.plays} {game.kind === 'tool' ? 'uses' : `plays · ${game.wins} wins`} · {game.purpose}</small>
      </GlassPanel>
    </div>
  );
}
