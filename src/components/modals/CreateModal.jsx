import { useEffect, useState } from 'react';
import { Modal, TactileButton, Icon } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { useUI } from '../../store/UIProvider.jsx';
import { navigate } from '../../lib/router.js';
import * as sel from '../../store/selectors.js';
import { topTags } from '../../data/communities.js';
import { toolCategories } from '../../data/tools.js';
import MediaPicker from '../media/MediaPicker.jsx';

const KINDS = [
  { id: 'post', icon: 'spark', label: 'Post', hint: 'Share a thought or progress' },
  { id: 'idea', icon: 'bulb', label: 'Idea', hint: 'Float a "what if"' },
  { id: 'project', icon: 'tool', label: 'Project', hint: 'Show what you are building' },
  { id: 'tool', icon: 'bot', label: 'AI Tool', hint: 'Publish a tool or agent' },
  { id: 'research', icon: 'flask', label: 'Research', hint: 'Share a preprint or notes' },
  { id: 'community', icon: 'users', label: 'Community', hint: 'Start a space for an interest' },
  { id: 'question', icon: 'help', label: 'Question', hint: 'Ask people who know' },
  { id: 'challenge', icon: 'trophy', label: 'Challenge', hint: 'Make a 30-second question' },
];
const CATS = ['Science', 'Technology', 'Creative', 'AI'];

const FORMS = {
  post: { title: 'New post', main: ['text', 'What are you working on?'] },
  question: { title: 'Ask a question', main: ['text', 'What do you want to know?'] },
  research: { title: 'Share research', title1: 'Title', main: ['text', 'Summarise the finding or question'] },
  idea: { title: 'New idea', title1: 'Idea title', main: ['text', 'What if we built...'], cat: true, needs: 'Who would you like to find? (comma separated)' },
  project: { title: 'New project', title1: 'Project name', sub: 'One-line tagline', main: ['text', 'What is it about?'], cat: true, needs: 'What does it need? (comma separated)' },
  tool: { title: 'Publish an AI tool', title1: 'Tool name', main: ['text', 'What does it do?'], toolCat: true },
  update: { title: 'Post a project update', main: ['text', 'What did you ship or learn?'] },
  community: { title: 'Start a community', title1: 'Community name', main: ['text', 'What is it about?'] },
};

