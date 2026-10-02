# Nomi

Social platform prototype: people discover ideas, projects, AI tools and communities, then help them exist (collaborate, support with $0.50 simulated contributions). Participation over popularity.

## Git rules (mandatory)

- COMMIT AND PUSH EVERYTHING TO MAIN. DO NOT CREATE NEW BRANCHES.
- Author: rewired89 (sanchezleal1989@gmail.com).
- Never rewrite whole files, edit only the changed blocks. Never leave merge artifacts.
- If a build fails, do not roll back code. Stop conflicting background syncs and fix forward.
- After every build, update CLAUDE.md and CODEMAP.md if needed.

## Working style

- Windows user: CLI commands must be PowerShell.
- Challenge flawed ideas and validate that an idea does not already exist before building it.
- Be concise. No narration, no step labels, no recaps. Replace long dashes in text with commas.

## Stack

React 18 + Vite, plain CSS (no UI libs), hash router, client-side state with `useReducer`, persisted to `localStorage` (`nomi_state_v1`). All data is mock, all money is simulated.

## Deploy (GitHub Pages)

The repo root `index.html` is Vite source and cannot run in a browser, so Pages must serve the build. `.github/workflows/deploy.yml` builds and deploys `dist` on every push to main. One-time setup: repo Settings → Pages → Build and deployment → Source: GitHub Actions. Vite `base` is `./` and routing is hash based, so it works under `https://<user>.github.io/<repo>/`.

## Commands (PowerShell)

```powershell
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Product rules

- Distinguish clearly: free usage, optional contribution, real service fees. Never disguise a donation as a fee.
- Support copy says Support or Contribute, never DONATE NOW. Default amount is $0.50.
- Direct support: 100% to the target. Usage micro-contribution split: $0.20 tool creator, $0.20 project pool, $0.10 platform. Always labeled prototype.
- Every action must produce a visible result. No dead buttons.
- Recommendations are deterministic (`rankFeed` in `store/selectors.js`), no ML.

## Design system

Light soft-UI theme from the reference images: pale stone base with grain, sky-blue and pink cloud gradients, white frosted panels, raised white pill for active states, blue accent for action, red badges for unread, blue/grey message bubbles, Inter 800 display type. Tokens in `src/styles/tokens.css` (stone, panel, accent, text, status). Hierarchy: stone (foundation) → glass (information) → accent (activity) → content (meaning). Primitives: `.glass`, `.tile`, `.btn` (rest/hover/press 150-250ms), respect `prefers-reduced-motion`.

## Themes

`src/lib/themes.js`: six two-color pairs (Sky & Blush, Pink & Teal, Teal & Pink, Pink & Purple, Purple & Teal, Violet & Gold). `applyTheme` sets CSS variables (`--accent`, `--accent2`, `--hero-*`, `--bg-a/b`) on `<html>`. Picker in the top bar palette button and Profile → Appearance. Never hardcode blue or pink in CSS, use the variables.

## Play & Learn

Games are 20-90 second experiences, never quizzes-for-points. Every item has metadata (`category`, `topic`, `difficulty`, `skill`, `explanation`, `takeaway`, `source`, `sourceType`) in `src/data/questions.js`. Rules: no energy, no streak punishment, no loot, no IQ claims, no fabricated citations, sometimes "not enough information" is correct. Difficulty means more reasoning, not more trivia. Adaptive level in `lib/learn.js` (`pickNext`, `startLevel`). Learning state lives in `state.learn` (stats, topics, lessons, badges, xp, plays, daily). Games: Phish or Fine, Fallacy Fighter, Human Moment, Two Seconds of Science, AI or Human, Logic Lab, Knowledge Dodge (canvas lanes), Privacy Runner (canvas jump, also the offline game), Money Sense, Past & Culture, plus community challenges (creatable via Create → Challenge).

## Arcade and Rewards

Inline one-button games live in the feed (`ArcadeCard`, positions 4, 9, 13 of For you) and at `/arcade/:id` and `/play`. Defined in `src/lib/arcade.js` (Cloud Hop is the dino-style offline game, Star Catch, Perfect Stop). Win to earn sparks (`src/lib/rewards.js`): win +10, flawless +5, first win of day +5, daily cap 60. Sparks cannot be bought, never expire, no loss mechanics, no loot boxes. Spend on avatar rings, titles, locked palettes (Sunset, Mint & Lilac) or to cheer projects (5 sparks, non-monetary). State in `state.rewards`. Page: `/rewards`.

## Ambient background

`components/layout/Backdrop.jsx`: drifting clouds and three layered waves filled from `--accent` and `--accent2`, so waves follow the chosen palette. Toggle in the color picker (`state.ambient`). Respects reduced motion.

## Media, profile and payments

- Posts take photos (8 MB), videos (50 MB), PDF and PowerPoint (25 MB) and links (`MediaPicker`, `MediaGrid`, `LinkChips`). Files live in IndexedDB (`src/lib/media.js`), post metadata in state. Seeded media is static under `public/media`. PDFs preview inline, PPTX is download-only. Only http(s) links, GitHub repos get a repo chip. Feed tab Watch shows video posts.
- Profile editing at `/settings` (photo, name, @username, bio, skills, hashtags, career incl. "Still in progress", social links, Open to collaborations plus collaborator types, payments, colors). The signed-in user's edits are merged into the shared user record in `StoreProvider` (`applyProfile`). Options live in `src/lib/profile.js`.
- Payments are SIMULATED. No card number is ever requested or stored, adding a method creates a sandbox method (credit card or Cash App recommended, debit allowed with a warning). A method is required only to contribute. Monthly limit (`monthlyLimit`, `wallet` = remaining). A real build must use the processor's hosted fields.

## Collaboration pages

Canonical URL is `/collab_<project-name>` (also `/collab/:slug`), page `pages/CollabPage.jsx`: collaborator count, open roles, funding needed, raised and remaining, team, role filter, matched open-to-collab people. Anyone can request to join as Collaborator, Co-founder, Advisor or Contributor (`CollaborationModal`). The founder decides: pending requests show on their collab page with Say yes / Not now (`decideCollab`), accepted people join the team (`collabTeam`). Simulated founders accept non-co-founder requests after ~5s and ask to talk first for co-founder. Request shape lives in `state.collabRequests` (`fromId`, `role`, `status`).

The top bar search (`SearchBox`) understands `/collab_name` (jumps to that page), `#hashtag` and plain words, with live suggestions. Hashtag searches show a banner listing every project and idea with that tag (for example #Bioelectricity: Acheron, NeuroMap, Bioelectric Memory) and each card links to its collab page via `CollabSummary`.

