import { useEffect, useRef, useState } from 'react';
import { GlassPanel, TactileButton } from '../ui/index.jsx';
import { useLoop, reducedMotion, setupCanvas } from './useLoop.js';
import { ARCADE } from '../../lib/arcade.js';
import { useStore } from '../../store/StoreProvider.jsx';
import { Link } from '../../lib/router.js';

const accentColor = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1f6fff';

export default function ArcadeCard({ id, large, offline }) {
  const def = ARCADE[id];
  const { s, a } = useStore();
  const wrap = useRef(null), cv = useRef(null), G = useRef(null), dims = useRef({ w: 320, h: 170 });
  const [phase, setPhase] = useState('idle');
  const [hud, setHud] = useState('');
  const [tries, setTries] = useState(0);
  const [reward, setReward] = useState(null);
  const [visible, setVisible] = useState(true);
  const calm = useRef(reducedMotion());

  const paint = () => { const g = G.current; if (g && cv.current) def.draw(cv.current.getContext('2d'), g, accentColor()); };
  useEffect(() => {
    const w = Math.max(280, Math.min(640, wrap.current.clientWidth || 320));
    dims.current = { w, h: large ? 260 : 170 };
    setupCanvas(cv.current, w, dims.current.h);
    G.current = def.make(w, dims.current.h, calm.current);
    paint();
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    G.current = def.make(dims.current.w, dims.current.h, calm.current);
    setHud(G.current.hud); setReward(null); setPhase('run'); setTries((t) => t + 1);
  };
  const finish = (g) => {
    const flawless = def.id === 'cloudhop' ? tries <= 1 : g.flawless;
    if (g.status === 'won') { const r = a.arcadeWin({ gameId: def.id, flawless, score: Math.round(g.t || g.caught || g.hits || 1) }); setReward(r); setPhase('won'); }
    else setPhase('lost');
  };

  useLoop((dt) => {
    const g = G.current; if (!g) return;
    def.step(g, dt); paint();
    if (g.hud !== hud) setHud(g.hud);
    if (g.status !== 'run') finish(g);
  }, phase === 'run' && visible);

  const pos = (e) => { const r = cv.current.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * dims.current.w, ((e.clientY - r.top) / r.height) * dims.current.h]; };
  const down = (e) => { if (phase === 'idle') return start(); if (phase === 'run') { const [x, y] = pos(e); def.tap(G.current, x, y); } };
  const keyd = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (phase === 'idle') start(); else if (phase === 'run') def.key(G.current); } };

  return (
    <GlassPanel className={`arcade ${large ? "arcade--large" : ""}`} aria-label={`${def.title} mini game`}>
      <div className="arcade__head">
        <div><span className="eyebrow">{offline ? '📡 No connection, but your brain still works' : 'Quick arcade · win to earn ✦ sparks'}</span><h3 className="card-title">{def.emoji} {def.title}</h3></div>
        {phase === 'run' && <strong className="arcade__hud" aria-live="off">{hud}</strong>}
      </div>
      <div className="arcade__stage" ref={wrap}>
        <canvas ref={cv} className="arena" tabIndex={0} role="application" aria-label={`${def.title}. ${def.goal}. ${def.controls}`} onPointerDown={down} onKeyDown={keyd} />
        {phase === 'idle' && <button type="button" className="arcade__overlay" onClick={start}><strong>Tap to play</strong><span>{def.goal}</span><small>{def.controls}</small></button>}
        {phase === 'lost' && <div className="arcade__overlay arcade__overlay--lost"><strong>So close!</strong><span>No penalty. Nothing to lose.</span><TactileButton variant="primary" size="sm" onClick={start}>Try again</TactileButton></div>}
        {phase === 'won' && reward && (
          <div className="arcade__overlay arcade__overlay--won">
            <span className="confetti" aria-hidden="true">🎉</span>
            <strong>{reward.gained > 0 ? `+${reward.gained} ✦ sparks` : 'You won!'}</strong>
            <small>{reward.parts.map(([n, v]) => `${n} +${v}`).join(' · ')}{reward.capped ? ' · daily spark limit reached, keep playing for fun' : ''}</small>
            <div className="row row--wrap" style={{ justifyContent: 'center' }}><TactileButton size="sm" variant="primary" onClick={start}>Play again</TactileButton><Link to="/rewards" className="btn btn--sm">Spend sparks</Link></div>
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
