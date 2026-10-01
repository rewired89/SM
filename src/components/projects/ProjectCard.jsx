import { StoneCard, ProgressBar, Badge } from '../ui/index.jsx';
import { SupportBtn, FollowBtn, PersonChip } from '../common/bits.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';
import { money, pctLabel } from '../../lib/format.js';

export default function ProjectCard({ project, compact }) {
  const { s } = useStore();
  const ms = sel.activeMilestone(s, project.id);
  const owner = sel.userById(project.ownerId);
  return (
    <StoneCard to={`/project/${project.id}`} className="project-card" label={`Open project ${project.title}`}>
      <div className="row row--between row--wrap">
        <span className="eyebrow">⚙ {project.kind}</span>
        <Badge tone="accent">{project.status}</Badge>
      </div>
      <h3 className="card-title">{project.title}</h3>
      <p className="secondary">{project.tagline}</p>
      {!compact && <PersonChip user={owner} size={28} />}
      {ms && (
        <div className="stack stack--sm">
          <div className="row row--between"><span className="muted">Next: {ms.title}</span><span className="muted">{pctLabel(sel.projectPct(s, project))} of {money(sel.projectGoal(s, project))}</span></div>
          <ProgressBar thin value={ms.funded / ms.needed * 100} done={ms.done} label={`${ms.title} funding`} />
        </div>
      )}
      {!compact && <div className="chips">{project.needs.slice(0, 3).map((n) => <span key={n} className="badge badge--plain">Needs: {n}</span>)}</div>}
      <div className="row row--between">
        <span className="muted">{sel.followerCount(s, 'project', project).toLocaleString()} following</span>
        <div className="row"><FollowBtn type="project" id={project.id} name={project.title} /><SupportBtn type="project" id={project.id} label={project.title} /></div>
      </div>
    </StoneCard>
  );
}
