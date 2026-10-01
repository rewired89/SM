import { StoneCard, Badge, Icon } from '../ui/index.jsx';
import { SupportBtn, PersonChip } from '../common/bits.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';
import { compact } from '../../lib/format.js';

export default function AIToolCard({ tool }) {
  const { s } = useStore();
  const creator = sel.userById(tool.creatorId);
  const uses = tool.uses + (s.toolUses[tool.id] || 0);
  return (
    <StoneCard to={`/ai/${tool.id}`} className="tool-card" label={`Open ${tool.name}`}>
      <div className="row row--between row--wrap">
        <span className="eyebrow">{tool.kind === 'agent' ? '🤖 AI agent' : '✦ AI tool'} · {tool.category}</span>
        {tool.rating > 0 && <Badge tone="warning"><Icon name="star" size={11} /> {tool.rating}</Badge>}
      </div>
      <h3 className="card-title">{tool.name}</h3>
      <p className="secondary">{tool.description}</p>
      <PersonChip user={creator} size={28} sub={`Used ${compact(uses)} times`} />
      <div className="chips">{tool.capabilities.slice(0, 3).map((c) => <span key={c} className="badge badge--plain">{c}</span>)}</div>
      <div className="row row--between">
        <a className="btn btn--sm" href={`#/ai/${tool.id}`}>Try {tool.kind === 'agent' ? 'agent' : 'tool'}</a>
        <SupportBtn type="tool" id={tool.id} label={tool.name} />
      </div>
    </StoneCard>
  );
}
