import { useState } from 'react';
import { GlassPanel, TactileButton, Badge } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import * as sel from '../../store/selectors.js';
import { cents } from '../../lib/format.js';

export default function MicroContribution({ tool }) {
  const { s, a } = useStore();
  const [done, setDone] = useState(null);
  const uses = s.toolUses[tool.id] || 0;
  const show = uses >= 3 && uses % 3 === 0 && (s.microSeen[tool.id] || 0) !== uses;
  if (done) {
    return (
      <GlassPanel className="micro micro--done stack" role="status">
        <Badge tone="success">$0.50 contributed</Badge>
        <ul className="alloc">{done.allocations.map((al) => <li key={al.label + al.type}><span>{al.note}{al.type !== 'platform' ? `: ${al.label}` : ''}</span><strong>{cents(al.amount)}</strong></li>)}</ul>
        <p className="muted">Prototype distribution. These are simulated amounts, not real transactions.</p>
        <TactileButton size="sm" variant="ghost" onClick={() => setDone(null)}>Dismiss</TactileButton>
      </GlassPanel>
    );
  }
  if (!show) return null;
  const proj = sel.projectById(s, tool.projectId);
  return (
    <GlassPanel className="micro stack" role="region" aria-label="Optional contribution">
      <Badge tone="accent">Optional</Badge>
      <p><strong>You used {tool.name} {uses} times today.</strong> Would you like to contribute $0.50 toward the tools and projects you used?</p>
      <p className="muted">$0.20 to the tool creator · {proj ? `$0.20 to ${proj.title}` : '$0.20 to the funding pool'} · $0.10 to platform infrastructure. Using the tool stays free either way.</p>
      <div className="row row--wrap">
        <TactileButton variant="ghost" onClick={() => a.dismissMicro(tool.id)}>Not now</TactileButton>
        <TactileButton variant="primary" onClick={() => { const r = a.contribute({ targetType: 'tool', targetId: tool.id, amount: 0.5, micro: true }); if (r) { a.dismissMicro(tool.id); setDone(r); } }}>Contribute $0.50</TactileButton>
      </div>
    </GlassPanel>
  );
}
