import { useEffect } from 'react';
import { Link } from '../../lib/router.js';
import { GlassPanel, TactileButton, ProgressBar, Badge, Empty } from '../ui/index.jsx';
import { PersonChip, FollowBtn, SupportBtn } from '../common/bits.jsx';
import Attachments from '../media/Attachments.jsx';
import GameBreak from '../games/GameBreak.jsx';
import CommentThread from '../feed/CommentThread.jsx';
import { STAGES } from '../../data/ideas.js';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';
import * as sel from '../../store/selectors.js';
import { money, pctLabel } from '../../lib/format.js';

export function Stepper({ stage }) {
  return (
    <ol className="stepper" aria-label="Idea stage">
      {STAGES.map((st, i) => (
        <li key={st} className={i < stage ? 'is-past' : i === stage ? 'is-now' : ''} aria-current={i === stage ? 'step' : undefined}>
          <span className="stepper__dot" aria-hidden="true">{i < stage ? '✓' : i + 1}</span><span className="stepper__label">{st}</span>
        </li>
      ))}
    </ol>
  );
}

export default function IdeaPage({ id }) {
  const { s, a } = useStore();
  const { openModal } = useUI();
  const idea = sel.ideaById(s, id);
  if (!idea) return <Empty title="Idea not found"><Link to="/ideas" className="btn">Browse ideas</Link></Empty>;
  const author = sel.userById(idea.authorId);
  const on = sel.has(s, 'interested', idea.id);
  const project = idea.projectId && sel.projectById(s, idea.projectId);
  const cKey = sel.K('idea', idea.id);
  return (
    <article className="stack stack--lg">
      <GlassPanel className="page-head">
        <div className="row row--between row--wrap"><span className="eyebrow">💡 Idea</span><Badge tone="accent">{STAGES[idea.stage]}</Badge></div>
        <h1>{idea.title}</h1>
        <p className="lead">{idea.pitch}</p>
        <div className="facts">
          <div><span className="eyebrow">Author</span><PersonChip user={author} size={28} /></div>
          <div><span className="eyebrow">Category</span><strong>{idea.category} → {idea.sub}</strong></div>
          <div><span className="eyebrow">Status</span><strong>{STAGES[idea.stage]}</strong></div>
          <div><span className="eyebrow">Interest</span><strong>{sel.interestCount(s, idea).toLocaleString()} people interested</strong></div>
          <div><span className="eyebrow">Discussion</span><strong>{sel.commentCount(s, cKey, idea.comments)} comments</strong></div>
          <div><span className="eyebrow">Collaborators</span><Link to={`/collab/${sel.collabSlug(idea)}`}><strong>{idea.looking} people looking</strong></Link></div>
        </div>
        <div className="stack stack--sm">
          <div className="row row--between"><span className="eyebrow">Funding</span><strong>{money(sel.fundedOf(s, 'idea', idea), 2)} <span className="muted">/ {money(idea.goal)} · {pctLabel(sel.ideaPct(s, idea))}</span></strong></div>
          <ProgressBar value={sel.ideaPct(s, idea)} label="Idea funding" />
        </div>
        <div className="row row--wrap">
          <TactileButton variant="primary" active={on} aria-pressed={on} onClick={() => a.interest(idea.id, idea.title)}>{on ? '✓ I am interested' : "I'm interested"}</TactileButton>
          <TactileButton icon="comment" onClick={() => document.getElementById('discuss')?.scrollIntoView({ behavior: 'smooth' })}>Discuss</TactileButton>
          <TactileButton icon="users" to={`/collab/${sel.collabSlug(idea)}`}>Find collaborators</TactileButton>
          <FollowBtn type="idea" id={idea.id} name={idea.title} size="md" />
          <SupportBtn type="idea" id={idea.id} label={idea.title} className="btn btn--primary" />
        </div>
      </GlassPanel>
      <section className="stack" aria-label="Idea evolution">
        <h2>How ideas grow</h2>
        <Stepper stage={idea.stage} />
      </section>
      <section className="stack stack--sm" aria-label="About this idea">
        <h2>The thinking so far</h2>
        <p className="secondary prose">{idea.body}</p>
        <div className="eyebrow">Looking for</div>
        <div className="chips">{idea.needs.map((n) => <span key={n} className="badge badge--plain">{n}</span>)}</div>
        {project && <p className="secondary">This idea became <Link to={`/project/${project.id}`} className="accent"><strong>{project.title}</strong></Link>.</p>}
      </section>
      <Attachments entity={idea} />
      <GameBreak variant="knowledge" tags={idea.tags} />
      <section id="discuss" className="stack" aria-label="Discussion"><h2>Discussion</h2><CommentThread cKey={cKey} placeholder="Add to the discussion..." /></section>
    </article>
  );
}
