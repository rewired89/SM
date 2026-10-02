import { useState } from 'react';
import { GlassPanel, TactileButton, Badge, StoneCard, Empty } from '../components/ui/index.jsx';
import CommunityGame from '../components/games/CommunityGame.jsx';
import { pendingGames, decideGame, allGames } from '../lib/gamestore.js';
import { getAccounts } from '../lib/auth.js';
import { getBan, setBan, clearBan } from '../lib/bans.js';
import { useAuth } from '../components/auth/AuthGate.jsx';
import { useUI } from '../store/UIProvider.jsx';
import { SUSPENSION_DAYS } from '../lib/conduct.js';
import { cents } from '../lib/format.js';

const refundsFor = (id) => {
  try {
    const st = JSON.parse(localStorage.getItem(id === 'u_dayana' ? 'nomi_state_v1' : `nomi_state_v1:${id}`));
    return (st?.created?.projects || []).map((p) => ({ title: p.title, amount: (p.funded || 0) + (st.deltas?.[`project:${p.id}`] || 0) })).filter((r) => r.amount > 0);
  } catch { return []; }
};

export default function Admin() {
  const auth = useAuth();
  const { toast } = useUI();
  const [, bump] = useState(0);
  const [open, setOpen] = useState(null);
  const refresh = () => bump((n) => n + 1);
  if (!auth.account?.admin) return <Empty title="Admins only">This area is for Nomi reviewers.</Empty>;
  const queue = pendingGames();
  const decide = (g, st) => { decideGame(g.id, st, st === 'approved' ? 'Approved by a reviewer' : 'Rejected by a reviewer'); toast(`${g.title}: ${st}`, { tone: st === 'approved' ? 'success' : 'default' }); refresh(); };
  const act = (acc, permanent) => {
    const reason = prompt(`Reason for ${permanent ? 'removing' : 'suspending'} ${acc.name}? They will see it.`);
    if (!reason?.trim()) return;
    setBan(acc.id, { permanent, until: permanent ? 0 : Date.now() + SUSPENSION_DAYS * 86400000, reason: reason.trim(), at: Date.now(), refunds: permanent ? refundsFor(acc.id) : [] });
    toast(permanent ? `${acc.name} removed. Refunds simulated.` : `${acc.name} suspended for ${SUSPENSION_DAYS} days`, { tone: 'success' }); refresh();
  };
  const others = getAccounts().filter((a) => a.id !== auth.account.id);
  return (
    <div className="stack stack--lg">
      <GlassPanel className="hero"><span className="eyebrow">Reviewer area (prototype)</span><h1>Admin</h1><p className="secondary">Game review queue and account actions. In a real build this is a separate, audited tool with roles and logs.</p></GlassPanel>
      <section className="stack"><h2>Games waiting for review ({queue.length})</h2>
        {!queue.length && <p className="empty">Nothing waiting. Games scoring 80+ are approved automatically.</p>}
        {queue.map((g) => (
          <StoneCard key={g.id} className="stack stack--sm">
            <div className="row row--between row--wrap"><strong>{g.title}</strong><Badge>{g.score}/100</Badge></div>
            <p className="secondary">{g.description}</p>
            <small className="muted">{g.report?.checks?.map((c) => `${c.label} ${c.pts}/${c.max}`).join(' · ')}</small>
            {open === g.id && <CommunityGame game={g} height={320} />}
            <div className="row row--wrap"><TactileButton size="sm" onClick={() => setOpen(open === g.id ? null : g.id)}>{open === g.id ? 'Close preview' : 'Play it'}</TactileButton><TactileButton size="sm" variant="primary" onClick={() => decide(g, 'approved')}>Approve</TactileButton><TactileButton size="sm" onClick={() => decide(g, 'rejected')}>Reject</TactileButton></div>
          </StoneCard>
        ))}
        <small className="muted">{allGames().filter((g) => g.status === 'approved').length} games live</small>
      </section>
      <section className="stack"><h2>Accounts on this device</h2>
        {!others.length && <p className="empty">No other accounts yet.</p>}
        {others.map((a) => { const b = getBan(a.id); return (
          <StoneCard key={a.id} className="row row--between row--wrap"><div><strong>{a.name}</strong> <small className="muted">@{a.handle} · {a.email}</small>{b && <div><Badge tone="danger">{b.permanent ? 'Removed' : 'Suspended'}</Badge> <small className="muted">{b.reason}{b.refunds?.length ? ` · refunds ${b.refunds.map((r) => cents(r.amount)).join(', ')}` : ''}</small></div>}</div>
            <div className="row row--wrap">{b ? <TactileButton size="sm" onClick={() => { clearBan(a.id); refresh(); }}>Lift</TactileButton> : <><TactileButton size="sm" onClick={() => act(a, false)}>Suspend {SUSPENSION_DAYS} days</TactileButton><TactileButton size="sm" onClick={() => act(a, true)}>Ban forever</TactileButton></>}</div></StoneCard>
        ); })}
      </section>
    </div>
  );
}
