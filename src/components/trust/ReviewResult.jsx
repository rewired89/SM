import { ProgressBar, Badge } from '../ui/index.jsx';
import { THRESHOLD } from '../../data/trust.js';

export default function ReviewResult({ review }) {
  const pass = review.score >= THRESHOLD;
  return (
    <div className="stack">
      <div className="row row--between row--wrap"><div className="score"><strong>{review.score}</strong><span>/ 100</span></div><Badge tone={pass ? 'success' : 'warning'}>{pass ? 'Approved for funding' : `Needs ${THRESHOLD}+ to receive funds`}</Badge></div>
      <div className="scorebar"><ProgressBar value={review.score} done={pass} label="Review score" /><span className="scorebar__tick" style={{ left: `${THRESHOLD}%` }} aria-hidden="true"><i>{THRESHOLD}</i></span></div>
      {!pass && <p className="secondary">Your project is still public and visible, just without a Fund button. Improve the items below and submit again.</p>}
      {review.breakdown ? (
        <ul className="stack stack--sm">{review.breakdown.map((b) => (
          <li key={b.id} className="tile tile--flat stack stack--sm">
            <div className="row row--between"><strong>{b.label}</strong><span className={b.pts >= b.max ? 'ok' : 'muted'}>{b.pts} / {b.max}</span></div>
            <ProgressBar thin value={(b.pts / b.max) * 100} done={b.pts >= b.max} label={`${b.label} score`} />
            <ul className="muted">{b.notes.map((n) => <li key={n}>• {n}</li>)}</ul>
            {b.pts < b.max && <p className="secondary">💡 {b.tip}</p>}
          </li>
        ))}</ul>
      ) : <p className="muted">Reviewed earlier. Details are kept by the review team.</p>}
    </div>
  );
}
