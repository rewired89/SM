import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';
import { navigate, Link } from '../../lib/router.js';
import { initials } from '../../lib/format.js';

export { Icon };

export const GlassPanel = ({ as: Tag = 'div', className = '', children, ...rest }) => (
  <Tag className={`glass ${className}`} {...rest}>{children}</Tag>
);

export function StoneCard({ to, onClick, className = '', children, as: Tag = 'div', label, ...rest }) {
  const interactive = !!(to || onClick);
  const go = (e) => {
    if (e.target.closest('a,button,input,textarea,select,label,[role="button"]')) return;
    if (onClick) onClick(e);
    else if (to) navigate(to);
  };
  const key = (e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(e); } };
  return (
    <Tag className={`tile ${interactive ? 'tile--interactive' : ''} ${className}`} onClick={interactive ? go : undefined} onKeyDown={interactive ? key : undefined}
      tabIndex={interactive ? 0 : undefined} aria-label={interactive ? label : undefined} {...rest}>
      {children}
    </Tag>
  );
}

export function TactileButton({ variant = 'default', size, icon, children, className = '', active, to, ...rest }) {
  const cls = `btn ${variant === 'primary' ? 'btn--primary' : ''} ${variant === 'ghost' ? 'btn--ghost' : ''} ${size ? `btn--${size}` : ''} ${active ? 'btn--active' : ''} ${className}`;
  if (to) return <Link to={to} className={cls} {...rest}>{icon && <Icon name={icon} size={16} />}{children}</Link>;
  return <button type="button" className={cls} {...rest}>{icon && <Icon name={icon} size={16} />}{children}</button>;
}

export const IconButton = ({ icon, label, count, pressed, variant, className = '', children, ...rest }) => (
  <button type="button" className={`iconbtn ${variant ? `iconbtn--${variant}` : ''} ${className}`} aria-label={label} aria-pressed={pressed} title={label} {...rest}>
    <Icon name={icon} size={18} />
    {count !== undefined && <span>{count}</span>}
    {children}
  </button>
);

export const Badge = ({ tone, children, className = '' }) => <span className={`badge ${tone ? `badge--${tone}` : ''} ${className}`}>{children}</span>;

export const Avatar = ({ user, size = 40 }) => (
  <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(145deg, hsl(${user.hue} 60% 72%), hsl(${(user.hue + 40) % 360} 45% 52%))` }} aria-hidden="true">
    {initials(user.name)}
  </span>
);

export const ProgressBar = ({ value, done, thin, label }) => (
  <div className={`bar ${done ? 'bar--done' : ''} ${thin ? 'bar--thin' : ''}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
    <div className="bar__fill" style={{ width: `${Math.max(1.5, value)}%` }} />
  </div>
);

export function Tabs({ tabs, value, onChange, label }) {
  const onKey = (e) => {
    const i = tabs.findIndex((t) => t.id === value);
    if (e.key === 'ArrowRight') onChange(tabs[(i + 1) % tabs.length].id);
    if (e.key === 'ArrowLeft') onChange(tabs[(i - 1 + tabs.length) % tabs.length].id);
  };
  return (
    <div className="tabs" role="tablist" aria-label={label} onKeyDown={onKey}>
      {tabs.map((t) => (
        <button key={t.id} type="button" role="tab" className="tab" aria-selected={value === t.id} tabIndex={value === t.id ? 0 : -1} onClick={() => onChange(t.id)}>{t.label}</button>
      ))}
    </div>
  );
}

export function Modal({ title, onClose, children, label }) {
  const box = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    box.current?.querySelector('input,textarea,select,button:not([data-close])')?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const f = [...box.current.querySelectorAll('button,input,textarea,select,a[href]')].filter((x) => !x.disabled);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus?.(); };
  }, [onClose]);
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass modal" role="dialog" aria-modal="true" aria-label={label || title} ref={box}>
        <div className="modal__head">
          <h2>{title}</h2>
          <IconButton icon="x" label="Close dialog" onClick={onClose} data-close />
        </div>
        {children}
      </div>
    </div>
  );
}

export const Empty = ({ title, children }) => (
  <div className="empty"><strong>{title}</strong>{children && <span>{children}</span>}</div>
);

export const Tag = ({ tag }) => <Link to={`/tag/${tag}`} className="tag">#{tag}</Link>;
