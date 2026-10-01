export const money = (n, digits) => {
  const d = digits ?? (Number.isInteger(n) ? 0 : 2);
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
};
export const cents = (n) => '$' + Number(n).toFixed(2);

export const compact = (n) =>
  n >= 10000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'K' : n >= 1000 ? n.toLocaleString('en-US') : String(n);

export const pct = (a, b) => (b <= 0 ? 0 : Math.max(0, Math.min(100, (a / b) * 100)));
export const pctLabel = (v, digits) => `${v.toFixed(digits ?? (v >= 10 || v === 0 || v === 100 ? 0 : 1))}%`;

const APP_START = Date.now();
export const minsAgoToTs = (m) => APP_START - m * 60000;

export function ago(ts) {
  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d}d` : `${Math.round(d / 30)}mo`;
}

export const initials = (name) => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
export const uid = (p) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const plural = (n, one, many) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many ?? one + 's'}`;
