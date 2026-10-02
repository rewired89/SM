# CODEMAP

```
index.html                     entry, fonts, favicon
src/main.jsx                   providers (UI → Store) + styles
src/App.jsx                    route switch (hash router)
src/lib/                       auth.js (accounts, email code), review.js (rubric, scoring), media.js (IndexedDB files, link parsing), profile.js (careers, collab types, socials, validation), themes.js (color pairs, 2 locked), arcade.js (Cloud Hop, Star Catch, Perfect Stop), rewards.js (sparks, shop, achievements), learn.js (adaptive pick, badges, applyLearn), router.js (useRoute/Link/navigate), format.js, analyzers.js (simulated AI outputs)
src/data/                      trust.js (80 threshold, seeded approvals), games.js (game defs, hub chips, seeded challenges), questions.js (all banks + metadata), users, projects(+milestones), ideas(+STAGES), tools(+agents), communities, posts, social (notifications, conversations, seed comments)
src/store/
  initialState.js              defaults + 25 seeded $0.50 contributions
  reducer.js                   actions, applyContribution (funding deltas, milestone notification)
  selectors.js                 lookups, funding math, rankFeed (recommendation), search, contributionStats
  StoreProvider.jsx            useStore() → { s, a }; actions: follow/like/save/join/interest/comment/contribute/sendCollab/createPost/createEntity/messages
  UIProvider.jsx               modal + toasts (useUI)
src/styles/                    tokens.css, base.css (stone + grain), ui.css (glass, tile, buttons, forms, modal), layout.css (shell, nav, mobile), pages.css
src/components/
  ui/                          Icon, GlassPanel, StoneCard, TactileButton, IconButton, Badge, Avatar, ProgressBar, Tabs, Modal, Empty, Tag
  layout/                      SearchBox (suggestions, /collab_ jump), Backdrop (clouds + waves), AppShell, TopBar, Sidebar, MobileNav, RightRail, Logo
  common/CollabSummary.jsx     collab one-liner linking to /collab/:slug
  common/bits.jsx              PersonChip, SupportBtn, FollowBtn, StageBadge, NeedsList
  feed/                        Feed, PostCard, PostActions, PostComposer, CommentThread
  ideas/                       IdeaCard, IdeaPage (+Stepper)
  projects/                    ProjectStory (problem, experiments, budget table), ProjectCard, ProjectPage, ProjectUpdate, FundingMilestone
  ai/                          AIToolCard, AIToolPage, AIToolDemo, MicroContribution
  communities/                 CommunityCard (+JoinBtn), CommunityPage
  profile/                     ProfileProjects, ProfileActivity, ContributionHistory
  auth/                        AuthGate (session, useAuth), AuthPage
  trust/                       IdentityFlow, ReviewForm, ReviewResult, TrustBadge
  media/                       MediaPicker, MediaGrid, LinkChips, Attachments
  settings/                    SettingsPanels (profile, interests, links, collab), PaymentSetup, PaymentsPanel
  games/                       ArcadeCard, QuizGame, DodgeGame, RunnerGame, prompts, ResultScreen, GameCard, GameBreak, GameResultCard, BrainMap, BadgeShelf, LearningToday, OfflineBanner, useLoop
  common/ThemePicker.jsx       color pair picker
  modals/                      SupportModal, CollaborationModal, CreateModal (+Challenge), ThemeModal, PaymentModal, ModalHost
src/pages/                     Apply (project application wizard), RoomPage (private team room), FundingReadiness, Trust, CollabPage, Settings, Rewards, ArcadePage, Play (hub), PlayGame, Home, Explore, Ideas, Projects, AIHub, Communities, Fund, Messages, Notifications, Profile, SearchPage, FilterPage (tag/category)
```

Routes: `/apply[/:id]`, `/room/:projectId`, `/funding/:projectId`, `/trust`, `/collab_<name>` (and `/collab/:slug`), `/settings`, `/rewards`, `/arcade/:id[?offline=1]`, `/play`, `/play/:gameId|challengeId[?daily=1|offline=1]`, `/`, `/explore`, `/ideas`, `/idea/:id`, `/projects`, `/project/:id`, `/ai`, `/ai/:toolId`, `/communities`, `/community/:id`, `/fund`, `/messages[/:cvId]`, `/notifications`, `/profile`, `/u/:userId`, `/search?q=`, `/tag/:tag`, `/category/:name`.

Docs: `docs/TRUST_AND_SAFETY.md` (what is simulated, what a real build needs, open legal questions).
