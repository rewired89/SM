# CODEMAP

```
index.html                     entry, fonts, favicon
src/main.jsx                   providers (UI → Store) + styles
src/App.jsx                    route switch (hash router)
src/lib/                       themes.js (color pairs, 2 locked), arcade.js (Cloud Hop, Star Catch, Perfect Stop), rewards.js (sparks, shop, achievements), learn.js (adaptive pick, badges, applyLearn), router.js (useRoute/Link/navigate), format.js, analyzers.js (simulated AI outputs)
src/data/                      games.js (game defs, hub chips, seeded challenges), questions.js (all banks + metadata), users, projects(+milestones), ideas(+STAGES), tools(+agents), communities, posts, social (notifications, conversations, seed comments)
src/store/
  initialState.js              defaults + 25 seeded $0.50 contributions
  reducer.js                   actions, applyContribution (funding deltas, milestone notification)
  selectors.js                 lookups, funding math, rankFeed (recommendation), search, contributionStats
  StoreProvider.jsx            useStore() → { s, a }; actions: follow/like/save/join/interest/comment/contribute/sendCollab/createPost/createEntity/messages
  UIProvider.jsx               modal + toasts (useUI)
src/styles/                    tokens.css, base.css (stone + grain), ui.css (glass, tile, buttons, forms, modal), layout.css (shell, nav, mobile), pages.css
src/components/
  ui/                          Icon, GlassPanel, StoneCard, TactileButton, IconButton, Badge, Avatar, ProgressBar, Tabs, Modal, Empty, Tag
  layout/                      Backdrop (clouds + waves), AppShell, TopBar, Sidebar, MobileNav, RightRail, Logo
  common/bits.jsx              PersonChip, SupportBtn, FollowBtn, StageBadge, NeedsList
  feed/                        Feed, PostCard, PostActions, PostComposer, CommentThread
  ideas/                       IdeaCard, IdeaPage (+Stepper)
  projects/                    ProjectCard, ProjectPage, ProjectUpdate, FundingMilestone
  ai/                          AIToolCard, AIToolPage, AIToolDemo, MicroContribution
  communities/                 CommunityCard (+JoinBtn), CommunityPage
  profile/                     ProfileProjects, ProfileActivity, ContributionHistory
  games/                       ArcadeCard, QuizGame, DodgeGame, RunnerGame, prompts, ResultScreen, GameCard, GameBreak, GameResultCard, BrainMap, BadgeShelf, LearningToday, OfflineBanner, useLoop
  common/ThemePicker.jsx       color pair picker
  modals/                      SupportModal, CollaborationModal, CreateModal (+Challenge), ThemeModal, ModalHost
src/pages/                     Rewards, ArcadePage, Play (hub), PlayGame, Home, Explore, Ideas, Projects, AIHub, Communities, Fund, Messages, Notifications, Profile, SearchPage, FilterPage (tag/category)
```

Routes: `/rewards`, `/arcade/:id[?offline=1]`, `/play`, `/play/:gameId|challengeId[?daily=1|offline=1]`, `/`, `/explore`, `/ideas`, `/idea/:id`, `/projects`, `/project/:id`, `/ai`, `/ai/:toolId`, `/communities`, `/community/:id`, `/fund`, `/messages[/:cvId]`, `/notifications`, `/profile`, `/u/:userId`, `/search?q=`, `/tag/:tag`, `/category/:name`.
