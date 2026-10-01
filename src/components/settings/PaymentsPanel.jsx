import { useState } from 'react';
import { StoneCard, TactileButton, Badge } from '../ui/index.jsx';
import PaymentSetup from './PaymentSetup.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { LIMIT_OPTIONS } from '../../lib/profile.js';
import { cents } from '../../lib/format.js';

const ICON = { credit: '💳', cashapp: '💵', debit: '🏦' };

export default function PaymentsPanel() {
  const { s, a } = useStore();
  const [adding, setAdding] = useState(false);
  const { methods, defaultId } = s.payments;
  return (
    <div className="stack">
      <p className="secondary">Contributions are charged to a payment method you choose. Credit cards and Cash App are encouraged over debit cards.</p>
      {methods.length === 0 && !adding && <StoneCard className="tile--flat"><p className="muted">No payment method yet. Add one to contribute $0.50 to projects and tools.</p></StoneCard>}
      <ul className="stack stack--sm" aria-label="Payment methods">
        {methods.map((m) => (
          <li key={m.id}><StoneCard className="row row--between row--wrap">
            <div className="row"><span aria-hidden="true" style={{ fontSize: '1.5rem' }}>{ICON[m.type]}</span><div><strong>{m.label}</strong><div className="muted">{m.sandbox ? 'Sandbox test method' : 'Linked'}{m.type === 'debit' ? ' · debit' : ''}</div></div></div>
            <div className="row">{defaultId === m.id ? <Badge tone="success">Default</Badge> : <TactileButton size="sm" onClick={() => a.setDefaultPayment(m.id)}>Make default</TactileButton>}<TactileButton size="sm" variant="ghost" onClick={() => a.removePayment(m.id)} aria-label={`Remove ${m.label}`}>Remove</TactileButton></div>
          </StoneCard></li>
        ))}
      </ul>
      {adding ? <StoneCard><PaymentSetup onDone={() => setAdding(false)} /></StoneCard> : <div><TactileButton variant="primary" icon="plus" onClick={() => setAdding(true)}>Add a payment method</TactileButton></div>}
      <div className="field"><label htmlFor="limit">Monthly contribution limit</label>
        <select id="limit" className="select" style={{ maxWidth: 220 }} value={s.monthlyLimit} onChange={(e) => a.setLimit(Number(e.target.value))}>{LIMIT_OPTIONS.map((n) => <option key={n} value={n}>${n} per month</option>)}</select>
        <span className="muted">{cents(s.wallet)} left this month. A limit keeps small contributions small.</span>
      </div>
    </div>
  );
}
