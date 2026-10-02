/* Bans live outside the account's own data so deleting or resetting data cannot erase them. */
const KEY = 'nomi_bans_v1';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* storage unavailable */ } };

export function getBan(id) {
  const b = read()[id];
  if (!b) return null;
  if (!b.permanent && b.until <= Date.now()) return null;
  return b;
}
export function setBan(id, rec) { write({ ...read(), [id]: rec }); }
export function clearBan(id) { const all = read(); delete all[id]; write(all); }
