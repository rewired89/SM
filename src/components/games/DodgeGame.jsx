import { useEffect, useMemo, useRef, useState } from 'react';
import { TactileButton, Badge } from '../ui/index.jsx';
import ResultScreen from './ResultScreen.jsx';
import { useLoop, reducedMotion, setupCanvas, rr, wrapText } from './useLoop.js';
import { useStore } from '../../store/StoreProvider.jsx';
import { dodgeBank } from '../../data/questions.js';

const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((x) => x[1]);

export default function DodgeGame({ game, onAgain }) {
  const { a } = useStore();
  const wrap = useRef(null), cv = useRef(null);
  const [phase, setPhase] = useState('intro');
  const [slow, setSlow] = useState(reducedMotion());
  const [paused, setPaused] = useState(false);
  const [banner, setBanner] = useState(null);
  const [log, setLog] = useState([]);
  const G = useRef(null);
  const deck = useMemo(() => shuffle(dodgeBank).slice(0, game.rounds), [game.rounds, phase === 'intro']); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    const w = Math.max(300, Math.min(660, wrap.current?.clientWidth || 640));
    const h = w < 460 ? 300 : 280;
    G.current = { w, h, lane: 1, y: h / 2, cards: [], spawnT: 1.2, spawned: 0, deck, log: [], t: 0, msgT: 0 };
    setLog([]); setBanner(null); setPhase('play');
  };
  useEffect(() => {
    if (phase !== 'play' || !cv.current) return;
    const g = G.current;
    setupCanvas(cv.current, g.w, g.h);
  }, [phase]);
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const key = (e) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) { e.preventDefault(); move(-1); }
      if (['ArrowDown', 's', 'S'].includes(e.key)) { e.preventDefault(); move(1); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  const move = (d) => { const g = G.current; if (g) g.lane = Math.max(0, Math.min(2, g.lane + d)); };
  const tap = (e) => {
    const g = G.current; const r = cv.current.getBoundingClientRect();
    const y = ((e.clientY - r.top) / r.height) * g.h;
    g.lane = Math.max(0, Math.min(2, Math.round((y - g.h * 0.2) / (g.h * 0.3))));
  };

  const resolve = (g, c, how) => {
    c.done = true;
    const it = c.item;
    const correct = it.truth ? how === 'hit' : how === 'pass';
    g.log.push({ qid: it.id, category: it.category, topic: it.topic, correct, takeaway: it.takeaway, text: it.text, truth: it.truth, how });
    const title = it.truth ? (how === 'hit' ? 'Collected: true' : 'Missed: that one was true') : (how === 'hit' ? 'Oops: that was a myth' : 'Dodged: that was a myth');
    setBanner({ ok: correct, title, text: it.explanation });
    g.msgT = 3.2;
  };

  useLoop((dt) => {
    const g = G.current; const c = cv.current; if (!g || !c || paused) return;
    const ctx = c.getContext('2d');
    const sp = (slow ? 85 : 135);
    const cardW = Math.min(210, g.w * 0.5), cardH = 62;
    const laneY = (i) => g.h * (0.2 + 0.3 * i);
    g.t += dt; g.spawnT -= dt;
    g.y += (laneY(g.lane) - g.y) * Math.min(1, dt * 14);
    if (g.msgT > 0) { g.msgT -= dt; if (g.msgT <= 0) setBanner(null); }
    if (g.spawned < g.deck.length && g.spawnT <= 0 && !g.cards.some((k) => k.x > g.w - cardW - 60)) {
      g.cards.push({ x: g.w + 10, lane: Math.floor(Math.random() * 3), item: g.deck[g.spawned], done: false });
      g.spawned += 1; g.spawnT = slow ? 3 : 2.2;
    }
    const px = 64, pr = 22;
    g.cards.forEach((k) => {
      k.x -= sp * dt;
      if (!k.done && k.lane === g.lane && k.x < px + pr && k.x + cardW > px - pr && Math.abs(g.y - laneY(k.lane)) < 24) resolve(g, k, 'hit');
      else if (!k.done && k.x + cardW < px - pr) resolve(g, k, 'pass');
    });
    g.cards = g.cards.filter((k) => k.x + cardW > -20);
    // draw
    const sky = ctx.createLinearGradient(0, 0, 0, g.h); sky.addColorStop(0, '#eaf2ff'); sky.addColorStop(1, '#fff0f7');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, g.w, g.h);
    ctx.strokeStyle = 'rgba(30,50,100,0.1)'; ctx.setLineDash([6, 8]); ctx.lineWidth = 1.5;
    [0, 1, 2].forEach((i) => { ctx.beginPath(); ctx.moveTo(0, laneY(i)); ctx.lineTo(g.w, laneY(i)); ctx.stroke(); });
    ctx.setLineDash([]);
    ctx.font = '600 14px Inter, system-ui, sans-serif'; ctx.textBaseline = 'middle';
    g.cards.forEach((k) => {
      const y = laneY(k.lane) - cardH / 2;
      ctx.save(); ctx.shadowColor = 'rgba(30,50,100,0.25)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
      ctx.fillStyle = k.done ? 'rgba(255,255,255,0.55)' : '#fff'; rr(ctx, k.x, y, cardW, cardH, 16); ctx.fill(); ctx.restore();
      ctx.fillStyle = k.done ? '#8b95ab' : '#131c33';
      const lines = wrapText(ctx, k.item.text, cardW - 24).slice(0, 3);
      lines.forEach((ln, i) => ctx.fillText(ln, k.x + 12, laneY(k.lane) + (i - (lines.length - 1) / 2) * 17));
    });
    // player
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5;
    const cs = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1f6fff';
    ctx.fillStyle = cs; ctx.beginPath(); ctx.arc(px, g.y, pr, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.font = '22px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText('🧠', px, g.y + 1); ctx.textAlign = 'left';
    if (g.spawned >= g.deck.length && g.cards.every((k) => k.done) && g.msgT <= 0) {
      const answers = g.log; const score = answers.filter((x) => x.correct).length;
      a.learn({ gameId: game.id, answers, score, total: answers.length });
      setLog(answers); setPhase('done');
    }
  }, phase === 'play' && !paused);

  if (phase === 'intro') return (
    <div className="stack game-intro">
      <span className="game-intro__emoji" aria-hidden="true">{game.emoji}</span><h2>{game.title}</h2>
      <p className="lead">{game.how}</p>
      <p className="muted">{game.rounds} cards · {game.time} · arrow keys, W/S, or tap a lane</p>
      <label className="row"><input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} /> <span>Calm mode (slower cards)</span></label>
      <div ref={wrap} style={{ width: '100%' }} />
      <TactileButton variant="primary" size="lg" onClick={start}>Start</TactileButton>
    </div>
  );
  if (phase === 'done') {
    const score = log.filter((x) => x.correct).length;
    return <ResultScreen game={game} score={score} total={log.length} onAgain={onAgain}
      lessons={[...new Set(log.map((x) => x.takeaway))].slice(0, 4)}
      extra={<ul className="stack stack--sm recap">{log.map((x) => <li key={x.qid} className={x.correct ? 'ok' : 'no'}><b>{x.correct ? '✓' : '✗'}</b> <span>“{x.text}” was {x.truth ? 'true' : 'a myth'}</span></li>)}</ul>} />;
  }
  return (
    <div className="stack" ref={wrap}>
      <div className="row row--between">
        <Badge tone="accent">Collect facts · dodge myths</Badge>
        <div className="row"><TactileButton size="sm" onClick={() => setPaused((p) => !p)}>{paused ? 'Resume' : 'Pause'}</TactileButton><TactileButton size="sm" variant="ghost" onClick={() => setSlow((x) => !x)} aria-pressed={slow}>{slow ? 'Calm on' : 'Calm off'}</TactileButton></div>
      </div>
      <canvas ref={cv} className="arena" role="img" aria-label="Game area: move between three lanes to collect true facts and dodge myths" onPointerDown={tap} />
      <div className="row"><TactileButton size="sm" onClick={() => move(-1)} aria-label="Move up">▲ Up</TactileButton><TactileButton size="sm" onClick={() => move(1)} aria-label="Move down">▼ Down</TactileButton></div>
      <div className={`feedback ${banner ? (banner.ok ? 'feedback--ok' : 'feedback--no') : 'feedback--idle'}`} role="status" aria-live="polite">
        {banner ? <><strong className="feedback__head">{banner.ok ? '✓' : '✗'} {banner.title}</strong><p>{banner.text}</p></> : <p className="muted">Each card gets a tiny explanation here.</p>}
      </div>
    </div>
  );
}