function Composer({ kind, onBack, projectId }) {
  const { s, a } = useStore();
  const { closeModal } = useUI();
  const f = FORMS[kind];
  const [v, setV] = useState({ title: '', sub: '', text: '', cat: 'Science', tcat: toolCategories[0], needs: '', kindSel: 'Preprint', prev: '', curr: '', changed: '' });
  const [tags, setTags] = useState([]);
  const [items, setItems] = useState([]);
  const [links, setLinks] = useState([]);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const needs = v.needs.split(',').map((x) => x.trim()).filter(Boolean);
  const mediaOk = ['post', 'question', 'research'].includes(kind) && (items.length || links.length);
  const valid = (v.text.trim() || mediaOk) && (!f.title1 || v.title.trim());
  const withMedia = ['post', 'question', 'research', 'idea', 'project', 'update'].includes(kind);
  const submit = async (e) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    try {
      if (['post', 'question'].includes(kind)) await a.publishPost({ type: kind, text: v.text.trim(), tags, items, links });
      else if (kind === 'research') await a.publishPost({ type: 'research', text: v.text.trim(), tags, items, links, extra: { title: v.title.trim(), kind: v.kindSel } });
      else if (kind === 'update') {
        const proj = sel.projectById(s, projectId);
        const day = Math.max(0, ...sel.allPosts(s).filter((x) => x.type === 'update' && x.ref?.id === projectId).map((x) => x.extra?.day || 0)) + 1;
        await a.publishPost({ type: 'update', text: v.text.trim(), tags: proj.tags, items, links, ref: { type: 'project', id: projectId }, extra: { day, prev: v.prev.trim() || 'Before', curr: v.curr.trim() || 'Now', changed: v.changed.trim() || 'See details' } });
      } else {
        const id = await a.createEntity(kind, { title: v.title.trim(), tagline: v.sub.trim() || v.text.trim().slice(0, 80), pitch: v.text.trim(), about: v.text.trim(), category: kind === 'tool' ? v.tcat : v.cat, needs, tags, items, links });
        closeModal();
        navigate(`/${{ project: 'project', idea: 'idea', tool: 'ai', community: 'community' }[kind]}/${id}`);
        return;
      }
      closeModal();
      navigate(kind === 'update' ? `/project/${projectId}` : '/');
    } finally { setBusy(false); }
  };
  return (
    <form className="stack" onSubmit={submit}>
      {f.title1 && <div className="field"><label htmlFor="c-title">{f.title1}</label><input id="c-title" className="input" value={v.title} onChange={set('title')} maxLength={80} /></div>}
      {f.sub && <div className="field"><label htmlFor="c-sub">{f.sub}</label><input id="c-sub" className="input" value={v.sub} onChange={set('sub')} maxLength={100} /></div>}
      <div className="field"><label htmlFor="c-text">{kind === 'post' || kind === 'question' ? 'Message' : 'Description'}</label><textarea id="c-text" className="textarea" placeholder={f.main[1]} value={v.text} onChange={set('text')} maxLength={600} /></div>
      {kind === 'update' && (
        <div className="grid grid--2">
          <div className="field"><label htmlFor="u-prev">Previous</label><input id="u-prev" className="input" placeholder="73% stability" value={v.prev} onChange={set('prev')} /></div>
          <div className="field"><label htmlFor="u-curr">Current</label><input id="u-curr" className="input" placeholder="91% stability" value={v.curr} onChange={set('curr')} /></div>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label htmlFor="u-ch">What changed</label><input id="u-ch" className="input" placeholder="ECC + replica repair" value={v.changed} onChange={set('changed')} /></div>
        </div>
      )}
      {f.cat && <div className="field"><label htmlFor="c-cat">Category</label><select id="c-cat" className="select" value={v.cat} onChange={set('cat')}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div>}
      {f.toolCat && <div className="field"><label htmlFor="c-tcat">Category</label><select id="c-tcat" className="select" value={v.tcat} onChange={set('tcat')}>{toolCategories.map((c) => <option key={c}>{c}</option>)}</select></div>}
      {kind === 'research' && <div className="field"><label htmlFor="c-k">Type</label><select id="c-k" className="select" value={v.kindSel} onChange={set('kindSel')}>{['Preprint', 'Draft', 'Notes', 'Dataset'].map((c) => <option key={c}>{c}</option>)}</select></div>}
      {f.needs && <div className="field"><label htmlFor="c-needs">Looking for</label><input id="c-needs" className="input" placeholder={f.needs} value={v.needs} onChange={set('needs')} /></div>}
      {withMedia && <div className="field"><span className="label">Photos, videos, pitch deck and links</span><MediaPicker items={items} setItems={setItems} links={links} setLinks={setLinks} deck={kind === 'project' || kind === 'idea'} /></div>}
      {kind !== 'update' && <div className="field"><span className="label">Tags</span>
        <div className="chips">{topTags.map((t) => <button type="button" key={t} className="chip" aria-pressed={tags.includes(t)} onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>#{t}</button>)}</div>
      </div>}
      <div className="row row--between">
        <TactileButton variant="ghost" onClick={onBack} icon="back">Back</TactileButton>
        <TactileButton type="submit" variant="primary" disabled={!valid || busy}>{busy ? 'Publishing...' : 'Publish'}</TactileButton>
      </div>
    </form>
  );
}

const CH_CATS = [['cybersecurity', 'Cybersecurity'], ['critical', 'Critical thinking'], ['science', 'Science'], ['ai', 'AI'], ['communication', 'Communication'], ['logic', 'Logic']];

function ChallengeComposer({ onBack }) {
  const { s, a } = useStore();
  const { closeModal } = useUI();
  const [v, setV] = useState({ question: '', category: 'science', difficulty: 2, choices: ['', '', '', ''], correct: 0, explanation: '', source: '', communityId: '' });
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const setChoice = (i) => (e) => setV({ ...v, choices: v.choices.map((c, j) => (j === i ? e.target.value : c)) });
  const filled = v.choices.map((c) => c.trim());
  const valid = v.question.trim() && filled.filter(Boolean).length >= 2 && filled[v.correct] && v.explanation.trim();
  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    const idx = filled.map((c, i) => [c, i]).filter(([c]) => c);
    const id = a.createChallenge({ question: v.question.trim(), category: v.category, difficulty: Number(v.difficulty), choices: idx.map(([c]) => c), correctAnswer: idx.findIndex(([, i]) => i === Number(v.correct)), explanation: v.explanation.trim(), source: v.source.trim() || 'No source provided by the creator', communityId: v.communityId || null });
    closeModal();
    navigate(`/play/${id}`);
  };
  return (
    <form className="stack" onSubmit={submit}>
      <div className="field"><label htmlFor="q-q">Question</label><textarea id="q-q" className="textarea" value={v.question} onChange={set('question')} maxLength={240} /></div>
      <div className="grid grid--2">
        <div className="field"><label htmlFor="q-c">Category</label><select id="q-c" className="select" value={v.category} onChange={set('category')}>{CH_CATS.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select></div>
        <div className="field"><label htmlFor="q-d">Difficulty</label><select id="q-d" className="select" value={v.difficulty} onChange={set('difficulty')}>{[1, 2, 3, 4, 5].map((d) => <option key={d}>{d}</option>)}</select></div>
      </div>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}><legend className="label">Answers (pick the correct one)</legend>
        {v.choices.map((c, i) => (
          <div key={i} className="row" style={{ marginTop: 6 }}>
            <input type="radio" name="correct" checked={Number(v.correct) === i} onChange={() => setV({ ...v, correct: i })} aria-label={`Answer ${i + 1} is correct`} />
            <input className="input" value={c} onChange={setChoice(i)} placeholder={`Answer ${i + 1}`} aria-label={`Answer ${i + 1}`} />
          </div>
        ))}
      </fieldset>
      <div className="field"><label htmlFor="q-e">Explanation</label><textarea id="q-e" className="textarea" value={v.explanation} onChange={set('explanation')} maxLength={400} /></div>
      <div className="field"><label htmlFor="q-s">Source / reference</label><input id="q-s" className="input" value={v.source} onChange={set('source')} placeholder="Where can people verify this?" /></div>
      <div className="field"><label htmlFor="q-m">Community (optional)</label><select id="q-m" className="select" value={v.communityId} onChange={set('communityId')}><option value="">None</option>{sel.allCommunities(s).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="row row--between"><TactileButton variant="ghost" onClick={onBack} icon="back">Back</TactileButton><TactileButton type="submit" variant="primary" disabled={!valid}>Publish challenge</TactileButton></div>
    </form>
  );
}

export default function CreateModal({ start, projectId }) {
  const { closeModal } = useUI();
  const [kind, setKindRaw] = useState(start === 'project' ? null : start || null);
  const setKind = (k) => { if (k === 'project') { closeModal(); navigate('/apply'); return; } setKindRaw(k); };
  useEffect(() => { if (start === 'project') { closeModal(); navigate('/apply'); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Modal title={kind ? (kind === 'challenge' ? 'New challenge' : FORMS[kind].title) : 'Create'} onClose={closeModal} label="Create">
      {!kind ? (
        <ul className="create-grid">
          {KINDS.map((k) => (
            <li key={k.id}><button type="button" className="tile tile--interactive create-opt" onClick={() => setKind(k.id)}>
              <Icon name={k.icon} size={22} /><strong>{k.label}</strong><span className="muted">{k.hint}</span>
            </button></li>
          ))}
        </ul>
      ) : kind === 'challenge' ? <ChallengeComposer onBack={() => setKind(null)} /> : <Composer kind={kind} projectId={projectId} onBack={() => (start === 'update' ? closeModal() : setKind(null))} />}
    </Modal>
  );
}
