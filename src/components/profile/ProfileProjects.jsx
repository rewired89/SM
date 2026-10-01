import ProjectCard from '../projects/ProjectCard.jsx';
import { Empty } from '../ui/index.jsx';

export default function ProfileProjects({ projects }) {
  if (!projects.length) return <Empty title="No projects yet" />;
  return <div className="grid grid--2">{projects.map((p) => <ProjectCard key={p.id} project={p} compact />)}</div>;
}
