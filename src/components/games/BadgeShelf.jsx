import { ProgressBar } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { BADGES } from '../../lib/learn.js';

export default function BadgeShelf() {
  const { s } = useStore();
  const l = s.learn;
  return (
    <section className="stack" aria-label="Badges">
      <div className="row row--between"><span className="eyebrow">Badges</span><span className="muted">{l.xp} XP</span></div>
      <div className="grid grid--2">
        {BADGES.map((b) => {
          const [n, t] = b.prog(l);
          const got = l.badges.includes(b.id);
          return (
            <div key={b.id} className={`badge-card tile tile--flat ${got ? 'is-got' : ''}`}>
              <span className="badge-card__emoji" aria-hidden="true">{b.emoji}</span>
              <div className="grow"><strong>{b.name}</strong><p className="muted">{b.desc}</p>{!got && <ProgressBar thin value={(n / t) * 100} label={`${b.name} progress`} />}</div>
              {got && <span className="badge badge--success">Earned</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
