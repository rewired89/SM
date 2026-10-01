import { GlassPanel, StoneCard, TactileButton, ProgressBar, Badge } from '../components/ui/index.jsx';
import ArcadeCard from '../components/games/ArcadeCard.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import * as sel from '../store/selectors.js';
import { SHOP, ACHIEVEMENTS, DAILY_CAP, WIN_SPARKS, FLAWLESS_BONUS, FIRST_WIN_BONUS, CHEER_COST } from '../lib/rewards.js';
import { ARCADE_LIST } from '../lib/arcade.js';
import { ME } from '../data/users.js';

export default function Rewards() {
  const { s, a } = useStore();
  const r = s.rewards;
  const today = new Date().toISOString().slice(0, 10);
  const earnedToday = r.earnedToday.day === today ? r.earnedToday.n : 0;
  const projects = sel.allProjects(s).filter((p) => p.ownerId !== ME).slice(0, 4);
  return (
    <div className="stack stack--lg">
      <GlassPanel className="hero hero--play">
        <span className="eyebrow">Rewards</span>
        <h1>✦ {r.sparks} sparks</h1>
        <p className="secondary">Win a quick game, earn sparks, spend them on looks or to cheer on projects you like. Nothing expires, nothing is lost, and sparks cannot be bought.</p>
      </GlassPanel>

      <section className="stack" aria-label="How sparks work">
        <h2>How you earn</h2>
        <div className="pricing">
          <div><Badge tone="success">Win +{WIN_SPARKS}</Badge><span>Finish any quick arcade game.</span></div>
          <div><Badge tone="accent">Flawless +{FLAWLESS_BONUS}</Badge><span>No mistakes, or a first-try win.</span></div>
          <div><Badge tone="warning">First win today +{FIRST_WIN_BONUS}</Badge><span>A small hello each day, never a penalty.</span></div>
        </div>
        <p className="muted">Healthy limit: up to {DAILY_CAP} sparks a day ({earnedToday} earned today). After that games are still fun, just not rewarding. Learning games never cost or pay out anything, they only grow your brain map.</p>
      </section>

      <section className="stack" aria-label="Arcade">
        <h2>Play</h2>
        <div className="grid grid--2">{ARCADE_LIST.map((g) => <StoneCard key={g.id} className="stack stack--sm"><strong>{g.emoji} {g.title}</strong><p className="secondary">{g.goal}</p><span className="muted">{r.wins[g.id] || 0} wins</span><div><TactileButton size="sm" variant="primary" to={`/arcade/${g.id}`}>Play</TactileButton></div></StoneCard>)}</div>
      </section>

      <section className="stack" aria-label="Shop">
        <h2>Spend sparks</h2>
        <div className="grid grid--2">
          {SHOP.map((it) => {
            const owned = r.unlocked.includes(it.id);
            const equipped = it.kind !== 'theme' && r.equipped[it.kind] === it.id;
            return (
              <StoneCard key={it.id} className="stack stack--sm">
                <div className="row row--between"><strong>{it.name}</strong><Badge>{it.kind}</Badge></div>
                <p className="secondary">{it.desc}</p>
                {it.kind === 'ring' && <div className="row"><span className={`avatar avatar--${it.id} demo-av`} style={{ width: 40, height: 40, background: 'linear-gradient(145deg, #9bb8ff, #ff9bc7)' }}>D</span></div>}
                {owned ? (it.kind === 'theme' ? <Badge tone="success">Unlocked, pick it in your colors</Badge> : <TactileButton size="sm" active={equipped} aria-pressed={equipped} onClick={() => a.equip(it.kind, equipped ? null : it.id)}>{equipped ? 'Equipped' : 'Equip'}</TactileButton>)
                  : <TactileButton size="sm" variant="primary" disabled={r.sparks < it.cost} onClick={() => a.buy(it.id)}>Unlock · {it.cost} ✦</TactileButton>}
              </StoneCard>
            );
          })}
        </div>
      </section>

      <section className="stack" aria-label="Cheer a project">
        <h2>Cheer a project</h2>
        <p className="secondary">Spend {CHEER_COST} sparks to cheer on a project. It is a free way to say "keep going" without spending money.</p>
        <div className="grid grid--2">{projects.map((p) => <StoneCard key={p.id} className="row row--between"><div><strong>{p.title}</strong><div className="muted">{r.cheers[p.id] || 0} cheers from you</div></div><TactileButton size="sm" onClick={() => a.cheer(p.id, p.title)}>👏 Cheer · {CHEER_COST} ✦</TactileButton></StoneCard>)}</div>
      </section>

      <section className="stack" aria-label="Achievements">
        <h2>Achievements</h2>
        <div className="grid grid--2">
          {ACHIEVEMENTS.map((x) => { const [n, t] = x.prog(r); const got = r.achievements.includes(x.id); return (
            <div key={x.id} className={`badge-card tile tile--flat ${got ? 'is-got' : ''}`}><span className="badge-card__emoji" aria-hidden="true">{x.emoji}</span><div className="grow"><strong>{x.name}</strong><p className="muted">{x.desc}</p>{!got && <ProgressBar thin value={(n / t) * 100} label={`${x.name} progress`} />}</div>{got && <Badge tone="success">Earned</Badge>}</div>
          ); })}
        </div>
      </section>
    </div>
  );
}
