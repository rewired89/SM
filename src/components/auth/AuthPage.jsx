import { useState } from 'react';
import Logo from '../layout/Logo.jsx';
import Backdrop from '../layout/Backdrop.jsx';
import { TactileButton, Tabs, Badge } from '../ui/index.jsx';
import { DEMO_ACCOUNT, EMAIL, HANDLE, requestCode, checkCode, findByEmail, createAccount } from '../../lib/auth.js';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('signup');
  const [step, setStep] = useState('form');
  const [f, setF] = useState({ email: '', name: '', handle: '', agree: false });
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const switchMode = (m) => { setMode(m); setStep('form'); setErr(''); setCode(''); };

  const send = (e) => {
    e.preventDefault();
    setErr('');
    if (!EMAIL.test(f.email)) return setErr('Enter a valid email address.');
    if (mode === 'signup') {
      if (!f.name.trim()) return setErr('Please add your name.');
      if (!HANDLE.test(f.handle)) return setErr('Your @username needs 3 to 20 letters, numbers or underscores.');
      if (!f.agree) return setErr('Please confirm you are 18 or older and agree to the terms.');
      if (findByEmail(f.email)) return setErr('An account with that email already exists. Try signing in.');
    } else if (!findByEmail(f.email)) return setErr('We could not find an account with that email. Create one instead?');
    setDemoCode(requestCode(f.email));
    setStep('code');
  };
  const verify = (e) => {
    e.preventDefault();
    const r = checkCode(f.email, code);
    if (!r.ok) return setErr(r.error);
    if (mode === 'signup') {
      const c = createAccount({ email: f.email, name: f.name, handle: f.handle });
      if (c.error) { setStep('form'); return setErr(c.error); }
      return onAuth(c.account.id);
    }
    return onAuth(findByEmail(f.email).id);
  };

  return (
    <>
      <Backdrop />
      <main className="auth" id="main">
        <section className="auth__hero">
          <div className="brand"><Logo size={38} /><span className="brand__name">Nomi</span></div>
          <h1>Ideas don't just get posted. People help them happen.</h1>
          <p className="lead">Discover projects, find collaborators, learn something tiny every day, and back real work with a few cents at a time.</p>
          <ul className="auth__points">
            <li>🔬 Funded projects are reviewed before they can receive money</li>
            <li>🪪 Creators who receive funds verify who they are</li>
            <li>🤝 Founders choose who joins their team</li>
          </ul>
        </section>
        <section className="glass auth__card" aria-label="Account">
          <Tabs label="Account mode" tabs={[{ id: 'signup', label: 'Create account' }, { id: 'signin', label: 'Sign in' }]} value={mode} onChange={switchMode} />
          {step === 'form' ? (
            <form className="stack" onSubmit={send} noValidate>
              {mode === 'signup' && (
                <>
                  <div className="field"><label htmlFor="a-name">Your name</label><input id="a-name" className="input" value={f.name} onChange={set('name')} autoComplete="name" maxLength={40} /></div>
                  <div className="field"><label htmlFor="a-handle">@username</label><input id="a-handle" className="input" value={f.handle} onChange={set('handle')} autoCapitalize="off" autoComplete="username" maxLength={20} /></div>
                </>
              )}
              <div className="field"><label htmlFor="a-email">Email</label><input id="a-email" className="input" type="email" value={f.email} onChange={set('email')} autoComplete="email" /></div>
              {mode === 'signup' && <label className="row" style={{ alignItems: 'flex-start' }}><input type="checkbox" checked={f.agree} onChange={set('agree')} style={{ marginTop: 4 }} /> <span className="muted">I am 18 or older and agree to the Terms and Privacy Notice (drafts, pending legal review).</span></label>}
              {err && <p className="danger" role="alert">{err}</p>}
              <TactileButton type="submit" variant="primary" size="lg" className="btn--block">{mode === 'signup' ? 'Send me a code' : 'Email me a code'}</TactileButton>
              <p className="muted">No password to remember or leak. We email you a one-time code.</p>
            </form>
          ) : (
            <form className="stack" onSubmit={verify}>
              <p className="secondary">Enter the 6-digit code we sent to <strong>{f.email}</strong>.</p>
              <div className="banner"><Badge tone="warning">Prototype</Badge><span className="secondary">No email is sent in this demo. Your code is <strong>{demoCode}</strong>.</span></div>
              <div className="field"><label htmlFor="a-code">Code</label><input id="a-code" className="input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} autoFocus /></div>
              {err && <p className="danger" role="alert">{err}</p>}
              <TactileButton type="submit" variant="primary" size="lg" className="btn--block" disabled={code.length !== 6}>{mode === 'signup' ? 'Create my account' : 'Sign in'}</TactileButton>
              <TactileButton variant="ghost" onClick={() => { setStep('form'); setErr(''); }}>Use a different email</TactileButton>
            </form>
          )}
          <hr className="rule" />
          <div className="stack stack--sm">
            <TactileButton onClick={() => onAuth(DEMO_ACCOUNT.id)}>Explore the demo as Dayana</TactileButton>
            <p className="muted">The demo account is pre-filled with projects, messages and history.</p>
          </div>
        </section>
      </main>
    </>
  );
}
