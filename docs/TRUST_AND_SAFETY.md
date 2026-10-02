# Trust and safety plan (draft, not legal advice)

Goal: people who give money can trust that a real, accountable person is behind a real project. Nothing here replaces a lawyer. Get one before taking real money.

## What the prototype simulates
- Passwordless email-code accounts (`lib/auth.js`), local to the browser.
- A rule-based project review out of 100, 80 needed to receive funds (`lib/review.js`, rubric shown at `/trust`).
- An identity check flow with sandbox outcomes (`components/trust/IdentityFlow.jsx`). No ID details are ever requested.
- A sandbox payout account and sandbox payment methods.
- Funding gate (`fundable` in `store/selectors.js`): project score 80+, creator verified, payout connected. Otherwise the project is public but has no Fund button.

## What a real build needs
| Piece | Use, do not build |
|---|---|
| Accounts | Managed auth (passkeys, email links, OAuth). MFA required for anyone who receives funds. |
| ID, selfie, name, address match | A provider such as Stripe Identity (document, selfie, ID number, address, phone checks) or Persona/Onfido. |
| Payouts and KYC | Stripe Connect. The processor must verify anyone who receives funds, so Nomi never holds card data or moves money itself. |
| Criminal records | A licensed screening company (for example Checkr) under the FCRA: standalone disclosure, written consent, pre-adverse-action and adverse-action notices, a way to dispute. |
| Project review | AI triage plus human experts who decide. |

## Design decisions and why
1. **A score proves evidence exists, not that the science is true.** The rubric checks deck, README, repository, demos, budget, team links, honest limits, safety and open materials. Experiment.com, a comparable science crowdfunding site, relies on staff scientists reviewing each project and on peer endorsements, and requires ethics-board support for human or animal work. Plan for human reviewers.
2. **"We keep no records" is right for ID documents, not for everything.** Nomi stores only: verified or not, date, vendor reference. Providers and processors keep what the law requires (money services rules often require retention). Do not promise users that nothing is kept anywhere.
3. **Criminal checks are narrow and fair.** Screen for offenses relevant to fundraising (fraud, theft), not any record. Give a human appeal. Check local law, since rules vary by state and country.
4. **The strongest anti-scam control is not the background check.** It is releasing money per milestone against posted evidence, with refunds if a project stops. Milestones already exist in the product, so enforce them at payout time.
5. **Credit card or Cash App is encouraged, debit is allowed with a warning.** Credit cards usually give stronger fraud protection. The reason is user protection, not Nomi's data exposure: the processor holds card data either way.
6. **A payment method is only required to contribute.** Browsing, playing, collaborating and messaging stay free.
7. **Approval is never an endorsement.** Copy says so on `/trust` and every funded project has a Report button.

## Open questions for a lawyer
- Are contributions donations, rewards or investments? Which registrations apply (charitable solicitation, money transmission, securities)?
- Tax reporting for creators and any platform fee.
- Terms of Service, Privacy Notice, ID and records consent text, retention periods, appeals process.
- Rules for minors (accounts are 18+) and for users outside the US.

## Sources checked
- Stripe Identity checks: https://docs.stripe.com/identity/verification-checks
- Stripe Connect identity verification for payouts: https://docs.stripe.com/connect/identity-verification
- FCRA consent and disclosure: https://help.checkr.com/s/article/360000144867-Disclosure-and-consent-for-background-checks
- Experiment.com review: https://experiment.com/faq
- Kickstarter creator verification: https://help.kickstarter.com/hc/en-us/articles/115005126474-How-do-I-know-a-project-creator-is-who-they-claim-they-are
