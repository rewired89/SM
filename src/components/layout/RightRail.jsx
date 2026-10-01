import { Link } from '../../lib/router.js';
import { GlassPanel, ProgressBar, Tag } from '../ui/index.jsx';
import { PersonChip, FollowBtn } from '../common/bits.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';
import { topTags } from '../../data/communities.js';
import { cents, pctLabel } from '../../lib/format.js';
import { ME } from '../../data/users.js';

export default function RightRail() {
  const { s } = useStore();
  const stats = sel.contributionStats(s);
  const momentum = sel.allProjects(s).filter((p) => p.ownerId !== ME).sort((a, b) => sel.projectPct(s, b) - sel.projectPct(s, a)).slice(0, 3);
  const people = sel.allUsers().filter((u) => u.id !== ME && !sel.has(s, 'following', sel.K('user', u.id))).slice(0, 3);
  const followed = s.following.filter((k) => k.startsWith('project:')).map((k) => sel.projectById(s, k.split(':')[1])).filter(Boolean);
  return (
    <aside className="rail" aria-label="Discover">
      <GlassPanel className="rail__card">
        <h2>Your impact</h2>
        <div className="impact-mini"><strong>{cents(stats.total)}</strong><span className="muted">across {stats.projects} projects and {stats.tools} tools</span></div>
        <Link to="/fund" className="btn btn--sm">Contribution history</Link>
      </GlassPanel>
      <GlassPanel className="rail__card">
        <h2>Trending</h2>
        <div className="chips chips--tags">{topTags.slice(0, 8).map((t) => <Tag key={t} tag={t} />)}</div>
      </GlassPanel>
      <GlassPanel className="rail__card">
        <h2>Gaining momentum</h2>
        <ul className="stack stack--sm">
          {momentum.map((p) => (
            <li key={p.id} className="stack stack--sm">
              <div className="row row--between"><Link to={`/project/${p.id}`}><strong>{p.title}</strong></Link><span className="muted">{pctLabel(sel.projectPct(s, p))}</span></div>
              <ProgressBar thin value={sel.projectPct(s, p)} label={`${p.title} funding`} />
            </li>
          ))}
        </ul>
      </GlassPanel>
      <GlassPanel className="rail__card">
        <h2>People to follow</h2>
        <ul className="stack stack--sm">
          {people.map((u) => <li key={u.id} className="row row--between"><PersonChip user={u} size={32} sub={u.headline[0]} /><FollowBtn type="user" id={u.id} name={u.name} /></li>)}
          {!people.length && <li className="muted">You follow everyone here. Nice.</li>}
        </ul>
      </GlassPanel>
      {followed.length > 0 && (
        <GlassPanel className="rail__card">
          <h2>Projects you follow</h2>
          <ul className="stack stack--sm">{followed.map((p) => <li key={p.id}><Link to={`/project/${p.id}`} className="refchip">{p.title}</Link></li>)}</ul>
        </GlassPanel>
      )}
    </aside>
  );
}
