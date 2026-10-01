import { useEffect } from 'react';
import { Link } from '../../lib/router.js';
import { GlassPanel, TactileButton, ProgressBar, Badge, Empty, StoneCard, Tag } from '../ui/index.jsx';
import { PersonChip, FollowBtn, SupportBtn } from '../common/bits.jsx';
import FundingMilestone from './FundingMilestone.jsx';
import PostCard from '../feed/PostCard.jsx';
import CommentThread from '../feed/CommentThread.jsx';
import Attachments from '../media/Attachments.jsx';
import GameBreak from '../games/GameBreak.jsx';
import AIToolCard from '../ai/AIToolCard.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';
import * as sel from '../../store/selectors.js';
import { money, pctLabel } from '../../lib/format.js';

export default function ProjectPage({ id }) {
  const { s, a } = useStore();
  const { openModal } = useUI();
  useEffect(() => { a.view(id); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const p = sel.projectById(s, id);
  if (!p) return <Empty title="Project not found"><Link to="/projects" className="btn">Browse projects</Link></Empty>;
  const ms = sel.milestonesOf(s, id);
  const updates = sel.allPosts(s).filter((x) => x.type === 'update' && x.ref?.id === id);
  const tools = sel.allTools(s).filter((t) => t.projectId === id);
  const cKey = sel.K('project', id);
  const mine = p.ownerId === 'u_dayana';
  return (
    <article className="stack stack--lg">
      <GlassPanel className="page-head">
        <div className="row row--between row--wrap"><span className="eyebrow">⚙ {p.kind}</span><Badge tone="accent">{p.status}</Badge></div>
        <h1>{p.title}</h1>
        <p className="lead">{p.tagline}</p>
        <div className="facts">
          <div><span className="eyebrow">Status</span><strong>{p.status}</strong></div>
          <div><span className="eyebrow">Category</span><strong>{[p.category, ...p.subs].join(' · ')}</strong></div>
          <div><span className="eyebrow">Funding</span><strong>{pctLabel(sel.projectPct(s, p))} of {money(sel.projectGoal(s, p))}</strong></div>
          <div><span className="eyebrow">Following</span><strong>{sel.followerCount(s, 'project', p).toLocaleString()}</strong></div>
        </div>
        <div className="chips chips--tags">{p.tags.map((t) => <Tag key={t} tag={t} />)}</div>
        <div className="row row--wrap">
          <SupportBtn type="project" id={p.id} label={p.title} className="btn btn--primary" />
          <TactileButton icon="users" onClick={() => openModal('collab', { targetType: 'project', targetId: p.id })} disabled={mine}>Collaborate</TactileButton>
          <FollowBtn type="project" id={p.id} name={p.title} size="md" />
          {mine && <TactileButton variant="primary" icon="edit" onClick={() => openModal('create', { start: 'update', projectId: p.id })}>Post an update</TactileButton>}
          {!mine && <TactileButton onClick={() => a.cheer(p.id, p.title)}>👏 Cheer · 5 ✦{s.rewards.cheers[p.id] ? ` (${s.rewards.cheers[p.id]})` : ''}</TactileButton>}
        </div>
      </GlassPanel>

      <section className="stack stack--sm"><h2>About</h2><p className="secondary prose">{p.about}</p></section>

      <Attachments entity={p} />

      <section className="stack" aria-label="Progress">
        <h2>Progress</h2>
        <StoneCard className="stack" as="div">
          {p.progress.map((x) => (
            <div key={x.label} className="progress-row"><span>{x.label}</span><ProgressBar thin value={x.pct} label={`${x.label} progress`} /><span className="muted">{x.pct}%</span></div>
          ))}
        </StoneCard>
      </section>

      <section className="stack" aria-label="Funding milestones">
        <h2>Funding milestones</h2>
        <div className="stack">{ms.map((m) => <StoneCard key={m.id}><FundingMilestone milestone={m} projectId={p.id} /></StoneCard>)}</div>
      </section>

      <section className="stack" aria-label="Team and needs">
        <div className="grid grid--2">
          <div className="stack"><h2>Team</h2>
            <StoneCard className="stack stack--sm">{p.team.map((t) => <PersonChip key={t.userId} user={sel.userById(t.userId)} size={36} sub={t.role} />)}</StoneCard></div>
          <div className="stack"><h2>Looking for</h2>
            <StoneCard className="stack stack--sm">
              <ul className="checklist">{p.looking.map((l) => <li key={l.skill} className={l.open ? 'is-open' : ''}><span aria-hidden="true">{l.open ? '☑' : '☐'}</span> {l.skill}</li>)}</ul>
              <div className="eyebrow">Needs</div>
              <div className="chips">{p.needs.map((n) => <span key={n} className="badge badge--plain">{n}</span>)}</div>
              <TactileButton variant="primary" size="sm" disabled={mine} onClick={() => openModal('collab', { targetType: 'project', targetId: p.id })}>I'm interested</TactileButton>
            </StoneCard>
          </div>
        </div>
      </section>

      {tools.length > 0 && <section className="stack" aria-label="Related AI tools"><h2>Try a related AI tool</h2><div className="grid grid--2">{tools.map((t) => <AIToolCard key={t.id} tool={t} />)}</div></section>}

      <section className="stack" aria-label="Updates"><h2>Updates</h2>
        {updates.length ? <div className="stack timeline">{updates.map((u) => <PostCard key={u.id} post={u} />)}</div> : <Empty title="No updates yet">Follow this project to hear when something ships.</Empty>}
      </section>

      <GameBreak variant="knowledge" tags={p.tags} />
      <section className="stack" aria-label="Discussion"><h2>Discussion</h2><CommentThread cKey={cKey} placeholder="Ask the team something..." /></section>
    </article>
  );
}
