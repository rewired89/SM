import { useState } from 'react';
import { Modal, TactileButton, Badge } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';
import * as sel from '../../store/selectors.js';
import { navigate } from '../../lib/router.js';
import { TOPICS, FORMATS, DURATIONS, toIso, isFuture, localMin } from '../../lib/meetings.js';
import { money } from '../../lib/format.js';

export default function MeetingModal({ projectId }) {
  const { s, a } = useStore();
  const { closeModal } = useUI();
  const p = sel.projectById(s, projectId);
  const owner = sel.userById(p.ownerId);
  const [f, setF] = useState({ topic: TOPICS[0], message: '', duration: 30, format: FORMATS[0] });
  const [slots, setSlots] = useState(['', '', '']);
  const [err, setErr] = useState('');
  const send = (e) => {
    e.preventDefault();
    const iso = slots.map(toIso).filter(Boolean);
    if (!iso.length) return setErr('Propose at least one time that works for you.');
    if (iso.some((x) => !isFuture(x))) return setErr('Please choose times in the future.');
    if (!f.message.trim()) return setErr('Add a short note so the founder knows what you want to talk about.');
    if (a.requestMeeting(projectId, { ...f, duration: Number(f.duration), message: f.message.trim(), slots: iso })) { closeModal(); navigate('/meetings'); }
  };
  return (
    <Modal title={`Request a meeting with ${owner.name}`} onClose={closeModal} label="Request a meeting">
      <form className="stack" onSubmit={send}>
        <div className="banner"><Badge tone="success">Unlocked</Badge><span className="secondary">You have backed {p.title} with {money(sel.backedTotal(s, p.id), 0)}. {owner.name} decides whether and when to meet. You will go back and forth on times until you both agree.</span></div>
        <div className="field"><label htmlFor="mt-topic">What is it about?</label><select id="mt-topic" className="select" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div className="field"><label htmlFor="mt-msg">A short note</label><textarea id="mt-msg" className="textarea" rows={3} maxLength={500} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></div>
        <div className="grid grid--2">
          <div className="field"><label htmlFor="mt-dur">How long</label><select id="mt-dur" className="select" value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })}>{DURATIONS.map((d) => <option key={d} value={d}>{d} minutes</option>)}</select></div>
          <div className="field"><label htmlFor="mt-fmt">Format</label><select id="mt-fmt" className="select" value={f.format} onChange={(e) => setF({ ...f, format: e.target.value })}>{FORMATS.map((d) => <option key={d}>{d}</option>)}</select></div>
        </div>
        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}><legend className="label">Times that work for you (up to 3, in your time zone)</legend>
          {slots.map((v, i) => <input key={i} className="input" type="datetime-local" min={localMin()} aria-label={`Proposed time ${i + 1}`} value={v} onChange={(e) => setSlots(slots.map((x, j) => (j === i ? e.target.value : x)))} style={{ marginTop: 6 }} />)}</fieldset>
        <p className="muted">Contributions are not investments and do not give ownership or any promise of returns. A meeting is a conversation.</p>
        {err && <p className="danger" role="alert">{err}</p>}
        <TactileButton type="submit" variant="primary" size="lg">Send request</TactileButton>
      </form>
    </Modal>
  );
}
