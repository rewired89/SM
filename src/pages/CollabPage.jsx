import { useState } from 'react';
import { Link, back } from '../lib/router.js';
import { GlassPanel, StoneCard, TactileButton, ProgressBar, Badge, Empty } from '../components/ui/index.jsx';
import { PersonChip, SupportBtn } from '../components/common/bits.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import { useUI } from '../store/UIProvider.jsx';
import * as sel from '../store/selectors.js';
import { money, pctLabel, ago } from '../lib/format.js';
import { ME } from '../data/users.js';

export default function CollabPage({ slug }) {
  const { s, a } = useStore();
  const { openModal } = useUI();
  const [role, setRole] = useState(null);
  const t = sel.collabTarget(s, slug);
  if (!t) return <Empty title="Nothing here"><Link to="/projects" className="btn">Browse projects</Link></Empty>;
  const { type, entity: e } = t;
  const st = sel.collabStats(s, type, e);
  const owner = sel.userById(e.ownerId || e.authorId);
  const mine = owner.id === ME;
  const roles = type === 'project' ? (e.looking || []).filter((l) => l.open).map((l) => l.skill) : e.needs;
  const people = sel.collabCandidates(s, type, e, role).slice(0, 8);
  const sent = s.collabRequests.filter((r) => r.targetType === type && r.targetId === e.id);
  const team = type === 'project' ? e.team : [{ userId: e.authorId, role: 'Idea author' }];
  const page = `/${type}/${e.id}`;
  return (
    <div className="stack stack--lg">
      <div className="row row--between"><TactileButton variant="ghost" size="sm" icon="back" onClick={back}>Back</TactileButton><Link to={page} className="btn btn--sm">Open the {type}</Link></div>
      <GlassPanel className="page-head">
        <span className="eyebrow">Collaborators · {type}</span>
        <h1>{e.title}</h1>
        <p className="muted">nomi.app/collab/{sel.collabSlug(e)}</p>
        <div className="stats">
          <div className="stat"><span className="muted">Collaborators</span><strong>{st.collaborators}</strong></div>
          <div className="stat"><span className="muted">Open roles</span><strong>{st.open}</strong></div>
          <div className="stat"><span className="muted">Funding needed</span><strong>{money(st.goal)}</strong></div>
          <div className="stat"><span className="muted">Raised so far</span><strong>{money(st.funded, 2)}</strong></div>
        </div>
        <div className="stack stack--sm">
          <div className="row row--between"><span className="muted">{pctLabel(st.pct)} funded</span><strong>{money(st.remaining, 2)} remaining</strong></div>
          <ProgressBar value={st.pct} label="Funding progress" />
        </div>
        <div className="row row--wrap">
          <SupportBtn type={type} id={e.id} label={e.title} className="btn btn--primary" />
          <TactileButton icon="users" disabled={mine} onClick={() => openModal('collab', { targetType: type, targetId: e.id })}>I'm interested</TactileButton>
        </div>
      </GlassPanel>

      <section className="stack" aria-label="Current collaborators"><h2>Collaborators ({team.length})</h2>
        <div className="grid grid--2">{team.map((m) => <StoneCard key={m.userId}><PersonChip user={sel.userById(m.userId)} size={44} sub={m.role} /></StoneCard>)}</div>
        {sent.length > 0 && <p className="muted">You sent {sent.length} request{sent.length === 1 ? '' : 's'} here ({sent.map((r) => `${r.skill}, ${ago(r.ts)} ago`).join('; ')}).</p>}
      </section>

      <section className="stack" aria-label="Open roles"><h2>Open roles</h2>
        {roles.length ? <div className="chips" role="group" aria-label="Filter people by role"><button type="button" className="chip" aria-pressed={!role} onClick={() => setRole(null)}>All</button>{roles.map((r) => <button key={r} type="button" className="chip" aria-pressed={role === r} onClick={() => setRole(role === r ? null : r)}>{r}</button>)}</div> : <p className="muted">No open roles right now.</p>}
      </section>

      <section className="stack" aria-label="People who could help"><h2>People who could help</h2>
        <p className="secondary">Open to collaborations and matching {role ? `"${role}"` : 'what this needs'}.</p>
        {people.length ? <div className="grid grid--2">{people.map(({ user, reason }) => (
          <StoneCard key={user.id} to={`/u/${user.id}`} className="stack stack--sm">
            <PersonChip user={user} size={44} sub={user.headline.slice(0, 2).join(' • ')} />
            <div className="chips"><Badge tone="success">🤝 Open</Badge>{user.collabTypes.slice(0, 2).map((x) => <span key={x} className="badge badge--plain">{x}</span>)}</div>
            {reason && <span className="muted">Matches: {reason}</span>}
          </StoneCard>
        ))}</div> : <Empty title="No matches yet">Try another role, or check back later.</Empty>}
      </section>
    </div>
  );
}
