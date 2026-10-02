import { useEffect, useRef, useState } from 'react';
import { Link, back } from '../lib/router.js';
import { GlassPanel, StoneCard, TactileButton, Avatar, Empty, Badge } from '../components/ui/index.jsx';
import { PersonChip } from '../components/common/bits.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import * as sel from '../store/selectors.js';
import { ago } from '../lib/format.js';
import { ME } from '../data/users.js';

export default function RoomPage({ id }) {
  const { s, a } = useStore();
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState(null);
  const end = useRef(null);
  const p = sel.projectById(s, id);
  const room = sel.roomOf(s, id);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [room?.messages.length]);
  if (!p) return <Empty title="Project not found"><Link to="/projects" className="btn">Browse projects</Link></Empty>;
  const owner = p.ownerId === ME;
  if (!room) {
    return (
      <div className="stack stack--lg">
        <div className="row row--between"><TactileButton variant="ghost" size="sm" icon="back" onClick={back}>Back</TactileButton></div>
        <Empty title="No team room yet">{owner ? <TactileButton variant="primary" onClick={() => a.createRoom(id)}>Create the team room</TactileButton> : 'The founder has not opened a room for this project.'}</Empty>
      </div>
    );
  }
  if (!room.members.includes(ME)) {
    return <div className="stack stack--lg"><Empty title="This room is private">Only people the founder adds can see it. Contributing does not give access.<Link to={sel.collabPath(p)} className="btn">Ask to join the team</Link></Empty></div>;
  }
  const members = room.members.map(sel.userById);
  const candidates = sel.allUsers().filter((u) => !room.members.includes(u.id) && !sel.isBlocked(s, id, u.id) && (!q || `${u.name} ${u.handle} ${u.skills.join(' ')}`.toLowerCase().includes(q.toLowerCase())))
    .sort((x, y) => Number(sel.collabTeam(s, 'project', p).some((m) => m.userId === y.id)) - Number(sel.collabTeam(s, 'project', p).some((m) => m.userId === x.id)) || Number(y.openToCollab) - Number(x.openToCollab)).slice(0, 6);
  const blocked = (s.blocks[id] || []).map(sel.userById).filter(Boolean);
  const send = (e) => { e.preventDefault(); a.sendRoomMessage(id, text); setText(''); };

  return (
    <div className="stack stack--lg">
      <div className="row row--between"><TactileButton variant="ghost" size="sm" icon="back" onClick={back}>Back</TactileButton><Link to={`/project/${id}`} className="btn btn--sm">Open the project</Link></div>
      <div><span className="eyebrow">🔒 Private room</span><h1>{room.name}</h1><p className="secondary">Only the people below can read this. {owner ? 'You decide who is in.' : 'The founder decides who is in.'}</p></div>
      <div className="room">
        <GlassPanel className="room__chat">
          <ul className="thread__body" aria-label="Messages">
            {room.messages.map((m) => m.system
              ? <li key={m.id} className="sysmsg">{m.text}</li>
              : <li key={m.id} className={`bubble bubble--${m.from === ME ? 'me' : 'them'}`}>{m.from !== ME && <strong>{sel.userById(m.from)?.name}</strong>}<p>{m.text}</p><span className="muted">{ago(m.ts)}</span></li>)}
            <li ref={end} aria-hidden="true" />
          </ul>
          <form className="thread__form row" onSubmit={send}><input className="input" aria-label="Write a message" placeholder={owner ? 'Message your collaborators...' : 'Ask the founder anything...'} value={text} onChange={(e) => setText(e.target.value)} /><TactileButton type="submit" variant="primary" icon="send" disabled={!text.trim()}>Send</TactileButton></form>
        </GlassPanel>
        <div className="stack">
          <StoneCard className="stack stack--sm">
            <div className="row row--between"><h2>Members ({members.length})</h2></div>
            <ul className="stack stack--sm">{members.map((u) => (
              <li key={u.id} className="row row--between"><PersonChip user={u} size={34} sub={u.id === room.ownerId ? 'Founder' : sel.collabTeam(s, 'project', p).find((m) => m.userId === u.id)?.role || 'Member'} />
                {owner && u.id !== ME && <TactileButton size="sm" variant="ghost" onClick={() => setConfirm(u.id)} aria-label={`Remove ${u.name}`}>Remove</TactileButton>}
                {!owner && u.id === ME && <TactileButton size="sm" variant="ghost" onClick={() => a.leaveRoom(id)}>Leave</TactileButton>}</li>))}</ul>
            {confirm && (
              <div className="banner banner--warn" role="alertdialog" aria-label="Remove member">
                <strong>Remove {sel.userById(confirm).name}?</strong>
                <span className="secondary">Removing keeps them out of this room. Blocking also removes them from your team and stops them from joining, commenting or seeing the room again. Please use it for harassment, not for honest criticism.</span>
                <div className="row row--wrap"><TactileButton size="sm" onClick={() => { a.removeRoomMember(id, confirm, false); setConfirm(null); }}>Remove from room</TactileButton><TactileButton size="sm" variant="primary" onClick={() => { a.removeRoomMember(id, confirm, true); setConfirm(null); }}>Remove and block</TactileButton><TactileButton size="sm" variant="ghost" onClick={() => setConfirm(null)}>Cancel</TactileButton></div>
              </div>
            )}
          </StoneCard>
          {owner && (
            <StoneCard className="stack stack--sm">
              <h2>Add people</h2>
              <input className="input" placeholder="Search by name or skill" aria-label="Search people to add" value={q} onChange={(e) => setQ(e.target.value)} />
              <ul className="stack stack--sm">{candidates.map((u) => (
                <li key={u.id} className="row row--between"><PersonChip user={u} size={32} sub={sel.collabTeam(s, 'project', p).some((m) => m.userId === u.id) ? 'On your team' : u.openToCollab ? 'Open to collaborate' : `@${u.handle}`} /><TactileButton size="sm" onClick={() => a.addRoomMember(id, u.id)}>Add</TactileButton></li>))}
                {!candidates.length && <li className="muted">No one matches.</li>}</ul>
              <p className="muted">People who only contribute money do not get a seat. You choose who joins.</p>
            </StoneCard>
          )}
          {owner && blocked.length > 0 && (
            <StoneCard className="stack stack--sm"><h2>Blocked ({blocked.length})</h2>
              <ul className="stack stack--sm">{blocked.map((u) => <li key={u.id} className="row row--between"><span>{u.name}</span><TactileButton size="sm" variant="ghost" onClick={() => a.unblockUser(id, u.id)}>Unblock</TactileButton></li>)}</ul></StoneCard>
          )}
        </div>
      </div>
    </div>
  );
}
