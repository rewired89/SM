import { useState } from 'react';
import { Badge, TactileButton } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { CASHTAG } from '../../lib/profile.js';

/* PROTOTYPE ONLY: no card number is ever requested or stored. A real build would use the payment provider's hosted fields. */
export default function PaymentSetup({ onDone }) {
  const { a } = useStore();
  const [type, setType] = useState('credit');
  const [tag, setTag] = useState('');
  const [ack, setAck] = useState(false);
  const [err, setErr] = useState('');
  const done = () => { setErr(''); onDone?.(); };
  const addCredit = () => { a.addPayment({ type: 'credit', label: 'Credit card •••• 4242', sandbox: true }); done(); };
  const addDebit = () => { a.addPayment({ type: 'debit', label: 'Debit card •••• 1111', sandbox: true }); done(); };
  const addCash = () => {
    const t = tag.trim().startsWith('$') ? tag.trim() : `$${tag.trim()}`;
    if (!CASHTAG.test(t)) { setErr('A Cash App $Cashtag starts with a letter, for example $nomi_fan.'); return; }
    a.addPayment({ type: 'cashapp', label: `Cash App ${t}`, cashtag: t }); done();
  };
  const opt = (id, title, badge, text) => (
    <button type="button" role="radio" aria-checked={type === id} className={`pay-opt ${type === id ? 'is-on' : ''}`} onClick={() => { setType(id); setErr(''); }}>
      <span className="row row--between"><strong>{title}</strong>{badge && <Badge tone="success">{badge}</Badge>}</span>
      <span className="muted">{text}</span>
    </button>
  );
  return (
    <div className="stack">
      <div className="banner"><Badge tone="warning">Prototype</Badge><span className="secondary">Nothing real is collected. This creates a sandbox payment method so you can try the flow. Never type real card numbers into a prototype.</span></div>
      <div className="stack stack--sm" role="radiogroup" aria-label="Payment method type">
        {opt('credit', 'Credit card', 'Recommended', 'Usually offers stronger fraud protection and keeps your bank balance separate.')}
        {opt('cashapp', 'Cash App', 'Recommended', 'Adds a layer between your contributions and your bank. You can fund it with a debit card.')}
        {opt('debit', 'Debit card', null, 'Pulls straight from your bank account. We would rather you used one of the options above.')}
      </div>
      {type === 'credit' && <TactileButton variant="primary" onClick={addCredit}>Connect a secure card (sandbox)</TactileButton>}
      {type === 'cashapp' && (
        <div className="stack stack--sm">
          <div className="field"><label htmlFor="cashtag">Your $Cashtag</label><input id="cashtag" className="input" placeholder="$yourtag" value={tag} onChange={(e) => setTag(e.target.value)} autoCapitalize="off" autoComplete="off" /></div>
          {err && <p className="danger" role="alert">{err}</p>}
          <TactileButton variant="primary" onClick={addCash} disabled={!tag.trim()}>Link Cash App</TactileButton>
        </div>
      )}
      {type === 'debit' && (
        <div className="stack stack--sm">
          <div className="banner banner--warn"><strong>A quick heads up</strong><span>Debit cards connect directly to your bank account, so a fraud problem would hit your balance first. A credit card or Cash App is safer for small, frequent contributions.</span></div>
          <label className="row"><input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} /> <span>I understand, add a debit card anyway</span></label>
          <TactileButton onClick={addDebit} disabled={!ack}>Connect a debit card (sandbox)</TactileButton>
        </div>
      )}
      <p className="muted">A payment method is only needed to contribute. Browsing, playing, collaborating and messaging are always free.</p>
    </div>
  );
}
