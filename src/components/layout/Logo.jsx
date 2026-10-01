export default function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="lg1" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#8a8274" /><stop offset="1" stopColor="#4b4639" /></linearGradient>
        <linearGradient id="lg2" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#c9c0ae" /><stop offset="1" stopColor="#7d7565" /></linearGradient>
        <linearGradient id="lg3" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#ffd0a0" /><stop offset="1" stopColor="#e88f3d" /></linearGradient>
      </defs>
      <ellipse cx="16" cy="25" rx="11" ry="4.6" fill="url(#lg1)" />
      <ellipse cx="16" cy="18" rx="8" ry="3.8" fill="url(#lg2)" />
      <ellipse cx="16" cy="11.5" rx="5" ry="3" fill="url(#lg3)" />
    </svg>
  );
}
