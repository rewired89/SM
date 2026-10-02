import { GlassPanel, StoneCard, Badge } from '../components/ui/index.jsx';
import { RUBRIC } from '../lib/review.js';
import { THRESHOLD } from '../data/trust.js';

export default function Trust() {
  return (
    <div className="stack stack--lg">
      <div><h1>Trust and safety</h1><p className="secondary">People give small amounts to projects they believe in. Here is how Nomi tries to make sure those projects are real.</p></div>
      <GlassPanel className="banner banner--warn"><strong>Prototype notice</strong><span>This describes how the product is designed. Review, identity and payout steps are simulated in this prototype. The legal text on this page is a draft and has not been reviewed by a lawyer.</span></GlassPanel>

      <section className="stack"><h2>1. Project review ({THRESHOLD}+ to receive funds)</h2>
        <p className="secondary">Every project that wants money submits a pitch deck, a README, a repository link and any demos or channels. The first pass scores 100 points across the areas below. Under {THRESHOLD}, the project is still posted, just without a Fund button, and the creator sees exactly what to improve.</p>
        <div className="grid grid--2">{RUBRIC.map((r) => <StoneCard key={r.id} className="stack stack--sm"><div className="row row--between"><strong>{r.label}</strong><Badge>{r.max} pts</Badge></div><p className="muted">{r.tip}</p></StoneCard>)}</div>
        <p className="secondary"><strong>Honest limit:</strong> a score shows that evidence exists. It does not prove the science is right. Approval is never an endorsement or a guarantee of results. In the full product an AI model triages submissions and human experts make the final decision.</p>
      </section>

      <section className="stack"><h2>2. Identity checks</h2>
        <p className="secondary">Anyone who receives money verifies their identity with a licensed partner: a government ID and selfie, name and address matching the license, and a screening of public records limited to offenses relevant to fundraising (such as fraud and theft), plus sanctions lists. It only happens with the person's consent, they get a copy of any report, and they can dispute a result before it is final.</p>
        <p className="secondary"><strong>What Nomi keeps:</strong> verified or not, the date, and a reference number. We do not store IDs, addresses or record details. The partners may keep records as the law requires.</p>
        <p id="appeal" className="secondary"><strong>Appeals:</strong> if a check flags something, a human reviews it. Mistakes in public records happen, and an old or unrelated record should not silently end a project.</p>
      </section>

      <section className="stack"><h2>3. Where the money goes</h2>
        <p className="secondary">Contributions are charged to the backer's credit card or Cash App and paid out to the creator's own verified account through our payment partner. In the full product, money for a milestone is released when the creator posts evidence for it, and backers can ask for a refund if a project stops.</p>
      </section>

      <section className="stack"><h2>4. Founder moderation</h2>
        <p className="secondary">Money does not buy access. Founders choose who joins the private team room and who is on the team. They can hide comments and block people who harass them, which also stops those people from joining, commenting or seeing the room. This is meant for harassment, not for honest criticism. Blocked people can report it, and Nomi reviewers can step in.</p>
      </section>

      <section className="stack"><h2>5. See something wrong?</h2>
        <p className="secondary">Every project has a Report button. Reports go to a human reviewer, and funding can be paused while they look.</p>
      </section>
    </div>
  );
}
