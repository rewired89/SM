import { ProgressBar } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { BRAIN_CATS, masteryOf } from '../../lib/learn.js';

export default function BrainMap() {
  const { s } = useStore();
  const l = s.learn;
  return (
    <section className="stack" aria-label="Your brain map">
      <div><span className="eyebrow">Your brain map</span><p className="muted">Topics you have practiced on Nomi. This is not an IQ score and does not measure intelligence.</p></div>
      <div className="stack stack--sm brainmap">
        {BRAIN_CATS.filter((c) => l.stats[c.id]?.answered || ['cybersecurity', 'critical', 'science', 'ai', 'communication'].includes(c.id)).map((c) => {
          const m = masteryOf(l, c.id);
          return (
            <div key={c.id} className="where">
              <span>{c.label}</span>
              <ProgressBar thin value={m ?? 0} label={`${c.label} practice`} />
              <strong>{m === null ? 'Not started' : `${m}%`}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
