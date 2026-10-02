import { DEMO_ID, users, registerUser } from '../data/users.js';

/* PROTOTYPE AUTH: passwordless email code, kept in this browser only.
   A real build uses a managed provider (passkeys, email links, OAuth) and MFA for anyone who receives funds. */
const ACC = 'nomi_accounts_v1', SES = 'nomi_session_v1', CODE = 'nomi_code';
const read = (k, store = localStorage) => { try { return JSON.parse(store.getItem(k)); } catch { return null; } };
const write = (k, v, store = localStorage) => { try { store.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };

export const DEMO_ACCOUNT = { id: DEMO_ID, email: 'demo@nomi.app', name: 'Dayana', handle: 'rewired', demo: true };
export const getAccounts = () => [DEMO_ACCOUNT, ...(read(ACC) || [])];
export const getSession = () => read(SES);
export const getAccount = (id) => getAccounts().find((a) => a.id === id);
export const registerAll = () => getAccounts().forEach((a) => !a.demo && registerUser(a));
export const startSession = (accountId) => write(SES, { accountId });
export const endSession = () => { try { localStorage.removeItem(SES); } catch { /* ignore */ } };

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const HANDLE = /^[a-z0-9_]{3,20}$/i;

export function requestCode(email) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  write(CODE, { email: email.toLowerCase(), code, exp: Date.now() + 10 * 60000, tries: 0 }, sessionStorage);
  return code;
}
export function checkCode(email, input) {
  const c = read(CODE, sessionStorage);
  if (!c || c.email !== email.toLowerCase()) return { ok: false, error: 'Request a new code first.' };
  if (Date.now() > c.exp) return { ok: false, error: 'That code expired. Request a new one.' };
  if (c.tries >= 5) return { ok: false, error: 'Too many tries. Request a new code.' };
  if (c.code !== input.trim()) { write(CODE, { ...c, tries: c.tries + 1 }, sessionStorage); return { ok: false, error: `That code is not right. ${4 - c.tries} tries left.` }; }
  try { sessionStorage.removeItem(CODE); } catch { /* ignore */ }
  return { ok: true };
}

export function findByEmail(email) { return getAccounts().find((a) => a.email.toLowerCase() === email.trim().toLowerCase()); }

export function createAccount({ email, name, handle }) {
  if (!EMAIL.test(email)) return { error: 'Enter a valid email address.' };
  if (!name.trim()) return { error: 'Please add your name.' };
  if (!HANDLE.test(handle)) return { error: 'Your @username needs 3 to 20 letters, numbers or underscores.' };
  if (findByEmail(email)) return { error: 'An account with that email already exists. Sign in instead.' };
  if (users.some((u) => u.handle.toLowerCase() === handle.toLowerCase())) return { error: 'That @username is taken.' };
  const acct = { id: `u_${Math.random().toString(36).slice(2, 10)}`, email: email.trim().toLowerCase(), name: name.trim(), handle, createdAt: Date.now() };
  write(ACC, [...(read(ACC) || []), acct]);
  registerUser(acct);
  return { account: acct };
}

export function deleteAccount(id) {
  write(ACC, (read(ACC) || []).filter((a) => a.id !== id));
  try { localStorage.removeItem(`nomi_state_v1:${id}`); } catch { /* ignore */ }
  endSession();
}
