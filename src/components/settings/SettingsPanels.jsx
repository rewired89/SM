import { useRef, useState } from 'react';
import { Avatar, TactileButton, StoneCard } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';
import * as sel from '../../store/selectors.js';
import { CAREERS, CAREER_STATUS, COLLAB_TYPES, SOCIALS, normalizeSocial } from '../../lib/profile.js';
import { topTags } from '../../data/communities.js';

const INTEREST_OPTIONS = [...new Set([...topTags, 'Design', 'Education', 'Climate', 'Health', 'Finance', 'Writing', 'Film', 'Music', 'Startups', 'Robotics'])];
const HANDLE = /^[a-z0-9_]{3,20}$/i;

/* center-crop and shrink to a 256px JPEG so it stays small in storage */
function toAvatar(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(img.width, img.height), c = document.createElement('canvas');
      c.width = c.height = 256;
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad image')); };
    img.src = url;
  });
}

function useDraft() {
  const { s, a } = useStore();
  const [d, setD] = useState(() => structuredClone(s.profile));
  return { s, a, d, setD, set: (k) => (e) => setD({ ...d, [k]: e.target.value }) };
}

export function ProfilePanel() {
  const { a, d, setD, set } = useDraft();
  const { toast } = useUI();
  const file = useRef(null);
  const [err, setErr] = useState('');
  const pick = async (e) => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    if (!f.type.startsWith('image/') || f.type.includes('svg')) { toast('Please choose a photo (JPG, PNG, WebP or GIF).', { tone: 'danger' }); return; }
    if (f.size > 8 * 1048576) { toast('That photo is over 8 MB.', { tone: 'danger' }); return; }
    try { setD({ ...d, avatar: await toAvatar(f) }); } catch { toast('Could not read that image.', { tone: 'danger' }); }
  };
  const save = () => {
    if (!d.name.trim()) return setErr('Please add a display name.');
    if (!HANDLE.test(d.handle)) return setErr('Your @username needs 3 to 20 letters, numbers or underscores.');
    setErr('');
    a.saveProfile({ ...d, name: d.name.trim(), handle: d.handle.trim(), skills: d.skills.filter(Boolean) });
  };
  const preview = { ...sel.me(), name: d.name || 'You', avatar: d.avatar };
  return (
    <div className="stack">
      <div className="row row--wrap"><Avatar user={preview} size={88} />
        <div className="stack stack--sm"><input ref={file} type="file" accept="image/*" hidden onChange={pick} />
          <div className="row"><TactileButton onClick={() => file.current.click()}>Upload photo</TactileButton>{d.avatar && <TactileButton variant="ghost" onClick={() => setD({ ...d, avatar: null })}>Remove</TactileButton>}</div>
          <span className="muted">Square photos look best. We crop it to a circle.</span></div></div>
      <div className="grid grid--2">
        <div className="field"><label htmlFor="s-name">Display name or nickname</label><input id="s-name" className="input" value={d.name} onChange={set('name')} maxLength={40} /></div>
        <div className="field"><label htmlFor="s-handle">@username</label><input id="s-handle" className="input" value={d.handle} onChange={set('handle')} maxLength={20} autoCapitalize="off" /></div>
        <div className="field"><label htmlFor="s-loc">Location</label><input id="s-loc" className="input" value={d.location} onChange={set('location')} maxLength={50} /></div>
        <div className="field"><label htmlFor="s-skills">Skills (comma separated)</label><input id="s-skills" className="input" value={d.skills.join(', ')} onChange={(e) => setD({ ...d, skills: e.target.value.split(',').map((x) => x.trim()) })} /></div>
      </div>
      <div className="field"><label htmlFor="s-bio">Bio</label><textarea id="s-bio" className="textarea" value={d.bio} onChange={set('bio')} maxLength={280} /><span className="muted">{d.bio.length}/280</span></div>
      {err && <p className="danger" role="alert">{err}</p>}
      <div><TactileButton variant="primary" onClick={save}>Save profile</TactileButton></div>
    </div>
  );
}

