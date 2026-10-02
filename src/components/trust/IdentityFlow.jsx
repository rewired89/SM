import { useState } from 'react';
import { Badge, TactileButton, StoneCard } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { Link } from '../../lib/router.js';

const OUTCOMES = [['pass', 'Everything matches'], ['address', 'Address does not match the license'], ['record', 'A relevant public record is flagged'], ['document', 'Document unreadable']];
const STEPS = ['Document looks genuine', 'Selfie matches the document', 'Name and date of birth match', 'Address matches the license', 'Public records screening (fundraising-relevant offenses only)', 'Sanctions screening'];
const FAIL_AT = { document: 0, address: 3, record: 4 };
const REASON = {
  document: 'We could not read your document. Try again in better light, with all four corners visible.',
  address: 'The address you entered does not match the address on your license. Update your address and try again.',
  record: 'The screening flagged a public record that is relevant to fundraising. A human reviewer will contact you, and you can appeal.',
};

export default function IdentityFlow({ onDone }) {
  const { s, a } = useStore();
  const [phase, setPhase] = useState('intro');
  const [agree, setAgree] = useState(false);
  const [outcome, setOutcome] = useState('pass');
  const [done, setDone] = useState(0);
  const [failed, setFailed] = useState(-1);

  const run = () => {
    setPhase('run'); setDone(0); setFailed(-1);
    const stop = outcome === 'pass' ? STEPS.length : FAIL_AT[outcome];
    let i = 0;
    const tick = () => {
      if (i < stop) { i += 1; setDone(i); setTimeout(tick, 650); return; }
      if (outcome !== 'pass') setFailed(stop);
      const ok = outcome === 'pass';
      setTimeout(() => {
        a.setIdentity({ status: ok ? 'verified' : 'failed', checkedAt: Date.now(), vendorRef: `sbx_${Math.random().toString(36).slice(2, 10)}`, reason: ok ? '' : REASON[outcome], appeal: outcome === 'record' });
        setPhase('result'); onDone?.(ok);
      }, 500);
    };
    setTimeout(tick, 500);
  };

  if (phase === 'run') {
    return (
      <div className="stack" aria-live="polite">
        <strong>Checking with our verification partner (sandbox)</strong>
        <ul className="stack stack--sm">{STEPS.map((x, i) => (
          <li key={x} className="row">{i < done ? <span className="ok" aria-label="Passed">✓</span> : i === failed ? <span className="danger" aria-label="Failed">✗</span> : i === done && failed < 0 ? <span className="spinner" /> : <span className="muted">•</span>}<span className={i > done && failed < 0 ? 'muted' : ''}>{x}</span></li>
        ))}</ul>
      </div>
    );
  }
  if (phase === 'result' || s.identity.status !== 'none') {
    const id = s.identity;
    return (
      <div className="stack">
        {id.status === 'verified'
          ? <div className="banner banner--success"><strong>✓ Identity verified</strong><span>Checked {new Date(id.checkedAt).toLocaleDateString()}. Reference {id.vendorRef}. Nomi stores only this result, never your document, address or any record details.</span></div>
          : <div className="banner banner--warn"><strong>Not verified</strong><span>{id.reason}</span>{id.appeal && <Link to="/trust#appeal" className="accent">How appeals work</Link>}</div>}
        <div className="row row--wrap"><TactileButton onClick={() => { setPhase('intro'); setAgree(false); a.setIdentity({ status: 'none', checkedAt: 0, vendorRef: '', reason: '' }); }}>{id.status === 'verified' ? 'Verify again' : 'Try again'}</TactileButton></div>
      </div>
    );
  }
  return (
    <div className="stack">
      <div className="banner"><Badge tone="warning">Sandbox</Badge><span className="secondary">This prototype never asks for real ID details. Pick an outcome to see how each result looks.</span></div>
      <StoneCard className="stack stack--sm tile--flat">
        <strong>What gets checked, with your consent</strong>
        <ul className="stack stack--sm secondary">
          <li>🪪 Your driver's license or ID is genuine, and the selfie matches it</li>
          <li>🏠 Your name, date of birth and address match the license</li>
          <li>⚖️ A licensed screening partner looks at public criminal records, limited to offenses relevant to fundraising such as fraud and theft. You get a copy and a chance to dispute anything before a decision is final.</li>
          <li>🌐 Sanctions lists are checked, as payment rules require</li>
        </ul>
        <strong>What Nomi keeps</strong>
        <p className="secondary">Only: verified or not, the date, and a reference number. We never see or store your document, address or record details. The verification partner and payment provider may keep records because the law requires them to.</p>
      </StoneCard>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}><legend className="label">Sandbox outcome</legend>
        <div className="chips" role="radiogroup" aria-label="Sandbox outcome">{OUTCOMES.map(([id, l]) => <button key={id} type="button" role="radio" aria-checked={outcome === id} className="chip" onClick={() => setOutcome(id)}>{l}</button>)}</div></fieldset>
      <label className="row" style={{ alignItems: 'flex-start' }}><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 4 }} /> <span>I authorize the identity and public-records checks described above. I understand I can say no, and that I just will not be able to receive funds.</span></label>
      <div><TactileButton variant="primary" disabled={!agree} onClick={run}>Start verification</TactileButton></div>
    </div>
  );
}
