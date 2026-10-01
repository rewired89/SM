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

## State shape

`theme`, `learn`, `created.challenges`, `following` (`type:id`), `liked`, `saved`, `joined`, `interested`, `deltas` (funding per `type:id`), `contributions`, `comments` (`post:id`, `idea:id`, `project:id`, `disc:id`), `notifications`, `conversations`, `createdPosts`, `created.{projects,ideas,tools,communities,milestones}`, `collabRequests`, `toolUses`, `viewed`, `wallet`.

## Demo path

Home → Project Aurora → follow → milestone/updates → related tool (Research Assistant) → use it 3 times → micro-contribution prompt → Support $0.50 on a project → progress moves → creator posts update after ~7s → notification → Fund page / profile history. Hearthlight is $0.40 from a milestone for the "milestone complete" moment.
