import { THEMES } from '../../lib/themes.js';
import { useStore } from '../../store/StoreProvider.jsx';
import { Link } from '../../lib/router.js';

export default function ThemePicker() {
  const { s, a } = useStore();
  return (
    <div className="stack">
      <div className="themes" role="radiogroup" aria-label="Color theme">
        {THEMES.map((t) => {
          const locked = t.lock && !s.rewards.unlocked.includes(t.lock);
          return (
            <button key={t.id} type="button" role="radio" aria-checked={s.theme === t.id} aria-disabled={locked} className={`theme-opt ${locked ? 'is-locked' : ''}`} onClick={() => !locked && a.setTheme(t.id, t.name)} title={locked ? 'Unlock with sparks in Rewards' : undefined}>
              <span className="theme-opt__sw" style={{ background: `linear-gradient(135deg, ${t.colors[0]} 50%, ${t.colors[1]} 50%)` }} aria-hidden="true" />
              <strong>{t.name}</strong>
              {locked && <span className="muted">🔒 Unlock in Rewards</span>}
            </button>
          );
        })}
      </div>
      <label className="row"><input type="checkbox" checked={s.ambient} onChange={(e) => a.setAmbient(e.target.checked)} /> <span>Animated clouds and waves in the background</span></label>
      <Link to="/rewards" className="muted">Win quick games to earn sparks and unlock more palettes.</Link>
    </div>
  );
}
