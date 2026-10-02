import { useStore } from '../../store/StoreProvider.jsx';

/* one period is 1440 wide, drawn twice so a -50% slide loops seamlessly */
const wave = (base, amp) => {
  const one = `Q 360 ${base - amp * 2} 720 ${base} T 1440 ${base}`;
  const two = `Q 2160 ${base - amp * 2} 2160 ${base} T 2880 ${base}`;
  return `M0 ${base} ${one} Q 1800 ${base - amp * 2} 2160 ${base} T 2880 ${base} L2880 300 L0 300 Z`;
};

const CLOUDS = [
  { top: '7%', left: '8%', w: 260, o: 0.8 },
  { top: '16%', left: '68%', w: 200, o: 0.6 },
  { top: '36%', left: '38%', w: 300, o: 0.4 },
];

const Cloud = ({ w }) => (
  <svg viewBox="0 0 200 90" width={w} aria-hidden="true">
    <g fill="#fff"><ellipse cx="60" cy="58" rx="46" ry="26" /><ellipse cx="108" cy="46" rx="44" ry="32" /><ellipse cx="150" cy="60" rx="38" ry="24" /><ellipse cx="96" cy="66" rx="70" ry="20" /></g>
  </svg>
);

export default function Backdrop() {
  const ctx = useStore();
  if (ctx && !ctx.s.ambient) return null;
  return (
    <div className="backdrop" aria-hidden="true">
      {CLOUDS.map((c, i) => <div key={i} className="backdrop__cloud" style={{ top: c.top, left: c.left, opacity: c.o }}><Cloud w={c.w} /></div>)}
      <div className="backdrop__waves">
        <svg className="wave wave--3" viewBox="0 0 2880 300" preserveAspectRatio="none"><path d={wave(150, 34)} /></svg>
        <svg className="wave wave--2" viewBox="0 0 2880 300" preserveAspectRatio="none"><path d={wave(170, 28)} /></svg>
        <svg className="wave wave--1" viewBox="0 0 2880 300" preserveAspectRatio="none"><path d={wave(195, 22)} /></svg>
      </div>
    </div>
  );
}
