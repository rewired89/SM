import { useEffect, useMemo, useRef, useState } from 'react';
import { asset, getBlob } from '../../lib/media.js';

/* Runs a user-made game in a sandboxed iframe: scripts allowed, no same-origin, no network, no popups. */
const CSP = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; media-src data: blob:; font-src data:">`;
const SDK = `<script>(function(){function p(m){m.nomi=true;parent.postMessage(m,'*')}var pend={};window.addEventListener('message',function(e){var d=e.data;if(d&&d.nomi&&d.type==='answer'&&pend[d.id]){pend[d.id](d.result);delete pend[d.id]}});window.NOMI={ask:function(q){return new Promise(function(r){var id=String(Math.random()).slice(2);pend[id]=r;p({type:'ask',id:id,prompt:String(q).slice(0,2000)})})},ready:function(){p({type:'ready'})},win:function(s){p({type:'win',score:+s||0})},lose:function(){p({type:'lose'})}};window.addEventListener('error',function(e){p({type:'error',message:String(e.message)})})})();</script>`;
const FRAME_CSS = '<style>html,body{margin:0}</style>';

export function buildSrcdoc(html) {
  const inject = CSP + FRAME_CSS + SDK;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => m + inject);
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, (m) => `${m}<head>${inject}</head>`);
  return `<!doctype html><html><head>${inject}</head><body>${html}</body></html>`;
}

export async function loadGameHtml(game) {
  if (game.src) return (await fetch(asset(game.src))).text();
  const blob = await getBlob(game.fileId);
  return blob ? blob.text() : null;
}

/* onEvent receives {type:'ready'|'win'|'lose'|'error', ...}. Wins in the first 5 seconds are ignored. */
export default function CommunityGame({ game, html: htmlProp, onEvent, onAsk, height = 420, hidden }) {
  const [html, setHtml] = useState(htmlProp ?? null);
  const [missing, setMissing] = useState(false);
  const frame = useRef(null);
  const readyAt = useRef(0);
  const asks = useRef([]);
  useEffect(() => {
    if (htmlProp != null) { setHtml(htmlProp); return undefined; }
    let alive = true;
    loadGameHtml(game).then((h) => { if (!alive) return; if (h == null) setMissing(true); else setHtml(h); }).catch(() => alive && setMissing(true));
    return () => { alive = false; };
  }, [game, htmlProp]);
  const srcDoc = useMemo(() => (html == null ? null : buildSrcdoc(html)), [html]);
  useEffect(() => {
    const on = (e) => {
      if (!frame.current || e.source !== frame.current.contentWindow) return;
      const d = e.data;
      if (!d || d.nomi !== true) return;
      const now = Date.now();
      if (d.type === 'ask') {
        asks.current = asks.current.filter((x) => now - x < 60000);
        const reply = (result) => frame.current?.contentWindow?.postMessage({ nomi: true, type: 'answer', id: d.id, result }, '*');
        if (asks.current.length >= 10) { reply({ headline: 'Slow down', items: [{ label: 'Limit', text: 'Demos can ask the Nomi assistant 10 times a minute.' }] }); return; }
        asks.current.push(now);
        Promise.resolve(onAsk ? onAsk(String(d.prompt || '')) : { headline: 'No assistant here', items: [] }).then(reply);
        return;
      }
      if (d.type === 'ready') readyAt.current = now;
      if (d.type === 'win' && readyAt.current && now - readyAt.current < 5000) { onEvent?.({ type: 'instant' }); return; }
      onEvent?.({ ...d, readyMs: readyAt.current ? now - readyAt.current : 0 });
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, [onEvent, onAsk]);
  if (missing) return <p className="muted">This game file is only stored on the device that submitted it.</p>;
  if (srcDoc == null) return <div className="row"><span className="spinner" /> <span className="muted">Loading game...</span></div>;
  return (
    <iframe ref={frame} title={game?.title || 'Community game'} className={hidden ? 'cgame cgame--hidden' : 'cgame'} style={hidden ? undefined : { height }}
      sandbox="allow-scripts" referrerPolicy="no-referrer" allow="" srcDoc={srcDoc} />
  );
}

/* hidden smoke test: load, wait for ready, collect errors */
export function SmokeTest({ html, onDone }) {
  const state = useRef({ ready: false, readyMs: 0, errors: [], instantWin: false, t0: Date.now() });
  useEffect(() => {
    const t = setTimeout(() => onDone({ ...state.current }), 4200);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const handle = (e) => {
    const s = state.current;
    if (e.type === 'ready') { s.ready = true; s.readyMs = e.readyMs || Date.now() - s.t0; }
    if (e.type === 'error') s.errors.push(e.message);
    if (e.type === 'instant') s.instantWin = true;
  };
  return <CommunityGame game={{ title: 'Smoke test' }} html={html} hidden onEvent={handle} />;
}
