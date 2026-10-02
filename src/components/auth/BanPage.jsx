import { useEffect, useState } from 'react';
import Backdrop from '../layout/Backdrop.jsx';
import { TactileButton, Badge } from '../ui/index.jsx';
import { money } from '../../lib/format.js';

const left = (ms) => { const h = Math.max(0, Math.ceil(ms / 3600000)); return h >= 24 ? `${Math.floor(h / 24)} day${h >= 48 ? 's' : ''} ${h % 24} hours` : `${h} hours`; };

export default function BanPage({ account, ban, onSignOut, onClear }) {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 60000); return () => clearInterval(t); }, []);
  const refunds = ban.refunds || [];
  const total = refunds.reduce((a, r) => a + r.amount, 0);
  return (
    <>
      <Backdrop />
      <main className="auth" id="main">
        <section className="glass auth__card" style={{ gridColumn: '1 / -1', maxWidth: 640, margin: '0 auto' }}>
          <Badge tone="warning">{ban.permanent ? 'Account removed' : 'Account suspended'}</Badge>
          <h1>{ban.permanent ? 'This account was removed' : `Your account is suspended for ${left(ban.until - Date.now())} more`}</h1>
          <p className="secondary">{account.name}, Nomi is built on respect between people who are trying to build things. Your account broke our community standards: <strong>{ban.reason}</strong>.</p>
          {ban.permanent ? (
            <>
              <p className="secondary">This was a repeat violation after an earlier suspension, so the account and its progress were deleted.</p>
              {refunds.length > 0 && (
                <div className="banner"><strong>Backers were refunded {money(total, 2)}</strong><ul>{refunds.map((r) => <li key={r.title}>• {r.title}: {money(r.amount, 2)}</li>)}</ul><span className="muted">In this prototype refunds are simulated.</span></div>
              )}
            </>
          ) : <p className="secondary">You can come back when the suspension ends. Another violation will remove the account permanently, delete your progress and refund backers of any funded project.</p>}
          <p className="muted">Think this is a mistake? Appeals are read by a person. (Prototype: no real appeal inbox yet.)</p>
          <div className="row row--wrap"><TactileButton variant="primary" onClick={onSignOut}>Sign out</TactileButton><TactileButton variant="ghost" onClick={onClear}>Clear this ban (prototype only)</TactileButton></div>
        </section>
      </main>
    </>
  );
}
