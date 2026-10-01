import { TactileButton } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { dailyGameId, today } from '../../lib/learn.js';

export default function LearningToday({ compact }) {
  const { s } = useStore();
  const items = s.learn.lessons.filter((x) => x.day === today()).slice(-5).reverse();
  return (
    <div className="stack stack--sm today">
      <span className="eyebrow">Today</span>
      {items.length ? (
        <>
          <strong>You learned:</strong>
          <ul className="lessons">{items.slice(0, compact ? 3 : 5).map((x) => <li key={x.id + x.text}>+ {x.text}</li>)}</ul>
          <p className="muted">{items.length} tiny lesson{items.length === 1 ? '' : 's'}.</p>
        </>
      ) : <p className="muted">Nothing yet today. One tiny game is enough.</p>}
      <div><TactileButton size="sm" variant="primary" to={`/play/${dailyGameId()}?daily=1`}>Want another one? 30-second challenge</TactileButton></div>
    </div>
  );
}
