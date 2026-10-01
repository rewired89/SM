import { useEffect, useState } from 'react';

const DB = 'nomi_media', STORE = 'files';
const mem = new Map();
let dbp;
const open = () => (dbp ||= new Promise((res, rej) => {
  if (!window.indexedDB) return rej(new Error('no idb'));
  const r = indexedDB.open(DB, 1);
  r.onupgradeneeded = () => r.result.createObjectStore(STORE);
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
}));

export const asset = (p) => `${import.meta.env.BASE_URL}${p}`;
const uid = () => `m_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export async function putFile(file) {
  const id = uid();
  mem.set(id, file);
  try {
    const db = await open();
    await new Promise((res, rej) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(file, id); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  } catch { /* falls back to memory for this session */ }
  return id;
}
export async function getBlob(id) {
  if (mem.has(id)) return mem.get(id);
  try {
    const db = await open();
    return await new Promise((res) => { const q = db.transaction(STORE).objectStore(STORE).get(id); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); });
  } catch { return null; }
}

export const LIMITS = { image: 8, video: 50, pdf: 25, deck: 25 };
export const fmtSize = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export function classify(file) {
  const n = file.name.toLowerCase(), t = file.type;
  if (t.startsWith('image/') && !t.includes('svg')) return 'image';
  if (t.startsWith('video/')) return 'video';
  if (t === 'application/pdf' || n.endsWith('.pdf')) return 'pdf';
  if (n.endsWith('.pptx') || n.endsWith('.ppt') || t.includes('presentationml') || t === 'application/vnd.ms-powerpoint') return 'deck';
  return null;
}
export function validate(file) {
  const kind = classify(file);
  if (!kind) return { ok: false, error: `${file.name}: only images, videos, PDF and PowerPoint files are supported.` };
  if (file.size > LIMITS[kind] * 1048576) return { ok: false, error: `${file.name} is ${fmtSize(file.size)}. The ${kind === 'deck' ? 'PowerPoint' : kind} limit is ${LIMITS[kind]} MB in this prototype.` };
  return { ok: true, kind };
}
export const ACCEPT = 'image/*,video/*,.pdf,.pptx,.ppt,application/pdf';

/* store the picked files, return post-ready media descriptors */
export async function saveAttachments(items) {
  const out = [];
  for (const it of items) out.push({ id: await putFile(it.file), kind: it.kind, name: it.file.name, size: it.file.size, type: it.file.type, alt: it.alt || '' });
  return out;
}

export function useMediaUrl(m) {
  const [url, setUrl] = useState(m.src ? asset(m.src) : null);
  useEffect(() => {
    if (m.src) { setUrl(asset(m.src)); return undefined; }
    let u, alive = true;
    getBlob(m.id).then((b) => { if (b && alive) { u = URL.createObjectURL(b); setUrl(u); } else if (alive) setUrl(''); });
    return () => { alive = false; if (u) URL.revokeObjectURL(u); };
  }, [m.id, m.src]);
  return url;
}

/* links: only http(s); detect GitHub repos */
export function parseLink(raw) {
  let s = (raw || '').trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  let u;
  try { u = new URL(s); } catch { return null; }
  if (!['http:', 'https:'].includes(u.protocol) || !u.hostname.includes('.')) return null;
  const host = u.hostname.replace(/^www\./, '');
  const gh = host === 'github.com' ? u.pathname.split('/').filter(Boolean) : [];
  return { url: u.toString(), host, kind: host === 'github.com' ? (gh.length >= 2 ? 'repo' : 'github') : 'link', owner: gh[0], repo: gh[1] };
}
