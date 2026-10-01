import { useState } from 'react';
import { Modal, TactileButton, Icon } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';
import * as sel from '../../store/selectors.js';
import { ME } from '../../data/users.js';

const ROLES = [['Collaborator', 'Help build it'], ['Co-founder', 'Share ownership and decisions'], ['Advisor', 'Guide from experience'], ['Contributor', 'One-off or part-time help']];

export default function CollaborationModal({ targetType, targetId }) {
  const { s, a } = useStore();
  const { closeModal } = useUI();
  const e = sel.entityOf(s, { type: targetType, id: targetId });
  const owner = sel.userById(e.ownerId || e.authorId);
  const options = (e.looking?.filter((l) => l.open).map((l) => l.skill)) || e.needs || [];
  const mySkills = sel.me().skills;
  const [skill, setSkill] = useState(options[0] || mySkills[0]);
  const [role, setRole] = useState('Collaborator');
  const [msg, setMsg] = useState(`Hi ${owner.name.split(' ')[0]}, I work with ${mySkills.slice(0, 2).join(' and ')} and would love to help.`);
  const send = (ev) => {
    ev.preventDefault();
    a.sendCollab({ targetType, targetId, skill, message: msg, role });
    closeModal();
  };
  const all = [...new Set([...options, ...mySkills])];
  return (
    <Modal title={`Join ${sel.nameOf(e)}`} onClose={closeModal} label="Collaboration request">
      <form className="stack" onSubmit={send}>
        <p className="secondary">{owner.name} is looking for {options.length ? options.join(', ').toLowerCase() : 'collaborators'}.</p>
        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="label">How do you want to join?</legend>
          <div className="chips" role="radiogroup" aria-label="Role">{ROLES.map(([r, hint]) => <button type="button" key={r} role="radio" aria-checked={role === r} className="chip" title={hint} onClick={() => setRole(r)}>{r}</button>)}</div>
          <span className="muted">{ROLES.find(([r]) => r === role)[1]}. The founder decides, and you will be notified.</span>
        </fieldset>
        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="label">What can you help with?</legend>
          <div className="chips" role="radiogroup" aria-label="Skill">
            {all.map((o) => <button type="button" key={o} role="radio" aria-checked={skill === o} className="chip" onClick={() => setSkill(o)}>{o}</button>)}
          </div>
        </fieldset>
        <div className="field">
          <label htmlFor="intro">Send introduction</label>
          <textarea id="intro" className="textarea" value={msg} onChange={(ev) => setMsg(ev.target.value)} />
        </div>
        <TactileButton type="submit" variant="primary" icon="send" disabled={!msg.trim() || ME === owner.id}>Request to join as {role}</TactileButton>
        {ME === owner.id && <p className="muted">This is your own project, so there is no one to send this to.</p>}
      </form>
    </Modal>
  );
}
