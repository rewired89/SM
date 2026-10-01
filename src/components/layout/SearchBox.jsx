import { useMemo, useState } from 'react';
import { navigate } from '../../lib/router.js';
import { Icon } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';

const COLLAB = /^\/?collab[_/:\s-]+(.*)$/i;

export default function SearchBox({ initial }) {
  const { s } = useStore();
  const [text, setText] = useState(initial || '');
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(-1);
  const q = text.trim();

  const options = useMemo(() => {
    if (!q) return [];
    const cm = q.match(COLLAB);
    const projects = sel.allProjects(s), ideas = sel.allIdeas(s);
    if (cm) {
      const k = cm[1].toLowerCase();
      return [...projects, ...ideas].filter((e) => !k || e.title.toLowerCase().includes(k)).slice(0, 6).map((e) => ({ label: `Collaborators for ${e.title}`, hint: sel.collabPath(e), to: sel.collabPath(e) }));
    }
    const term = q.replace(/^#/, '').toLowerCase();
    const tags = new Map();
    [...projects, ...ideas].forEach((e) => (e.tags || []).forEach((t) => { const c = tags.get(t) || { p: 0, i: 0 }; if (e.pitch) c.i += 1; else c.p += 1; tags.set(t, c); }));
    const out = [...tags].filter(([t]) => t.toLowerCase().includes(term)).slice(0, 3).map(([t, c]) => ({ label: `#${t}`, hint: `${c.p} project${c.p === 1 ? '' : 's'} · ${c.i} idea${c.i === 1 ? '' : 's'}`, to: `/tag/${t}` }));
    const r = sel.search(s, q);
    r.projects.slice(0, 2).forEach((p) => out.push({ label: p.title, hint: 'Project', to: `/project/${p.id}` }));
    r.ideas.slice(0, 2).forEach((i) => out.push({ label: i.title, hint: 'Idea', to: `/idea/${i.id}` }));
    r.people.slice(0, 2).forEach((u) => out.push({ label: u.name, hint: `@${u.handle}`, to: `/u/${u.id}` }));
    out.push({ label: `Search for “${q}”`, hint: 'All results', to: `/search?q=${encodeURIComponent(q)}` });
    return out;
  }, [q, s]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (to) => { setOpen(false); setIdx(-1); navigate(to); };
  const submit = (e) => {
    e.preventDefault();
    if (!q) return;
    if (idx >= 0 && options[idx]) return go(options[idx].to);
    const cm = q.match(COLLAB);
    if (cm) { const t = sel.collabTarget(s, cm[1]); if (t) return go(sel.collabPath(t.entity)); }
    go(`/search?q=${encodeURIComponent(q)}`);
  };
  const key = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setIdx((i) => Math.min(options.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(-1, i - 1)); }
    else if (e.key === 'Escape') setOpen(false);
  };
  const show = open && options.length > 0;
  return (
    <form className="topbar__search" role="search" onSubmit={submit}>
      <Icon name="search" size={16} />
      <input type="search" role="combobox" aria-expanded={show} aria-controls="search-list" aria-activedescendant={idx >= 0 ? `so-${idx}` : undefined} aria-autocomplete="list"
        aria-label="Search people, projects, ideas, hashtags and communities. Type /collab_name to open a project's collaborators"
        placeholder="Search, #hashtag, or /collab_project" value={text} autoComplete="off"
        onChange={(e) => { setText(e.target.value); setOpen(true); setIdx(-1); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} onKeyDown={key} />
      {show && (
        <ul id="search-list" className="suggest glass" role="listbox">
          {options.map((o, i) => (
            <li key={o.label + o.to} id={`so-${i}`} role="option" aria-selected={i === idx} className={i === idx ? 'is-on' : ''} onMouseDown={(e) => { e.preventDefault(); go(o.to); }}>
              <strong>{o.label}</strong><span className="muted">{o.hint}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
