import { Link } from '../../lib/router.js';
import { GlassPanel, Badge, Empty, Icon, StoneCard } from '../ui/index.jsx';
import { PersonChip, SupportBtn } from '../common/bits.jsx';
import AIToolDemo from './AIToolDemo.jsx';
import MicroContribution from './MicroContribution.jsx';
import GameBreak from '../games/GameBreak.jsx';
import ProjectCard from '../projects/ProjectCard.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';
import { compact } from '../../lib/format.js';

export default function AIToolPage({ id }) {
  const { s } = useStore();
  const tool = sel.toolById(s, id);
  if (!tool) return <Empty title="Tool not found"><Link to="/ai" className="btn">Browse AI</Link></Empty>;
  const creator = sel.userById(tool.creatorId);
  const community = sel.communityById(s, tool.communityId);
  const project = tool.projectId && sel.projectById(s, tool.projectId);
  const uses = tool.uses + (s.toolUses[tool.id] || 0);
  return (
    <article className="stack stack--lg">
      <GlassPanel className="page-head">
        <div className="row row--between row--wrap"><span className="eyebrow">{tool.kind === 'agent' ? '🤖 AI agent' : '✦ AI tool'}</span><Badge tone="accent">{tool.category}</Badge></div>
        <h1>{tool.name}</h1>
        <p className="lead">{tool.description}</p>
        <div className="facts">
          <div><span className="eyebrow">Creator</span><PersonChip user={creator} size={28} /></div>
          <div><span className="eyebrow">Used</span><strong>{uses.toLocaleString()} times</strong></div>
          <div><span className="eyebrow">Rating</span><strong>{tool.rating ? <><Icon name="star" size={14} /> {tool.rating}</> : 'New'}</strong></div>
          {community && <div><span className="eyebrow">Community</span><Link to={`/community/${community.id}`}><strong>{community.name}</strong></Link></div>}
        </div>
        <div className="chips">{tool.capabilities.map((c) => <span key={c} className="badge badge--plain">{c}</span>)}</div>
        <div className="row row--wrap"><SupportBtn type="tool" id={tool.id} label={tool.name} className="btn btn--primary" /><Link to={`/u/${creator.id}`} className="btn">View creator</Link></div>
      </GlassPanel>

      <div className="pricing" aria-label="What is free and what is not">
        <div><Badge tone="success">Free</Badge><span>Using this {tool.kind} costs nothing.</span></div>
        <div><Badge tone="accent">Optional</Badge><span>Contributions are tips you choose to give. Never required.</span></div>
        <div><Badge tone="warning">Fee</Badge><span>{tool.fee ? `${tool.fee.label}: ${tool.fee.price}.` : 'No service fees on this tool.'}</span></div>
      </div>

      <section className="stack" aria-label="Try it"><h2>Try it</h2><StoneCard><AIToolDemo key={tool.id} tool={tool} /></StoneCard></section>
      <MicroContribution tool={tool} />
      <GameBreak variant="knowledge" tags={['AI']} topic="AI tools" />
      {project && <section className="stack" aria-label="Related project"><h2>Funds this project</h2><ProjectCard project={project} compact /></section>}
    </article>
  );
}
