import { useEffect, useRef, useState } from 'react';
import { TactileButton, Badge } from '../ui/index.jsx';
import ResultScreen from './ResultScreen.jsx';
import { useLoop, reducedMotion, setupCanvas, rr } from './useLoop.js';
import { useStore } from '../../store/StoreProvider.jsx';
import { runnerItems } from '../../data/questions.js';

export default function RunnerGame({ game, onAgain, offline }) {
  const { a } = useStore();
  const wrap = useRef(null), cv = useRef(null);
  const [phase, setPhase] = useState('intro');
  const [slow, setSlow] = useState(reducedMotion());
  const [paused, setPaused] = useState(false);
  const [res, setRes] = useState(null);
  const [hud, setHud] = useState({ good: 0, bad: 0 });
  const G = useRef(null);

  const start = () => {
    const w = Math.max(300, Math.min(660, wrap.current?.clientWidth || 640));
    const h = 240;
    const deck = Array.from({ length: game.rounds }, (_, i) => runnerItems[(i + Math.floor(Math.random() * 6)) % 6]);
    G.current = { w, h, ground: h - 40, y: h - 40, vy: 0, deck, items: [], spawnT: 1, spawned: 0, log: [], t: 0, tick: 0 };
    setHud({ good: 0, bad: 0 }); setPhase('play');
  };
  useEffect(() => { if (phase === 'play' && cv.current) setupCanvas(cv.current, G.current.w, G.current.h); }, [phase]);
  const jump = () => { const g = G.current; if (g && g.y >= g.ground - 1) g.vy = -560; };
  useEffect(() => {
    if (phase !== 'play') return undefined;
    const key = (e) => { if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key)) { e.preventDefault(); jump(); } };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [phase]);

  useLoop((dt) => {
    const g = G.current; const c = cv.current; if (!g || !c) return;
    const ctx = c.getContext('2d');
    const sp = slow ? 150 : 230;
    g.t += dt; g.spawnT -= dt; g.tick += dt;
    g.vy += 1500 * dt; g.y = Math.min(g.ground, g.y + g.vy * dt); if (g.y >= g.ground) g.vy = 0;
    if (g.spawned < g.deck.length && g.spawnT <= 0) {
      const it = g.deck[g.spawned];
      g.items.push({ x: g.w + 20, it, done: false, y: it.good ? g.ground - 95 : g.ground });
      g.spawned += 1; g.spawnT = slow ? 2.4 : 1.7;
    }
    const px = 70, pr = 17;
    g.items.forEach((k) => {
      k.x -= sp * dt;
      if (k.done) return;
      const hit = Math.abs(k.x - px) < pr + 15 && Math.abs(k.y - g.y) < pr + 18;
      if (hit) { k.done = true; k.how = 'hit'; }
      else if (k.x < px - 40) { k.done = true; k.how = 'pass'; }
      if (k.done) {
        const good = k.it.good;
        const correct = good ? k.how === 'hit' : k.how === 'pass';
        g.log.push({ qid: k.it.id, category: 'cybersecurity', topic: k.it.topic, correct, takeaway: k.it.learn, it: k.it, how: k.how, collected: good && k.how === 'hit', avoided: !good && k.how === 'pass' });
        k.flash = 0.9; k.ok = correct;
        setHud({ good: g.log.filter((x) => x.collected).length, bad: g.log.filter((x) => x.avoided).length });
      }
      if (k.flash > 0) k.flash -= dt;
    });
    g.items = g.items.filter((k) => k.x > -60);
    // draw
    const sky = ctx.createLinearGradient(0, 0, 0, g.h); sky.addColorStop(0, '#eaf2ff'); sky.addColorStop(1, '#fff0f7');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, g.w, g.h);
    ctx.fillStyle = 'rgba(30,50,100,0.08)'; ctx.fillRect(0, g.ground + 22, g.w, g.h);
    ctx.strokeStyle = 'rgba(30,50,100,0.15)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, g.ground + 22); ctx.lineTo(g.w, g.ground + 22); ctx.stroke();
    for (let i = 0; i < 8; i += 1) { const x = ((i * 120 - g.t * sp * 0.35) % (g.w + 120) + g.w + 120) % (g.w + 120) - 60; ctx.fillStyle = 'rgba(255,255,255,0.8)'; rr(ctx, x, 30 + (i % 3) * 30, 70, 20, 10); ctx.fill(); }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    g.items.forEach((k) => {
      ctx.save(); ctx.globalAlpha = k.done ? 0.35 : 1; ctx.font = '30px system-ui'; ctx.fillText(k.it.emoji, k.x, k.y);
      ctx.restore();
      if (k.flash > 0) { ctx.font = '700 13px Inter, system-ui, sans-serif'; ctx.fillStyle = k.ok ? '#12844c' : '#d62c43'; ctx.fillText(`${k.ok ? '+' : '!'} ${k.it.name}`, Math.max(70, Math.min(g.w - 70, k.x)), k.y - 34); }
    });
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1f6fff';
    ctx.beginPath(); ctx.arc(px, g.y, pr, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.font = '18px system-ui'; ctx.fillStyle = '#fff'; ctx.fillText('😎', px, g.y + 1); ctx.textAlign = 'left';
    if (g.spawned >= g.deck.length && g.items.every((k) => k.done)) {
      const log = g.log;
      const collected = log.filter((x) => x.collected).length, avoided = log.filter((x) => x.avoided).length;
      const score = log.filter((x) => x.correct).length;
      a.learn({ gameId: game.id, answers: log, score, total: log.length, protections: collected });
      setRes({ log, collected, avoided, score }); setPhase('done');
    }
  }, phase === 'play' && !paused);

  if (phase === 'intro') return (
    <div className="stack game-intro">
      {offline && <div className="banner"><strong>NO CONNECTION</strong><span>But your brain still works.</span></div>}
      <span className="game-intro__emoji" aria-hidden="true">{game.emoji}</span><h2>{game.title}</h2>
      <p className="lead">{game.how}</p>
      <p className="muted">{game.time} · Space, ArrowUp, W or tap to jump</p>
      <label className="row"><input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} /> <span>Calm mode (slower)</span></label>
      <div ref={wrap} style={{ width: '100%' }} />
      <TactileButton variant="primary" size="lg" onClick={start}>Start</TactileButton>
    </div>
  );
  if (phase === 'done') {
    const risks = res.log.filter((x) => !x.it.good).length;
    return <ResultScreen game={game} score={res.score} total={res.log.length} onAgain={onAgain}
      lessons={[...new Set(res.log.map((x) => x.takeaway))].slice(0, 4)}
      extra={<div className="stack stack--sm"><span className="eyebrow">Your privacy score</span><p>You avoided <strong>{res.avoided}</strong> of {risks} risks and collected <strong>{res.collected}</strong> security protections.</p></div>} />;
  }
  return (
    <div className="stack" ref={wrap}>
      <div className="row row--between">
        <div className="row"><Badge tone="success">🛡 {hud.good} protections</Badge><Badge tone="accent">🚫 {hud.bad} risks avoided</Badge></div>
        <div className="row"><TactileButton size="sm" onClick={() => setPaused((p) => !p)}>{paused ? 'Resume' : 'Pause'}</TactileButton></div>
      </div>
      <canvas ref={cv} className="arena" role="img" aria-label="Game area: jump to collect protections in the air and jump over risks on the ground" onPointerDown={jump} />
      <TactileButton onClick={jump} className="btn--block" aria-label="Jump">⬆ Jump</TactileButton>
      <p className="muted">Grab 🔑 🛡️ 🔒 floating up high. Jump over 👁️ 📍 🎣 on the ground.</p>
    </div>
  );
}
