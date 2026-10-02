import { useStore } from '../store/StoreProvider.jsx';
import * as sel from '../store/selectors.js';
import { GlassPanel, StoneCard, ProgressBar, Badge } from '../components/ui/index.jsx';
import ContributionHistory from '../components/profile/ContributionHistory.jsx';
import FundingMilestone from '../components/projects/FundingMilestone.jsx';
import PaymentsPanel from '../components/settings/PaymentsPanel.jsx';
import { Link } from '../lib/router.js';
import { cents, pct } from '../lib/format.js';
import { ME } from '../data/users.js';

export default function Fund() {
  const { s } = useStore();
  const st = sel.contributionStats(s);
  const max = st.where[0]?.amount || 1;
  const close = sel.allProjects(s).filter((p) => p.ownerId !== ME).map((p) => ({ p, m: sel.activeMilestone(s, p.id) })).filter((x) => x.m && !x.m.done).sort((a, b) => b.m.funded / b.m.needed - a.m.funded / a.m.needed).slice(0, 3);
  return (
    <div className="stack stack--lg">
      <div><h1>Fund</h1><p className="secondary">Small contributions, tied to things you actually used or care about. Prototype only: all money here is simulated.</p></div>
      <p className="secondary">Only reviewed projects with verified creators can receive contributions. <a className="accent" href="#/trust">How we check</a>.</p>
      <section aria-label="Payment methods" className="stack"><h2>Payment methods</h2><PaymentsPanel /></section>
      <section aria-label="Your impact" className="stack">
        <span className="eyebrow">Your impact</span>
        <div className="stats">
          <GlassPanel className="stat"><span className="muted">Total contributed</span><strong>{cents(st.total)}</strong></GlassPanel>
          <GlassPanel className="stat"><span className="muted">Projects supported</span><strong>{st.projects}</strong></GlassPanel>
          <GlassPanel className="stat"><span className="muted">Tools supported</span><strong>{st.tools}</strong></GlassPanel>
          <GlassPanel className="stat"><span className="muted">Contributions</span><strong>{st.count}</strong></GlassPanel>
        </div>
      </section>
      <section aria-label="Where your money went" className="stack">
        <h2>Where your money went</h2>
        <StoneCard className="stack">
          {st.where.slice(0, 8).map((w) => (
            <div key={w.type + w.id} className="where">
              <span>{w.type === 'platform' ? 'Platform infrastructure' : w.label}</span>
              <ProgressBar thin value={pct(w.amount, max)} label={w.label} />
              <strong>{cents(w.amount)}</strong>
            </div>
          ))}
        </StoneCard>
      </section>
      <section aria-label="How it works" className="stack">
        <h2>How contributions work</h2>
        <div className="pricing">
          <div><Badge tone="success">Free</Badge><span>Everything on Nomi is free to use and join.</span></div>
          <div><Badge tone="accent">Optional</Badge><span>A contribution is a thank-you you choose. $0.50 is the default. Direct support goes 100% to what you back.</span></div>
          <div><Badge tone="warning">Fee</Badge><span>Only a creator's own paid services carry fees, and they are always labeled separately.</span></div>
        </div>
        <StoneCard className="stack stack--sm"><strong>Usage contribution split (prototype)</strong><ul className="alloc"><li><span>Tool creator</span><strong>$0.20</strong></li><li><span>Project or funding pool</span><strong>$0.20</strong></li><li><span>Platform infrastructure</span><strong>$0.10</strong></li></ul></StoneCard>
      </section>
      {close.length > 0 && (
        <section aria-label="Close to a milestone" className="stack"><h2>Close to a milestone</h2>
          {close.map(({ p, m }) => <StoneCard key={p.id} className="stack stack--sm"><Link to={`/project/${p.id}`}><strong>{p.title}</strong></Link><FundingMilestone milestone={m} projectId={p.id} /></StoneCard>)}
        </section>
      )}
      <section aria-label="Contribution history" className="stack"><div className="row row--between"><h2>Contribution history</h2><span className="muted">{cents(sel.remainingToday(s))} left to contribute today</span></div><ContributionHistory items={s.contributions} limit={12} /></section>
    </div>
  );
}
