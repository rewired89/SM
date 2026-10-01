import { StoneCard } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';

export function JoinBtn({ community, size = 'sm' }) {
  const { s, a } = useStore();
  const on = sel.has(s, 'joined', community.id);
  return (
    <button type="button" className={`btn btn--${size} ${on ? 'btn--active' : 'btn--primary'}`} aria-pressed={on} onClick={() => a.join(community.id, community.name)}>
      {on ? '✓ Member' : 'Join'}
    </button>
  );
}

export default function CommunityCard({ community }) {
  const { s } = useStore();
  return (
    <StoneCard to={`/community/${community.id}`} className="community-card" label={`Open community ${community.name}`}>
      <div className="row">
        <span className="community-mark" style={{ background: `linear-gradient(145deg, hsl(${community.hue} 55% 65%), hsl(${(community.hue + 40) % 360} 40% 38%))` }} aria-hidden="true">{community.name[0]}</span>
        <div className="grow"><h3>{community.name}</h3><span className="muted">{sel.memberCount(s, community).toLocaleString()} members</span></div>
        <JoinBtn community={community} />
      </div>
      <p className="secondary">{community.about}</p>
    </StoneCard>
  );
}
