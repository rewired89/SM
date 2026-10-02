# Nomi

A social platform prototype where people discover ideas, projects, AI tools and communities, then help them exist: collaborate, learn through tiny games, and back projects with simulated $0.50+ contributions. Participation over popularity.

**Prototype.** All data is mock and all money, identity checks and refunds are simulated. No real card or ID data is ever collected.

Live site: https://rewired89.github.io/SM/ (deployed from `main` by GitHub Actions)

## Try it

Open the site, choose **Continue as demo (Dayana)** or create an account (passwordless, the demo shows your code).

| Do this | Where |
|---|---|
| Pick your colors (9 pairs, animated waves) | Palette button in the top bar |
| Back a project and request a meeting after $500 | Project → Support |
| Post a project with founders, budget and milestones | Create → Project (`/apply`) |
| Find collaborators | `/collab_<project>`, search `#bioelectricity` |
| Play tiny games and earn sparks | Play, or the feed |
| Try an AI tool in a locked sandbox | AI → Try in the sandbox (Log Whisperer) |
| Submit your own game or AI demo | `/games/submit`, `/ai/submit` |
| See the reviewer queue and moderation (demo account only) | `/admin` |

## Run locally (PowerShell)

```powershell
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Stack

React 18, Vite, plain CSS with theme variables, hash router, `useReducer` state saved to `localStorage` per account, IndexedDB for uploaded files. No backend.

## Ideas worth knowing

- **Funding gate:** money only reaches projects with a review score of 80+, a verified creator and a payout account. $500 per person per day.
- **Reputation:** founders earn trust from funded projects, milestones finished with posted evidence and regular updates. Strikes and suspensions lower it.
- **Conduct:** insults are blocked, three strikes in 30 days means a 3 day suspension, repeat offenses are permanent with simulated refunds.
- **Sandbox:** community games and AI demos run in a locked iframe (no network, no storage, no access to your device or to Nomi).

## Not real yet

The review scores, conduct filter, game reviewer and AI assistant are rule based stand-ins. A real build needs hosted payment fields, managed auth, an identity vendor, AI plus human review and a moderation service. See `docs/TRUST_AND_SAFETY.md`.

## Project docs

`CLAUDE.md` (rules and product decisions), `CODEMAP.md` (where things live), `docs/TRUST_AND_SAFETY.md`.
