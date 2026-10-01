import { useMemo, useState } from 'react';
import { TactileButton, Badge } from '../ui/index.jsx';
import Prompt from './prompts.jsx';
import ResultScreen from './ResultScreen.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { pickNext, startLevel } from '../../lib/learn.js';

const MAYBE = /not enough|cannot tell/i;
const STYLED = ['phish', 'fallacy', 'human', 'science', 'aihuman', 'logic', 'money', 'history'];

function Why({ q }) {
  return (
    <details className="why-this">
      <summary>Why this answer?</summary>
      <p><strong>Source:</strong> {q.source}{q.sourceType === 'community' ? ' (community-submitted, not reviewed by Nomi)' : ''}</p>
      {q.uncertain && <p className="muted">This topic is genuinely debated, so an honest "it depends" is part of the answer.</p>}
      <p className="muted">Skill practiced: {q.skill}</p>
    </details>
  );
}

export default function QuizGame({ game, bank, rounds, daily, single, onAgain }) {
  const { s, a } = useStore();
  const cat = bank[0].category;
  const [phase, setPhase] = useState(single ? 'play' : 'intro');
  const [level, setLevel] = useState(() => startLevel(s.learn, cat));
  const [used, setUsed] = useState([]);
  const [q, setQ] = useState(() => (single ? bank[0] : null));
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);
  const total = single ? 1 : Math.min(rounds, bank.length);

  const begin = () => { const first = pickNext(bank, [], level, s.learn.seen); setQ(first); setUsed([first.id]); setPhase('play'); };
  const choose = (i) => {
    if (picked !== null) return;
    const correct = i === q.correctAnswer;
    setPicked(i);
    setAnswers((x) => [...x, { qid: q.id, category: q.category, topic: q.topic, correct, takeaway: q.takeaway, maybe: MAYBE.test(q.choices[q.correctAnswer]) }]);
    setPhase('feedback');
  };
  const next = () => {
    const last = answers[answers.length - 1];
    if (answers.length >= total) {
      const score = answers.filter((x) => x.correct).length;
      a.learn({ gameId: game.id, answers, score, total, daily });
      setPhase('done');
      return;
    }
    const lv = last.correct ? Math.min(5, level + 1) : Math.max(1, level - 1);
    setLevel(lv);
    const n = pickNext(bank, used, lv, s.learn.seen);
    setQ(n); setUsed((u) => [...u, n.id]); setPicked(null); setPhase('play');
  };

  const score = answers.filter((x) => x.correct).length;
  const lessons = useMemo(() => [...new Set(answers.map((x) => x.takeaway))].slice(0, 4), [answers]);

  if (phase === 'intro') {
    return (
      <div className="stack game-intro">
        <span className="game-intro__emoji" aria-hidden="true">{game.emoji}</span>
        <h2>{game.title}</h2>
        <p className="lead">{game.how}</p>
        <p className="muted">{total} quick rounds · {game.time} · gets harder only if you do well</p>
        <TactileButton variant="primary" size="lg" onClick={begin}>Start</TactileButton>
      </div>
    );
  }
  if (phase === 'done') return <ResultScreen game={game} score={score} total={total} lessons={lessons} daily={daily} onAgain={onAgain} />;
  const fb = phase === 'feedback';
  const ok = fb && picked === q.correctAnswer;
  const dots = Array.from({ length: total }, (_, i) => (i < answers.length ? (answers[i].correct ? 'ok' : 'no') : i === answers.length ? 'now' : ''));
  return (
    <div className="stack quiz" aria-live="polite">
      <div className="row row--between">
        <ol className="dots" aria-label={`Round ${Math.min(answers.length + (fb ? 0 : 1), total)} of ${total}`}>{dots.map((d, i) => <li key={i} className={d} />)}</ol>
        {!single && <Badge tone="accent">Level {level}</Badge>}
      </div>
      <div key={q.id} className="slide-in"><Prompt game={STYLED.includes(game.id) ? game.id : 'plain'} q={q} /></div>
      <div className={`choices ${q.choices.length === 3 ? 'choices--3' : ''}`} role="group" aria-label="Answers">
        {q.choices.map((c, i) => {
          const state = !fb ? '' : i === q.correctAnswer ? 'is-right' : i === picked ? 'is-wrong' : 'is-dim';
          return <button key={c} type="button" className={`choice ${state}`} disabled={fb} onClick={() => choose(i)}><span>{c}</span>{fb && i === q.correctAnswer && <b aria-label="Correct">✓</b>}{fb && i === picked && i !== q.correctAnswer && <b aria-label="Not quite">✗</b>}</button>;
        })}
      </div>
      {fb && (
        <div className={`feedback ${ok ? 'feedback--ok' : 'feedback--no'}`} role="status">
          <strong className="feedback__head">{ok ? '✓' : '✗'} {(q.headline || q.choices[q.correctAnswer]).toUpperCase()}</strong>
          {q.optionNotes && <p className="secondary"><em>Your choice:</em> {q.optionNotes[picked]}</p>}
          <p>{q.explanation}</p>
          <p className="remember"><span className="eyebrow">Remember</span>{q.takeaway}</p>
          <Why q={q} />
          <TactileButton variant="primary" onClick={next} autoFocus>{answers.length >= total ? 'See results' : 'Next'}</TactileButton>
        </div>
      )}
    </div>
  );
}
