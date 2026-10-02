import { useState } from 'react';
import { Link, back } from '../lib/router.js';
import { GlassPanel, StoneCard, TactileButton, ProgressBar, Badge, Empty } from '../components/ui/index.jsx';
import TrustBadge from '../components/trust/TrustBadge.jsx';
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
  const sent = sel.myRequests(s, type, e);
  const team = sel.collabTeam(s, type, e);
  const incoming = sel.incomingRequests(s, type, e);
  const page = `/${type}/${e.id}`;
  return (
    <div className="stack stack--lg">
      <div className="row row--between"><TactileButton variant="ghost" size="sm" icon="back" onClick={back}>Back</TactileButton><Link to={page} className="btn btn--sm">Open the {type}</Link></div>
      <GlassPanel className="page-head">
        <span className="eyebrow">Collaborators · {type}</span>
        <h1>{e.title}</h1>
        <p className="muted">nomi.app{sel.collabPath(e)}</p>
        {type === 'project' && <TrustBadge project={e} />}
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
          <SupportBtn type={type} id={e.id} label={e.title} className="btn" />
          {type === 'project' && (mine || sel.roomOf(s, e.id)?.members.includes(ME)) && <TactileButton icon="mail" to={`/room/${e.id}`}>Team room</TactileButton>}
          <TactileButton icon="users" variant="primary" disabled={mine} onClick={() => openModal('collab', { targetType: type, targetId: e.id })}>Request to join</TactileButton>
        </div>
      </GlassPanel>

      <section className="stack" aria-label="Current collaborators"><h2>Collaborators ({team.length})</h2>
        <div className="grid grid--2">{team.map((m) => <StoneCard key={m.userId}><PersonChip user={sel.userById(m.userId)} size={44} sub={m.role} /></StoneCard>)}</div>
        {sent.length > 0 && <ul className="stack stack--sm" aria-label="Your requests">{sent.map((r) => <li key={r.id} className="muted">Your request to join as <strong>{r.role}</strong> ({r.skill}), {ago(r.ts)} ago: <Badge tone={r.status === 'accepted' ? 'success' : r.status === 'declined' ? 'warning' : undefined}>{r.status}</Badge></li>)}</ul>}
      </section>

      {mine && (
        <section className="stack" aria-label="Join requests"><h2>Join requests ({incoming.filter((r) => r.status === 'pending').length} waiting)</h2>
          {incoming.length ? <ul className="stack stack--sm">{incoming.map((r) => { const u = sel.userById(r.fromId); return (
            <li key={r.id}><StoneCard className="stack stack--sm">
              <div className="row row--between row--wrap"><PersonChip user={u} size={40} sub={`wants to join as ${r.role}`} /><Badge tone={r.status === 'accepted' ? 'success' : r.status === 'declined' ? 'warning' : 'accent'}>{r.status}</Badge></div>
              <p className="secondary">“{r.message}”</p><span className="muted">Offers: {r.skill} · {ago(r.ts)} ago</span>
              {r.status === 'pending' && <div className="row row--wrap"><TactileButton size="sm" variant="primary" onClick={() => a.decideCollab(r.id, 'accepted')}>Say yes</TactileButton><TactileButton size="sm" onClick={() => a.decideCollab(r.id, 'declined')}>Not now</TactileButton><TactileButton size="sm" variant="ghost" to={`/u/${u.id}`}>View profile</TactileButton></div>}
            </StoneCard></li>); })}</ul> : <p className="muted">No requests yet. When someone wants to join, you decide.</p>}
        </section>
      )}

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
