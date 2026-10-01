/* Tiny one-button games. Each game: make(w,h,calm) → state, step(g,dt), draw(ctx,g,accent), tap(g,x,y), key(g).
   Results: g.status = 'run' | 'won' | 'lost', g.hud = text, g.flawless on win. */
const rnd = (a, b) => a + Math.random() * (b - a);

const rr = (ctx, x, y, w, h, r) => {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
};
const sky = (ctx, g) => { const s = ctx.createLinearGradient(0, 0, 0, g.h); s.addColorStop(0, '#eaf2ff'); s.addColorStop(1, '#fff0f7'); ctx.fillStyle = s; ctx.fillRect(0, 0, g.w, g.h); };
const bar = (ctx, g, p, accent) => { ctx.fillStyle = 'rgba(30,50,100,0.12)'; rr(ctx, 12, 10, g.w - 24, 6, 3); ctx.fill(); ctx.fillStyle = accent; rr(ctx, 12, 10, Math.max(6, (g.w - 24) * p), 6, 3); ctx.fill(); };

/* 1. CLOUD HOP: dino-style hopper. Survive 20 seconds. */
const cloudhop = {
  id: 'cloudhop', title: 'Cloud Hop', emoji: '☁️', goal: 'Hop over the storms for 20 seconds', controls: 'Tap, click or press Space to hop', duration: 20,
  make: (w, h, calm) => ({ w, h, calm, ground: h - 38, y: h - 38, vy: 0, t: 0, spawn: 1.1, obs: [], bg: Array.from({ length: 5 }, (_, i) => ({ x: i * w / 4, y: 30 + (i % 3) * 22, s: rnd(0.6, 1.1) })), status: 'run', hud: '20s', flawless: true }),
  step(g, dt) {
    g.t += dt; g.spawn -= dt;
    const sp = (g.calm ? 190 : 250) + g.t * 5;
    g.vy += 1900 * dt; g.y = Math.min(g.ground, g.y + g.vy * dt); if (g.y >= g.ground) g.vy = 0;
    if (g.spawn <= 0) { g.obs.push({ x: g.w + 30, big: Math.random() < 0.3 }); g.spawn = rnd(1.0, 1.7) * (g.calm ? 1.25 : 1); }
    g.obs.forEach((o) => { o.x -= sp * dt; });
    g.obs = g.obs.filter((o) => o.x > -40);
    g.bg.forEach((c) => { c.x -= sp * 0.12 * dt; if (c.x < -80) c.x = g.w + 40; });
    if (g.obs.some((o) => Math.abs(o.x - 58) < 22 && g.y > g.ground - (o.big ? 34 : 26))) { g.status = 'lost'; }
    g.hud = `${Math.max(0, Math.ceil(this.duration - g.t))}s`;
    if (g.t >= this.duration) g.status = 'won';
  },
  draw(ctx, g, accent) {
    sky(ctx, g);
    g.bg.forEach((c) => { ctx.fillStyle = 'rgba(255,255,255,0.9)'; rr(ctx, c.x, c.y, 70 * c.s, 20 * c.s, 10); ctx.fill(); });
    ctx.fillStyle = 'rgba(30,50,100,0.1)'; ctx.fillRect(0, g.ground + 20, g.w, g.h);
    ctx.fillStyle = 'rgba(30,50,100,0.25)'; ctx.fillRect(0, g.ground + 20, g.w, 2);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    g.obs.forEach((o) => { ctx.font = `${o.big ? 34 : 26}px system-ui`; ctx.fillText(o.big ? '⛈️' : '⚡', o.x, g.ground + 2); });
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(58, g.y - 2, 15, 0, 7); ctx.arc(46, g.y + 3, 9, 0, 7); ctx.arc(70, g.y + 3, 9, 0, 7); ctx.fill(); ctx.restore();
    ctx.fillStyle = accent; ctx.font = '700 12px system-ui'; ctx.fillText('• •', 58, g.y - 3);
    bar(ctx, g, Math.min(1, g.t / this.duration), accent); ctx.textAlign = 'left';
  },
  tap(g) { if (g.y >= g.ground - 1) g.vy = -640; },
  key(g) { this.tap(g); },
};

