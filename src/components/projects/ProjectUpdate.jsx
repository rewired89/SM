import { Link } from '../../lib/router.js';

export default function ProjectUpdate({ post, project }) {
  const x = post.extra || {};
  return (
    <div className="update">
      <div className="row row--between">
        <span className="eyebrow">Project update</span>
        <span className="eyebrow">Day {x.day}</span>
      </div>
      <p>{post.text}</p>
      <div className="update__delta">
        <div><span className="eyebrow">Previous</span><strong>{x.prev}</strong></div>
        <span aria-hidden="true" className="update__arrow">→</span>
        <div><span className="eyebrow">Current</span><strong className="accent">{x.curr}</strong></div>
      </div>
      <div className="secondary"><span className="eyebrow">What changed </span>{x.changed}</div>
      {project && <Link to={`/project/${project.id}`} className="btn btn--sm">View {project.title}</Link>}
    </div>
  );
}
