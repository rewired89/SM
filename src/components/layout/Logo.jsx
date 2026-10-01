export default function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="lg1" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#c3c9d8" /><stop offset="1" stopColor="#8c95ab" /></linearGradient>
        <linearGradient id="lg2" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#e9edf5" /><stop offset="1" stopColor="#a5aec3" /></linearGradient>
        <linearGradient id="lg3" x1="0" x2="1" y1="0" y2="1"><stop offset="0" style={{ stopColor: 'var(--accent-light)' }} /><stop offset="1" style={{ stopColor: 'var(--accent)' }} /></linearGradient>
      </defs>
      <ellipse cx="16" cy="25" rx="11" ry="4.6" fill="url(#lg1)" />
      <ellipse cx="16" cy="18" rx="8" ry="3.8" fill="url(#lg2)" />
      <ellipse cx="16" cy="11.5" rx="5" ry="3" fill="url(#lg3)" />
    </svg>
  );
}
