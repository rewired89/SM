import { useState } from 'react';
import { Link, navigate } from '../lib/router.js';
import { GlassPanel, TactileButton, StoneCard, Badge } from '../components/ui/index.jsx';
import ArcadeCard from '../components/games/ArcadeCard.jsx';
import GameCard from '../components/games/GameCard.jsx';
import BrainMap from '../components/games/BrainMap.jsx';
import BadgeShelf from '../components/games/BadgeShelf.jsx';
import LearningToday from '../components/games/LearningToday.jsx';
import { games, gameById, HUB_CHIPS, MOODS } from '../data/games.js';
import { dailyGameId } from '../lib/learn.js';
import { approvedGames } from '../lib/gamestore.js';
import { userById } from '../store/selectors.js';
import { useStore } from '../store/StoreProvider.jsx';
import { useUI } from '../store/UIProvider.jsx';
import * as sel from '../store/selectors.js';

export default function Play() {
  const { s } = useStore();
  const { openModal, setSimOffline } = useUI();
  const [cat, setCat] = useState('all');
  const [mood, setMood] = useState(null);
  const daily = gameById(dailyGameId());
  const doneToday = s.learn.daily?.done && s.learn.daily.date === new Date().toISOString().slice(0, 10);
  let list = games.filter((g) => cat === 'all' || g.topics.includes(cat));
  if (mood) list = list.filter((g) => g.moods.includes(mood));
  const random = () => navigate(`/play/${games[Math.floor(Math.random() * games.length)].id}`);
  const challenges = sel.allChallenges(s);
  return (
    <div className="stack stack--lg">
      <GlassPanel className="hero hero--play">
        <span className="eyebrow">Play & learn</span>
        <h1>Tiny games. Tiny lessons.</h1>
        <p className="secondary">One more thing you did not know. Every game takes 20 to 90 seconds, with no timers to beat and nothing to lose.</p>
        <div className="row row--wrap"><TactileButton variant="primary" size="lg" onClick={random}>Play random</TactileButton><TactileButton onClick={() => setSimOffline(true)}>Preview offline mode</TactileButton></div>
      </GlassPanel>

      <div className="grid grid--2">
        <StoneCard className="stack stack--sm daily">
          <div className="row row--between"><span className="eyebrow">🔥 Daily challenge</span>{doneToday && <Badge tone="success">Done today</Badge>}</div>
          <h3 className="card-title">{daily.emoji} {daily.title}</h3>
          <p className="secondary">Five quick rounds. Learn: {daily.learn}.</p>
          <div><TactileButton variant="primary" to={`/play/${daily.id}?daily=1`}>{doneToday ? 'Play again' : 'Play today\'s challenge'}</TactileButton></div>
        </StoneCard>
        <StoneCard><LearningToday /></StoneCard>
      </div>

      <section className="stack" aria-label="Quick arcade">
        <div className="row row--between row--wrap"><h2>Quick arcade</h2><Link to="/rewards" className="btn btn--sm">✦ {s.rewards.sparks} sparks · Rewards</Link></div>
        <div className="grid grid--2">{['cloudhop', 'orbpop', 'stopper'].map((id) => <ArcadeCard key={id} id={id} />)}</div>
      </section>

      <section className="stack" aria-label="Games">
        <div className="chips" role="group" aria-label="Topics">{HUB_CHIPS.map((c) => <button key={c.id} type="button" className="chip" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c.icon} {c.label}</button>)}</div>
        <div className="chips" role="group" aria-label="Play for">{MOODS.map((m) => <button key={m} type="button" className="chip" aria-pressed={mood === m} onClick={() => setMood(mood === m ? null : m)}>{m}</button>)}</div>
        <div className="grid grid--2">{list.map((g) => <GameCard key={g.id} game={g} />)}</div>
        {!list.length && <p className="empty">No games match. Try clearing a filter.</p>}
      </section>

      <section className="stack" aria-label="Community games">
        <div className="row row--between row--wrap"><h2>Community games</h2><Link to="/games/submit" className="btn btn--sm">Submit your game</Link></div>
        <div className="grid grid--2">{approvedGames().map((g) => (
          <StoneCard key={g.id} to={`/cgame/${g.id}`} className="stack stack--sm" label={`Play ${g.title}`}>
            <span className="eyebrow">By {userById(g.creatorId)?.name} · {g.duration}s · {g.score}/100 reviewed</span>
            <h3 className="card-title">{g.title}</h3><p className="secondary">{g.description}</p>
          </StoneCard>))}</div>
      </section>

      <section className="stack" aria-label="Community challenges">
        <div className="row row--between row--wrap"><h2>Community challenges</h2><TactileButton size="sm" icon="plus" onClick={() => openModal('create', { start: 'challenge' })}>Create a challenge</TactileButton></div>
        <div className="grid grid--2">
          {challenges.map((c) => {
            const com = sel.communityById(s, c.communityId);
            return (
              <StoneCard key={c.id} to={`/play/${c.id}`} className="stack stack--sm" label={`Play ${c.title}`}>
                <span className="eyebrow">{c.emoji} {com ? com.name : 'Community'}</span>
                <h3 className="card-title">{c.title}</h3>
                <p className="secondary">{c.question}</p>
                <div><Link to={`/play/${c.id}`} className="btn btn--sm btn--primary">Play</Link></div>
              </StoneCard>
            );
          })}
        </div>
      </section>

      <div className="grid grid--2"><StoneCard><BrainMap /></StoneCard><StoneCard><BadgeShelf /></StoneCard></div>
    </div>
  );
}