export function InterestsPanel() {
  const { a, d, setD } = useDraft();
  const [custom, setCustom] = useState('');
  const toggle = (t) => setD({ ...d, interests: d.interests.includes(t) ? d.interests.filter((x) => x !== t) : [...d.interests, t] });
  const addCustom = () => { const t = custom.replace(/[^A-Za-z0-9]/g, '').slice(0, 24); if (t && !d.interests.includes(t)) setD({ ...d, interests: [...d.interests, t] }); setCustom(''); };
  const c = d.career || { field: '', status: 'working', studying: '' };
  const setC = (patch) => setD({ ...d, career: { ...c, ...patch } });
  const inProgress = c.field === 'Still in progress';
  return (
    <div className="stack">
      <div className="stack stack--sm"><span className="label">Things I like (shown as hashtags in your bio)</span>
        <div className="chips">{[...new Set([...INTEREST_OPTIONS, ...d.interests])].map((t) => <button key={t} type="button" className="chip" aria-pressed={d.interests.includes(t)} onClick={() => toggle(t)}>#{t}</button>)}</div>
        <div className="row"><input className="input" style={{ maxWidth: 260 }} value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }} placeholder="Add your own, like Astronomy" aria-label="Add your own hashtag" /><TactileButton size="sm" onClick={addCustom}>Add</TactileButton></div></div>
      <div className="field"><label htmlFor="s-career">Career category</label>
        <select id="s-career" className="select" value={c.field} onChange={(e) => setC({ field: e.target.value, status: e.target.value === 'Still in progress' ? 'progress' : c.status === 'progress' && e.target.value !== c.field ? 'working' : c.status })}>
          <option value="">Prefer not to say</option>{CAREERS.map((x) => <option key={x}>{x}</option>)}<option>Still in progress</option>
        </select>
        <span className="muted">"Still in progress" is for people who are still studying, switching paths or finding their way. That is welcome here.</span></div>
      {c.field && !inProgress && <div className="chips" role="radiogroup" aria-label="Career status">{CAREER_STATUS.map(([id, label]) => <button key={id} type="button" role="radio" aria-checked={c.status === id} className="chip" onClick={() => setC({ status: id })}>{label}</button>)}</div>}
      {(inProgress || c.status === 'progress' || c.status === 'studying') && <div className="field"><label htmlFor="s-study">What are you studying or working toward? (optional)</label><input id="s-study" className="input" value={c.studying || ''} onChange={(e) => setC({ studying: e.target.value })} maxLength={60} /></div>}
      <div><TactileButton variant="primary" onClick={() => a.saveProfile({ interests: d.interests, career: c.field ? c : null })}>Save interests and career</TactileButton></div>
    </div>
  );
}

export function LinksPanel() {
  const { a, d, setD } = useDraft();
  const [errs, setErrs] = useState({});
  const save = () => {
    const out = {}, e = {};
    SOCIALS.forEach((x) => { const raw = d.socials[x.id]; if (!raw) return; const n = normalizeSocial(x.id, raw); if (n) out[x.id] = n; else e[x.id] = `That does not look like a ${x.label} link.`; });
    setErrs(e);
    if (!Object.keys(e).length) { setD({ ...d, socials: out }); a.saveProfile({ socials: out }); }
  };
  return (
    <div className="stack">
      <p className="secondary">Add the places people can find you. Paste a full link or just your handle.</p>
      <div className="grid grid--2">
        {SOCIALS.map((x) => (
          <div className="field" key={x.id}><label htmlFor={`l-${x.id}`}>{x.label}</label>
            <input id={`l-${x.id}`} className="input" value={d.socials[x.id] || ''} onChange={(e) => setD({ ...d, socials: { ...d.socials, [x.id]: e.target.value } })} placeholder={x.id === 'website' ? 'https://yoursite.com' : `${x.base || 'https://'}you`} autoCapitalize="off" aria-invalid={!!errs[x.id]} />
            {errs[x.id] && <span className="danger" role="alert">{errs[x.id]}</span>}</div>
        ))}
      </div>
      <div><TactileButton variant="primary" onClick={save}>Save links</TactileButton></div>
    </div>
  );
}

export function CollabPanel() {
  const { a, d, setD } = useDraft();
  const toggle = (t) => setD({ ...d, collabTypes: d.collabTypes.includes(t) ? d.collabTypes.filter((x) => x !== t) : [...d.collabTypes, t] });
  return (
    <div className="stack">
      <label className="switch"><input type="checkbox" checked={d.openToCollab} onChange={(e) => setD({ ...d, openToCollab: e.target.checked })} /> <span><strong>Open to collaborations</strong><br /><span className="muted">Shows a badge on your profile and helps people find you.</span></span></label>
      <div className="stack stack--sm" aria-disabled={!d.openToCollab}><span className="label">What kind of collaborator are you?</span>
        <div className="chips">{COLLAB_TYPES.map((t) => <button key={t} type="button" className="chip" disabled={!d.openToCollab} aria-pressed={d.collabTypes.includes(t)} onClick={() => toggle(t)}>{t}</button>)}</div></div>
      <div><TactileButton variant="primary" onClick={() => a.saveProfile({ openToCollab: d.openToCollab, collabTypes: d.openToCollab ? d.collabTypes : [] })}>Save collaboration</TactileButton></div>
    </div>
  );
}
