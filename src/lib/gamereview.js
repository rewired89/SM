import { classify } from './conduct.js';

/* PROTOTYPE GAME REVIEWER: static checks plus a short smoke test. It decides fast and shows its reasons.
   A real build adds an AI model, a human playtester, and stronger isolation. 80 or more with no hard fails is approved. */
export const GAME_PASS = 80;
export const MAX_BYTES = 300 * 1024;

const FORBIDDEN = [
  [/\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts|new\s+Worker|SharedWorker|serviceWorker/i, 'Network access or workers (games run offline in a sandbox)'],
  [/\beval\s*\(|new\s+Function\s*\(|setTimeout\s*\(\s*['"`]|setInterval\s*\(\s*['"`]/i, 'Dynamic code execution (eval, new Function, string timers)'],
  [/document\.cookie|localStorage|sessionStorage|indexedDB|caches\./i, 'Reads or writes browser storage'],
  [/window\.top|top\.location|parent\.location|window\.parent(?!\.postMessage)|parent\.document|\bopener\b/i, 'Tries to reach outside its box'],
  [/location\s*(\.href|\.assign|\.replace)?\s*=|window\.open\s*\(|\.submit\s*\(/i, 'Navigates away or opens windows'],
  [/<\s*(iframe|object|embed|form|base)\b|<link\b[^>]*rel\s*=\s*["']?(stylesheet|preload|prefetch)|<meta\b[^>]*http-equiv\s*=\s*["']?refresh/i, 'Embeds other content, forms or redirects'],
  [/<script[^>]+src\s*=|@import|(?:src|href)\s*=\s*["']\s*(?:https?:)?\/\//i, 'Loads external files (everything must be inside the one file)'],
  [/url\(\s*["']?\s*(?:https?:)?\/\//i, 'Loads external images or fonts'],
  [/coinhive|cryptonight|miner\.start|stratum\+/i, 'Looks like a crypto miner'],
  [/loot\s*box|gacha|casino|slot machine|place (?:a )?bet|real money|buy (?:coins|gems|lives)|in-?app purchase|watch (?:an? )?ad\b|jackpot|spin (?:the )?wheel to win/i, 'Gambling or manipulative monetization'],
];

const has = (re, t) => re.test(t);
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');

export async function sha(str) {
  try { const b = new TextEncoder().encode(str); const d = await crypto.subtle.digest('SHA-256', b); return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('').slice(0, 24); } catch { return String(str.length); }
}

export function analyzeGame({ html, meta, smoke, duplicate }) {
  const hard = [];
  const size = new Blob([html]).size;
  if (size > MAX_BYTES) hard.push(`The file is ${(size / 1024).toFixed(0)} KB. The limit is ${MAX_BYTES / 1024} KB for a tiny game.`);
  FORBIDDEN.forEach(([re, why]) => { if (has(re, html)) hard.push(why); });
  const c = classify(`${meta.title} ${meta.description} ${meta.how} ${meta.purpose} ${text(html)}`);
  if (c.level >= 2) hard.push('The text contains abusive or threatening language');
  if (smoke) {
    if (smoke.instantWin) hard.push('The game reports a win almost instantly. A player must be able to lose.');
    if (smoke.errors.length) hard.push(`The game threw an error on load: ${smoke.errors[0].slice(0, 120)}`);
  }

  const checks = [];
  const add = (id, label, max, pts, notes) => checks.push({ id, label, max, pts: Math.max(0, Math.min(max, pts)), notes });

  // 1 works
  if (!smoke) add('works', 'Starts and runs', 25, 0, ['Smoke test did not run']);
  else add('works', 'Starts and runs', 25, smoke.ready && !smoke.errors.length ? 25 : smoke.ready ? 10 : 0, [smoke.ready ? `Reported ready after ${smoke.readyMs} ms` : 'Never called NOMI.ready() within 4 seconds', smoke.errors.length ? 'It logged errors' : 'No errors']);
  // 2 reports result
  const win = has(/NOMI\s*\.\s*win\s*\(/, html), lose = has(/NOMI\s*\.\s*lose\s*\(/, html);
  add('result', 'Reports win and lose', 15, (win ? 10 : 0) + (lose ? 5 : 0), [win ? 'Calls NOMI.win()' : 'Never calls NOMI.win(), so players cannot earn anything', lose ? 'Calls NOMI.lose()' : 'Never calls NOMI.lose()']);
  // 3 tiny and clear
  let p = 0; const n = [];
  if ((meta.title || '').trim().length >= 3) p += 3; else n.push('Add a title');
  if ((meta.description || '').trim().length >= 40) p += 4; else n.push('Description needs 40+ characters');
  if ((meta.how || '').trim().length >= 30) p += 4; else n.push('How to play needs 30+ characters');
  if (Number(meta.duration) > 0 && Number(meta.duration) <= 90) p += 4; else n.push('A tiny game takes 90 seconds or less');
  add('clear', 'Tiny and clear', 15, p, n.length ? n : ['Title, description, how to play and length are set']);
  // 4 purpose
  add('purpose', 'Has a purpose', 10, (meta.purpose || '').trim().length >= 40 ? 10 : (meta.purpose || '').trim().length >= 15 ? 5 : 0, [(meta.purpose || '').trim().length >= 40 ? 'Says what a player takes away' : 'Explain what a player learns, feels or practices (40+ characters)']);
  // 5 accessible
  const kb = has(/keydown|keyup|keypress/, html), ptr = has(/pointerdown|pointerup|touchstart|mousedown|onclick|addEventListener\(\s*['"]click|<button/i, html), rm = has(/prefers-reduced-motion/, html);
  add('access', 'Keyboard, touch and calm motion', 15, (kb ? 5 : 0) + (ptr ? 5 : 0) + (rm ? 5 : 0), [kb ? 'Keyboard controls' : 'No keyboard controls', ptr ? 'Touch or pointer controls' : 'No touch controls', rm ? 'Respects reduced motion' : 'Does not mention reduced motion']);
  // 6 fair play
  add('fair', 'Fair play', 10, hard.some((h) => /Gambling|abusive/.test(h)) ? 0 : 10, ['No gambling or manipulative monetization found']);
  // 7 originality and size
  add('orig', 'Original and light', 10, (duplicate ? 0 : 6) + (size < 100 * 1024 ? 4 : size < 200 * 1024 ? 2 : 0), [duplicate ? 'Identical to an existing game' : 'Not a duplicate', `${(size / 1024).toFixed(0)} KB`]);

  const score = Math.round(checks.reduce((a, x) => a + x.pts, 0));
  const verdict = hard.length ? 'needs_changes' : score >= GAME_PASS ? 'approved' : score >= 60 ? 'human_review' : 'needs_changes';
  return { score, hard, checks, verdict, size };
}

/* Everything a creator needs to start: the SDK contract in a working file */
export const STARTER = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>My Tiny Game</title>
<style>html,body{margin:0;height:100%;font-family:system-ui,sans-serif;display:grid;place-content:center;text-align:center;background:#eef2ff}
button{font:inherit;font-weight:800;padding:14px 26px;border-radius:99px;border:0;background:#4a6cf7;color:#fff;cursor:pointer}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style></head>
<body><p id="t">Tap the button 10 times in 15 seconds.</p><button id="b">Tap! (0)</button>
<script>
// Your game talks to Nomi with three calls: NOMI.ready(), NOMI.win(score), NOMI.lose().
var n = 0, left = 15, done = false, b = document.getElementById('b'), t = document.getElementById('t');
function end(win) { if (done) return; done = true; t.textContent = win ? 'You did it!' : 'Time is up, try again.'; win ? NOMI.win(n) : NOMI.lose(); }
b.addEventListener('click', function () { if (done) return; n++; b.textContent = 'Tap! (' + n + ')'; if (n >= 10) end(true); });
document.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); b.click(); } });
var timer = setInterval(function () { if (done) return clearInterval(timer); left--; t.textContent = left + ' seconds left'; if (left <= 0) end(false); }, 1000);
NOMI.ready();
</script></body></html>
`;
