import AppShell from './components/layout/AppShell.jsx';
import { useRoute } from './lib/router.js';
import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import Ideas from './pages/Ideas.jsx';
import Projects from './pages/Projects.jsx';
import AIHub from './pages/AIHub.jsx';
import Communities from './pages/Communities.jsx';
import Fund from './pages/Fund.jsx';
import Messages from './pages/Messages.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';
import SearchPage from './pages/SearchPage.jsx';
import FilterPage from './pages/FilterPage.jsx';
import Play from './pages/Play.jsx';
import Rewards from './pages/Rewards.jsx';
import ArcadePage from './pages/ArcadePage.jsx';
import PlayGame from './pages/PlayGame.jsx';
import IdeaPage from './components/ideas/IdeaPage.jsx';
import ProjectPage from './components/projects/ProjectPage.jsx';
import AIToolPage from './components/ai/AIToolPage.jsx';
import CommunityPage from './components/communities/CommunityPage.jsx';

function Router() {
  const { parts } = useRoute();
  const [a, b] = parts;
  const dec = b && decodeURIComponent(b);
  switch (a) {
    case undefined: return <Home />;
    case 'explore': return <Explore />;
    case 'ideas': return <Ideas />;
    case 'idea': return <IdeaPage id={dec} />;
    case 'projects': return <Projects />;
    case 'project': return <ProjectPage id={dec} />;
    case 'ai': return dec ? <AIToolPage id={dec} /> : <AIHub />;
    case 'rewards': return <Rewards />;
    case 'arcade': return <ArcadePage id={dec} />;
    case 'play': return dec ? <PlayGame key={dec} id={dec} /> : <Play />;
    case 'communities': return <Communities />;
    case 'community': return <CommunityPage id={dec} />;
    case 'fund': return <Fund />;
    case 'messages': return <Messages id={dec} />;
    case 'notifications': return <Notifications />;
    case 'profile': return <Profile />;
    case 'u': return <Profile userId={dec} />;
    case 'search': return <SearchPage />;
    case 'tag': return <FilterPage key={dec} kind="tag" value={dec} />;
    case 'category': return <FilterPage key={dec} kind="category" value={dec} />;
    default: return <Home />;
  }
}

export default function App() {
  return <AppShell><Router /></AppShell>;
}
