import { createElement, useSyncExternalStore } from 'react';

const read = () => window.location.hash || '#/';
const subscribe = (cb) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, read, () => '#/');
  const raw = hash.slice(1) || '/';
  const [path, qs] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(qs || ''));
  return { path: path || '/', parts: (path || '/').split('/').filter(Boolean), query };
}

export const navigate = (to) => {
  window.location.hash = to;
};
export const back = () => {
  if (window.history.length > 1) window.history.back();
  else navigate('/');
};

export function Link({ to, children, ...rest }) {
  return createElement('a', { href: '#' + to, ...rest }, children);
}
export const q = (s) => encodeURIComponent(s);
