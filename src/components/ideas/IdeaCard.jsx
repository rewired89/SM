import { StoneCard, ProgressBar, TactileButton } from '../ui/index.jsx';
import { StageBadge, SupportBtn, PersonChip } from '../common/bits.jsx';
import { Link } from '../../lib/router.js';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';
import { money } from '../../lib/format.js';

export default function IdeaCard({ idea, embedded }) {
  const { s, a } = useStore();
  const on = sel.has(s, 'interested', idea.id);
  const author = sel.userById(idea.authorId);
  return (
    <StoneCard to={`/idea/${idea.id}`} className="idea-card" label={`Open idea ${idea.title}`}>
      <div className="row row--between row--wrap">
        <span className="eyebrow">💡 Idea · {idea.category} → {idea.sub}</span>
        <StageBadge stage={idea.stage} />
      </div>
      <h3 className="card-title">{idea.title}</h3>
      <p className="secondary">{idea.pitch}</p>
      {!embedded && <PersonChip user={author} size={28} />}
      <ProgressBar thin value={sel.ideaPct(s, idea)} label="Idea funding" />
      <div className="row row--between row--wrap">
        <span className="muted">{sel.interestCount(s, idea).toLocaleString()} interested · {money(sel.fundedOf(s, 'idea', idea), 0)} of {money(idea.goal)}</span>
        <div className="row">
          <TactileButton size="sm" active={on} aria-pressed={on} onClick={() => a.interest(idea.id, idea.title)}>{on ? '✓ Interested' : "I'm interested"}</TactileButton>
          <SupportBtn type="idea" id={idea.id} label={idea.title} />
        </div>
      </div>
    </StoneCard>
  );
}
