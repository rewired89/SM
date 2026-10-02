import { useState } from 'react';
import { Link, back } from '../lib/router.js';
import { GlassPanel, StoneCard, TactileButton, Badge, Empty } from '../components/ui/index.jsx';
import IdentityFlow from '../components/trust/IdentityFlow.jsx';
import ReviewForm from '../components/trust/ReviewForm.jsx';
import ReviewResult from '../components/trust/ReviewResult.jsx';
import TrustBadge from '../components/trust/TrustBadge.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import * as sel from '../store/selectors.js';
import { THRESHOLD } from '../data/trust.js';
import { ME } from '../data/users.js';

const Step = ({ n, done, title, children }) => (
  <StoneCard className="checklist-card">
    <div className="row"><span className={`step-no ${done ? 'is-done' : ''}`} aria-hidden="true">{done ? '✓' : n}</span><h2>{title}</h2>{done && <Badge tone="success">Done</Badge>}</div>
    {children}
  </StoneCard>
);

export default function FundingReadiness({ id }) {
  const { s, a } = useStore();
  const [open, setOpen] = useState(null);
  const p = sel.projectById(s, id);
  if (!p) return <Empty title="Project not found"><Link to="/projects" className="btn">Browse projects</Link></Empty>;
  const review = sel.reviewOf(s, id);
  const gate = sel.fundable(s, 'project', p);
  const owner = sel.userById(p.ownerId);
  const mine = p.ownerId === ME;
  const idOk = s.identity.status === 'verified';
  const revOk = !!review && review.score >= THRESHOLD;

  return (
    <div className="stack stack--lg">
      <div className="row row--between"><TactileButton variant="ghost" size="sm" icon="back" onClick={back}>Back</TactileButton><Link to={`/project/${p.id}`} className="btn btn--sm">Open the project</Link></div>
      <GlassPanel className="page-head">
        <span className="eyebrow">Funding for</span>
        <h1>{p.title}</h1>
        <TrustBadge project={p} />
        {gate.ok
          ? <div className="banner banner--success"><strong>Funding is open</strong><span>Supporters can contribute to this project.</span></div>
          : <div className="banner banner--warn"><strong>Funding is not enabled</strong><ul>{gate.reasons.map((r) => <li key={r}>• {r}</li>)}</ul><span className="muted">The project stays public and people can still follow it and collaborate.</span></div>}
        <p className="muted">How this works: <Link to="/trust" className="accent">Trust and safety</Link></p>
      </GlassPanel>

      {!mine ? (
        <section className="stack"><h2>What has been checked</h2>
          <StoneCard className="stack stack--sm"><div>{revOk ? '✓' : '✗'} Project review {review ? `${review.score}/100` : 'not done'} (needs {THRESHOLD})</div><div>✓ Creator: {owner.name}</div></StoneCard>
          {review && <ReviewResult review={review} />}
        </section>
      ) : (
        <>
          <Step n={1} done={idOk} title="Verify who you are">
            <p className="secondary">Backers should know a real, accountable person is behind the project. This takes about two minutes.</p>
            {open === 'id' || idOk || s.identity.status === 'failed' ? <IdentityFlow /> : <div><TactileButton variant="primary" onClick={() => setOpen('id')}>Start identity verification</TactileButton></div>}
          </Step>
          <Step n={2} done={revOk} title="Project review">
            <p className="secondary">Send your pitch deck, README, repository and any videos. You need {THRESHOLD} out of 100 to receive funds. Below that, your project is still posted, just without the Fund button.</p>
            {review && open !== 'review' && <ReviewResult review={review} />}
            {open === 'review' ? <ReviewForm project={p} onResult={() => setOpen(null)} /> : <div><TactileButton variant={review ? 'default' : 'primary'} onClick={() => setOpen('review')}>{review ? 'Improve and resubmit' : 'Submit for review'}</TactileButton></div>}
          </Step>
          <Step n={3} done={s.payout.connected} title="Connect a payout account">
            <p className="secondary">Money goes straight to your own verified account through our payment partner, never through ours. (Sandbox in this prototype.)</p>
            {s.payout.connected ? <p className="muted">{s.payout.label} connected.</p> : <div><TactileButton variant="primary" onClick={a.connectPayout}>Connect payout account (sandbox)</TactileButton></div>}
          </Step>
        </>
      )}
    </div>
  );
}
