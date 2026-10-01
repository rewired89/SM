export const CAREERS = [
  'Technology / Software', 'AI & Machine Learning', 'Cybersecurity', 'Science & Research', 'Healthcare & Biology', 'Engineering / Hardware',
  'Design & Creative', 'Business & Entrepreneurship', 'Education', 'Writing & Media', 'Other',
];
export const CAREER_STATUS = [['working', 'Working in this field'], ['studying', 'Studying'], ['progress', 'Still in progress']];

export const COLLAB_TYPES = [
  'Tech collaborator', 'Tech with AI · Vibe Code', 'Scientist collaborator', 'Designer collaborator',
  'Creative collaborator', 'Researcher / Academic', 'Writer / Storyteller', 'Hardware / Maker', 'Business / Funding advisor',
];

export const SOCIALS = [
  { id: 'github', label: 'GitHub', base: 'https://github.com/', hosts: ['github.com'] },
  { id: 'linkedin', label: 'LinkedIn', base: 'https://www.linkedin.com/in/', hosts: ['linkedin.com'] },
  { id: 'x', label: 'X', base: 'https://x.com/', hosts: ['x.com', 'twitter.com'] },
  { id: 'instagram', label: 'Instagram', base: 'https://www.instagram.com/', hosts: ['instagram.com'] },
  { id: 'youtube', label: 'YouTube', base: 'https://www.youtube.com/@', hosts: ['youtube.com', 'youtu.be'] },
  { id: 'tiktok', label: 'TikTok', base: 'https://www.tiktok.com/@', hosts: ['tiktok.com'] },
  { id: 'website', label: 'Website', base: '', hosts: [] },
];

/* accept a full URL or a bare handle; returns '' when invalid */
export function normalizeSocial(id, input) {
  const def = SOCIALS.find((s) => s.id === id);
  let v = (input || '').trim();
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = def.base && !v.includes('.') && !v.includes('/') ? def.base + v.replace(/^@/, '') : `https://${v}`;
  try {
    const u = new URL(v);
    if (!['http:', 'https:'].includes(u.protocol) || !u.hostname.includes('.')) return '';
    const host = u.hostname.replace(/^www\./, '');
    if (def.hosts.length && !def.hosts.some((h) => host === h || host.endsWith(`.${h}`))) return '';
    return u.toString();
  } catch { return ''; }
}

export const careerLabel = (c) => {
  if (!c) return '';
  if (c.field === 'Still in progress') return `Still in progress${c.studying ? ` · ${c.studying}` : ''}`;
  if (c.status === 'progress') return `${c.field} · Still in progress${c.studying ? ` · ${c.studying}` : ''}`;
  return `${c.field}${c.status === 'studying' ? ' · Studying' : ''}`;
};

export const CASHTAG = /^\$[A-Za-z][A-Za-z0-9_]{1,19}$/;
export const LIMIT_OPTIONS = [5, 10, 20, 50];
