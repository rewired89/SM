import { useState } from 'react';
import { StoneCard, TactileButton, Badge } from '../ui/index.jsx';
import { PersonChip } from '../common/bits.jsx';
import { Link } from '../../lib/router.js';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';
import { fmtSlot, toIso, isFuture, localMin, downloadIcs } from '../../lib/meetings.js';
import { ago } from '../../lib/format.js';
import { ME } from '../../data/users.js';

export default function MeetingCard({ m }) {
  const { s, a } = useStore();
  const p = sel.projectById(s, m.projectId);
  const amFounder = m.founderId === ME;
  const other = sel.userById(amFounder ? m.backerId : m.founderId);
  const mine = m.status === 'negotiating' && m.turn === ME;
  const [mode, setMode] = useState(null);
  const [pick, setPick] = useState(m.slots[0]);
  const chosen = m.slots.includes(pick) ? pick : m.slots[0];
  const [place, setPlace] = useState(m.place || '');
  const [note, setNote] = useState('');
  const [slots, setSlots] = useState(['', '', '']);
  const [err, setErr] = useState('');
  const needPlace = amFounder && m.format !== 'Phone call';
  const acceptNow = () => {
    if (needPlace && !place.trim() && !m.place) return setErr(m.format === 'Video call' ? 'Add a video link for the call.' : 'Add where you will meet.');
    a.respondMeeting(m.id, 'accept', { slot: chosen, place: place.trim() || m.place });
    setMode(null);
  };
  const counter = () => {
    const iso = slots.map(toIso).filter(Boolean);
    if (!iso.length || iso.some((x) => !isFuture(x))) return setErr('Propose at least one time in the future.');
    a.respondMeeting(m.id, 'counter', { slots: iso, note: note.trim(), place: place.trim() || m.place });
    setMode(null);
  };
  const tone = { negotiating: mine ? 'accent' : undefined, confirmed: 'success', declined: 'warning', cancelled: 'warning' }[m.status];
  const label = m.status === 'negotiating' ? (mine ? 'Your move' : `Waiting for ${other.name.split(' ')[0]}`) : m.status;

  return (
    <StoneCard className="stack">
      <div className="row row--between row--wrap">
        <PersonChip user={other} size={40} sub={amFounder ? 'Backer wants to meet' : 'Founder'} />
        <Badge tone={tone}>{label}</Badge>
      </div>
      <div><strong>{m.topic}</strong> · <Link to={`/project/${m.projectId}`} className="accent">{p?.title}</Link><div className="muted">{m.duration} min · {m.format} · requested {ago(m.createdAt)} ago</div></div>
      <p className="secondary">“{m.message}”</p>

      {m.status === 'confirmed' && (
        <div className="banner banner--success">
          <strong>📅 {fmtSlot(m.final.slot)}</strong>
          {m.final.place && <span>{/^https?:/.test(m.final.place) ? <a className="accent" href={m.final.place} target="_blank" rel="noopener noreferrer">{m.final.place}</a> : m.final.place}</span>}
          <div className="row row--wrap"><TactileButton size="sm" onClick={() => downloadIcs(m, `Meeting about ${p?.title}`)}>Add to calendar</TactileButton><TactileButton size="sm" variant="ghost" onClick={() => { if (window.confirm('Cancel this meeting?')) a.respondMeeting(m.id, 'cancel'); }}>Cancel</TactileButton></div>
        </div>
      )}

      {m.status === 'negotiating' && (
        <div className="stack stack--sm">
          <span className="eyebrow">{m.proposedBy === ME ? 'You proposed' : `${sel.userById(m.proposedBy).name.split(' ')[0]} proposed`}</span>
          {m.note && <p className="muted">“{m.note}”</p>}
          {m.place && <p className="muted">Where: {m.place}</p>}
          <div className="chips" role={mine ? 'radiogroup' : undefined} aria-label="Proposed times">
            {m.slots.map((x) => mine ? <button key={x} type="button" role="radio" aria-checked={chosen === x} className="chip" onClick={() => setPick(x)}>{fmtSlot(x)}</button> : <span key={x} className="badge badge--plain">{fmtSlot(x)}</span>)}
          </div>
          {mine && mode === null && (
            <div className="row row--wrap"><TactileButton size="sm" variant="primary" onClick={() => { setErr(''); if (needPlace && !m.place) setMode('accept'); else { a.respondMeeting(m.id, 'accept', { slot: chosen, place: m.place }); } }}>Accept {fmtSlot(chosen)}</TactileButton><TactileButton size="sm" onClick={() => { setErr(''); setMode('counter'); }}>Suggest other times</TactileButton><TactileButton size="sm" variant="ghost" onClick={() => { if (window.confirm('Decline this request?')) a.respondMeeting(m.id, 'decline'); }}>Decline</TactileButton></div>
          )}
          {mine && mode === 'accept' && (
            <div className="stack stack--sm"><div className="field"><label htmlFor={`pl-${m.id}`}>{m.format === 'Video call' ? 'Video call link' : 'Where to meet'}</label><input id={`pl-${m.id}`} className="input" value={place} onChange={(e) => setPlace(e.target.value)} placeholder={m.format === 'Video call' ? 'https://meet...' : 'Address or place'} /></div><div className="row"><TactileButton size="sm" variant="primary" onClick={acceptNow}>Confirm {fmtSlot(chosen)}</TactileButton><TactileButton size="sm" variant="ghost" onClick={() => setMode(null)}>Back</TactileButton></div></div>
          )}
          {mine && mode === 'counter' && (
            <div className="stack stack--sm">
              {slots.map((v, i) => <input key={i} className="input" type="datetime-local" min={localMin()} aria-label={`New time ${i + 1}`} value={v} onChange={(e) => setSlots(slots.map((x, j) => (j === i ? e.target.value : x)))} />)}
              {needPlace && <input className="input" aria-label="Link or place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder={m.format === 'Video call' ? 'Video call link (optional now)' : 'Where to meet (optional now)'} />}
              <input className="input" aria-label="Note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="A short note, for example mornings are better for me" />
              <div className="row"><TactileButton size="sm" variant="primary" onClick={counter}>Send new times</TactileButton><TactileButton size="sm" variant="ghost" onClick={() => setMode(null)}>Back</TactileButton></div>
            </div>
          )}
          {!mine && <TactileButton size="sm" variant="ghost" onClick={() => { if (window.confirm('Withdraw this request?')) a.respondMeeting(m.id, 'cancel'); }}>Withdraw</TactileButton>}
          {err && <p className="danger" role="alert">{err}</p>}
        </div>
      )}
    </StoneCard>
  );
}
