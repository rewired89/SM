import { THEMES } from '../../lib/themes.js';
import { useStore } from '../../store/StoreProvider.jsx';

export default function ThemePicker() {
  const { s, a } = useStore();
  return (
    <div className="themes" role="radiogroup" aria-label="Color theme">
      {THEMES.map((t) => (
        <button key={t.id} type="button" role="radio" aria-checked={s.theme === t.id} className="theme-opt" onClick={() => a.setTheme(t.id, t.name)}>
          <span className="theme-opt__sw" style={{ background: `linear-gradient(135deg, ${t.colors[0]} 50%, ${t.colors[1]} 50%)` }} aria-hidden="true" />
          <span className="theme-opt__dots" aria-hidden="true"><i style={{ background: t.colors[0] }} /><i style={{ background: t.colors[1] }} /></span>
          <strong>{t.name}</strong>
        </button>
      ))}
    </div>
  );
}
