import { useRoute, back, Link } from '../lib/router.js';
import { TactileButton, Empty } from '../components/ui/index.jsx';
import ArcadeCard from '../components/games/ArcadeCard.jsx';
import { ARCADE } from '../lib/arcade.js';

export default function ArcadePage({ id }) {
  const { query } = useRoute();
  if (!ARCADE[id]) return <Empty title="Game not found"><Link to="/play" className="btn">Back to Play & Learn</Link></Empty>;
  return (
    <div className="stack">
      <div className="row row--between"><TactileButton variant="ghost" size="sm" icon="back" onClick={back}>Back</TactileButton><Link to="/rewards" className="btn btn--sm">Rewards</Link></div>
      <ArcadeCard key={id} id={id} large offline={query.offline === '1'} />
    </div>
  );
}
