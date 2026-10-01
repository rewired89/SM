import { useEffect, useRef, useState } from 'react';
import { Icon, TactileButton } from '../ui/index.jsx';
import { useMediaUrl, fmtSize } from '../../lib/media.js';
import { reducedMotion } from '../games/useLoop.js';

function Video({ m }) {
  const url = useMediaUrl(m);
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || !url || reducedMotion()) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && e.intersectionRatio > 0.6) v.play().catch(() => {}); else v.pause(); }, { threshold: [0, 0.6, 1] });
    io.observe(v);
    return () => io.disconnect();
  }, [url]);
  if (url === '') return <div className="file file--missing">This video is only stored on the device that posted it.</div>;
  return <video ref={ref} className="media__video" src={url || undefined} controls muted loop playsInline preload="metadata" aria-label={m.name || 'Video'} />;
}

function Image({ m }) {
  const url = useMediaUrl(m);
  if (url === '') return <div className="file file--missing">This image is only stored on the device that posted it.</div>;
  return <img className="media__img" src={url || undefined} alt={m.alt || m.name || 'Attached image'} loading="lazy" />;
}

function FileCard({ m }) {
  const url = useMediaUrl(m);
  const [open, setOpen] = useState(false);
  const isPdf = m.kind === 'pdf';
  return (
    <div className="file">
      <div className="row">
        <span className="file__ico" aria-hidden="true">{isPdf ? '📄' : '📊'}</span>
        <div className="grow"><strong>{m.name}</strong><div className="muted">{isPdf ? 'PDF' : 'PowerPoint'}{m.size ? ` · ${fmtSize(m.size)}` : ''}{m.pitch ? ' · Pitch deck' : ''}</div></div>
        {isPdf && <TactileButton size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? 'Hide' : 'Preview'}</TactileButton>}
        {url && <a className="btn btn--sm" href={url} download={m.name}>Download</a>}
      </div>
      {!isPdf && <p className="muted">PowerPoint files cannot be previewed in the browser. Export to PDF for an in-app preview.</p>}
      {isPdf && open && url && <iframe className="file__pdf" src={url} title={`Preview of ${m.name}`} />}
      {url === '' && <p className="muted">This file is only stored on the device that posted it.</p>}
    </div>
  );
}

export default function MediaGrid({ media }) {
  if (!media?.length) return null;
  const visual = media.filter((m) => m.kind === 'image' || m.kind === 'video');
  const files = media.filter((m) => m.kind === 'pdf' || m.kind === 'deck');
  return (
    <div className="stack stack--sm media">
      {visual.length > 0 && <div className={`media__grid media__grid--${Math.min(visual.length, 2)}`}>{visual.map((m) => (m.kind === 'video' ? <Video key={m.id || m.src} m={m} /> : <Image key={m.id || m.src} m={m} />))}</div>}
      {files.map((m) => <FileCard key={m.id || m.src} m={m} />)}
    </div>
  );
}