## Accounts, review and funding gate (all simulated)

- `AuthGate` (main.jsx) shows `AuthPage` until signed in: passwordless email code (demo shows the code), or the demo account Dayana. Each account has its own state key `nomi_state_v1:<id>`, `ME` in `data/users.js` is a live binding set by `setMe`. New accounts start empty. Sign out and delete in Settings → Account and the sidebar.
- Money can only go to things that pass `fundable()`: projects need a review score of 80+ (`lib/review.js`, rubric on `/trust`), a verified creator (`state.identity`) and a payout account (`state.payout`). Created ideas cannot receive money, created tools need a verified creator. Seeded projects are pre-approved (`data/trust.js`). Blocked items show "Funding not enabled" and stay public.
- `/funding/:projectId` is the creator checklist: identity (`IdentityFlow`, sandbox outcomes), project review (`ReviewForm`, `ReviewResult`), payout. `TrustBadge` shows status on cards and pages. Report button on projects. Never collect real ID or card data in the prototype.
- Plan, vendors and legal questions: `docs/TRUST_AND_SAFETY.md`.

## State shape

`reviews`, `identity`, `payout`, `reports`, `profile`, `payments`, `monthlyLimit`, `theme`, `ambient`, `rewards`, `learn`, `created.challenges`, `following` (`type:id`), `liked`, `saved`, `joined`, `interested`, `deltas` (funding per `type:id`), `contributions`, `comments` (`post:id`, `idea:id`, `project:id`, `disc:id`), `notifications`, `conversations`, `createdPosts`, `created.{projects,ideas,tools,communities,milestones}`, `collabRequests`, `toolUses`, `viewed`, `wallet`.

## Demo path

Home → Project Aurora → follow → milestone/updates → related tool (Research Assistant) → use it 3 times → micro-contribution prompt → Support $0.50 on a project → progress moves → creator posts update after ~7s → notification → Fund page / profile history. Hearthlight is $0.40 from a milestone for the "milestone complete" moment.