/* 2. STAR CATCH: tap falling stars, ignore storm clouds. 10 stars to win, 3 mistakes lose. */
const orbpop = {
  id: 'orbpop', title: 'Star Catch', emoji: '⭐', goal: 'Catch 10 stars. Skip the storm clouds', controls: 'Tap a star. Keyboard: Space catches the lowest star', need: 10,
  make: (w, h, calm) => ({ w, h, calm, items: [], spawn: 0.5, caught: 0, miss: 0, pops: [], status: 'run', hud: '0/10', flawless: true }),
  step(g, dt) {
    g.spawn -= dt;
    if (g.spawn <= 0) { g.items.push({ x: rnd(36, g.w - 36), y: -20, v: rnd(70, 105) * (g.calm ? 0.75 : 1), storm: Math.random() < 0.22 }); g.spawn = rnd(0.55, 0.95) * (g.calm ? 1.3 : 1); }
    g.items.forEach((s) => { s.y += s.v * dt; });
    g.items = g.items.filter((s) => { if (s.y > g.h + 10) { if (!s.storm) { g.miss += 1; g.flawless = false; } return false; } return true; });
    g.pops.forEach((p) => { p.t += dt; }); g.pops = g.pops.filter((p) => p.t < 0.5);
    g.hud = `${g.caught}/${this.need} · ${'♥'.repeat(Math.max(0, 3 - g.miss))}`;
    if (g.caught >= this.need) g.status = 'won'; else if (g.miss >= 3) g.status = 'lost';
  },
  draw(ctx, g, accent) {
    sky(ctx, g); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    g.items.forEach((s) => { ctx.font = '30px system-ui'; ctx.fillText(s.storm ? '🌧️' : '⭐', s.x, s.y); });
    g.pops.forEach((p) => { ctx.globalAlpha = 1 - p.t * 2; ctx.fillStyle = p.bad ? '#d62c43' : accent; ctx.font = '700 15px system-ui'; ctx.fillText(p.bad ? 'Oops' : '+1', p.x, p.y - p.t * 40); ctx.globalAlpha = 1; });
    bar(ctx, g, g.caught / this.need, accent); ctx.textAlign = 'left';
  },
  tap(g, x, y) {
    const hit = g.items.filter((s) => Math.hypot(s.x - x, s.y - y) < 34).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
    if (!hit) return;
    g.items = g.items.filter((s) => s !== hit);
    if (hit.storm) { g.miss += 1; g.flawless = false; g.pops.push({ x: hit.x, y: hit.y, t: 0, bad: true }); } else { g.caught += 1; g.pops.push({ x: hit.x, y: hit.y, t: 0 }); }
  },
  key(g) { const low = g.items.filter((s) => !s.storm).sort((a, b) => b.y - a.y)[0]; if (low) this.tap(g, low.x, low.y); },
};

/* 3. PERFECT STOP: tap when the marker is in the glowing zone. 3 hits win, 3 misses lose. */
const stopper = {
  id: 'stopper', title: 'Perfect Stop', emoji: '🎯', goal: 'Stop the marker inside the glow 3 times', controls: 'Tap, click or press Space', need: 3,
  make: (w, h, calm) => ({ w, h, calm, x: 0, dir: 1, speed: calm ? 220 : 320, zone: { c: rnd(0.3, 0.7), r: 0.12 }, hits: 0, miss: 0, flash: 0, status: 'run', hud: '0/3', flawless: true }),
  step(g, dt) {
    const L = g.w - 60;
    g.x += g.dir * g.speed * dt;
    if (g.x > L) { g.x = L; g.dir = -1; } if (g.x < 0) { g.x = 0; g.dir = 1; }
    if (g.flash > 0) g.flash -= dt;
    g.hud = `${g.hits}/${this.need} · ${'♥'.repeat(Math.max(0, 3 - g.miss))}`;
    if (g.hits >= this.need) g.status = 'won'; else if (g.miss >= 3) g.status = 'lost';
  },
  draw(ctx, g, accent) {
    sky(ctx, g); const L = g.w - 60, y = g.h / 2 + 8;
    ctx.fillStyle = 'rgba(30,50,100,0.12)'; rr(ctx, 30, y - 12, L, 24, 12); ctx.fill();
    const zc = 30 + g.zone.c * L, zr = g.zone.r * L;
    ctx.save(); ctx.shadowColor = accent; ctx.shadowBlur = 16; ctx.fillStyle = accent; ctx.globalAlpha = 0.85; rr(ctx, zc - zr, y - 12, zr * 2, 24, 12); ctx.fill(); ctx.restore();
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3; ctx.fillStyle = g.flash > 0 ? (g.ok ? '#12a864' : '#d62c43') : '#fff'; ctx.beginPath(); ctx.arc(30 + g.x, y, 16, 0, 7); ctx.fill(); ctx.restore();
    bar(ctx, g, g.hits / this.need, accent);
  },
  tap(g) {
    const L = g.w - 60, d = Math.abs(30 + g.x - (30 + g.zone.c * L));
    g.ok = d <= g.zone.r * L; g.flash = 0.35;
    if (g.ok) { g.hits += 1; g.zone = { c: rnd(0.2, 0.8), r: Math.max(0.07, g.zone.r - 0.015) }; g.speed *= 1.12; } else { g.miss += 1; g.flawless = false; }
  },
  key(g) { this.tap(g); },
};

export const ARCADE = { cloudhop, orbpop, stopper };
export const ARCADE_LIST = [cloudhop, orbpop, stopper];
