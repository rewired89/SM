import { useEffect, useRef, useState } from 'react';
import { Icon, TactileButton } from '../ui/index.jsx';
import { ACCEPT, validate, parseLink, fmtSize } from '../../lib/media.js';
import { useUI } from '../../store/UIProvider.jsx';

/* controlled by the parent: items = [{file, kind, url, alt}], links = [{url, host, ...}] */
export default function MediaPicker({ items, setItems, links, setLinks, deck }) {
  const { toast } = useUI();
  const visual = useRef(null), docs = useRef(null);
  const [linkText, setLinkText] = useState('');
  const [showLink, setShowLink] = useState(false);
  const urls = useRef([]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const add = (files) => {
    const next = [];
    [...files].forEach((f) => {
      const v = validate(f);
      if (!v.ok) { toast(v.error, { tone: 'danger', ms: 5000 }); return; }
      const url = v.kind === 'image' || v.kind === 'video' ? URL.createObjectURL(f) : null;
      if (url) urls.current.push(url);
      next.push({ file: f, kind: v.kind, url, alt: '', pitch: deck });
    });
    if (next.length) setItems((x) => [...x, ...next].slice(0, 6));
  };
  const addLink = () => {
    const p = parseLink(linkText);
    if (!p) { toast('That does not look like a valid web link.', { tone: 'danger' }); return; }
    if (!links.some((l) => l.url === p.url)) setLinks((x) => [...x, p].slice(0, 6));
    setLinkText(''); setShowLink(false);
  };
  return (
    <div className="stack stack--sm picker">
      <div className="row row--wrap">
        <input ref={visual} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
        <input ref={docs} type="file" accept=".pdf,.pptx,.ppt,application/pdf" multiple hidden onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
        <TactileButton size="sm" onClick={() => visual.current.click()}>📷 Photo or video</TactileButton>
        <TactileButton size="sm" onClick={() => docs.current.click()}>📄 {deck ? 'Pitch deck (PDF or PPTX)' : 'PDF or deck'}</TactileButton>
        <TactileButton size="sm" icon="link" onClick={() => setShowLink((s) => !s)} aria-expanded={showLink}>Link</TactileButton>
      </div>
      {showLink && (
        <div className="row"><input className="input" value={linkText} onChange={(e) => setLinkText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }} placeholder="github.com/you/repo or any link" aria-label="Link address" /><TactileButton size="sm" variant="primary" onClick={addLink}>Add</TactileButton></div>
      )}
      {(items.length > 0 || links.length > 0) && (
        <ul className="picker__list">
          {items.map((it, i) => (
            <li key={i} className="picker__item">
              {it.kind === 'image' && <img src={it.url} alt="" />}
              {it.kind === 'video' && <video src={it.url} muted playsInline preload="metadata" />}
              {(it.kind === 'pdf' || it.kind === 'deck') && <span className="picker__doc">{it.kind === 'pdf' ? '📄' : '📊'}</span>}
              <div className="grow"><strong className="picker__name">{it.file.name}</strong><span className="muted">{fmtSize(it.file.size)}</span>
                {it.kind === 'image' && <input className="input picker__alt" placeholder="Describe the image (for screen readers)" aria-label="Image description" value={it.alt} onChange={(e) => setItems((x) => x.map((y, j) => (j === i ? { ...y, alt: e.target.value } : y)))} />}
              </div>
              <button type="button" className="iconbtn" aria-label={`Remove ${it.file.name}`} onClick={() => setItems((x) => x.filter((_, j) => j !== i))}><Icon name="x" size={16} /></button>
            </li>
          ))}
          {links.map((l, i) => (
            <li key={l.url} className="picker__item"><span className="picker__doc">🔗</span><div className="grow"><strong className="picker__name">{l.kind === 'repo' ? `${l.owner}/${l.repo}` : l.host}</strong><span className="muted">{l.url}</span></div><button type="button" className="iconbtn" aria-label={`Remove link ${l.host}`} onClick={() => setLinks((x) => x.filter((_, j) => j !== i))}><Icon name="x" size={16} /></button></li>
          ))}
        </ul>
      )}
      <p className="muted picker__note">Photos up to 8 MB, videos up to 50 MB, PDF and PowerPoint up to 25 MB. In this prototype files stay on this device.</p>
    </div>
  );
}
