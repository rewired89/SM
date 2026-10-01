import { useState } from 'react';
import { GlassPanel, Avatar, Tabs, TactileButton, Tag, Empty } from '../components/ui/index.jsx';
import { FollowBtn } from '../components/common/bits.jsx';
import ProfileProjects from '../components/profile/ProfileProjects.jsx';
import ProfileActivity from '../components/profile/ProfileActivity.jsx';
import ContributionHistory from '../components/profile/ContributionHistory.jsx';
import BrainMap from '../components/games/BrainMap.jsx';
import BadgeShelf from '../components/games/BadgeShelf.jsx';
import LearningToday from '../components/games/LearningToday.jsx';
import ThemePicker from '../components/common/ThemePicker.jsx';
import PostCard from '../components/feed/PostCard.jsx';
import IdeaCard from '../components/ideas/IdeaCard.jsx';
import AIToolCard from '../components/ai/AIToolCard.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import * as sel from '../store/selectors.js';
import { navigate, Link } from '../lib/router.js';
import { ME } from '../data/users.js';
import { SHOP } from '../lib/rewards.js';
import { careerLabel, SOCIALS } from '../lib/profile.js';
import { cents } from '../lib/format.js';

export default function Profile({ userId }) {
  const { s, a } = useStore();
  const id = userId || ME;
  const user = sel.userById(id);
  const mine = id === ME;
  const [tab, setTab] = useState('projects');
  if (!user) return <Empty title="Person not found"><Link to="/explore" className="btn">Explore</Link></Empty>;
  const projects = sel.allProjects(s).filter((p) => p.ownerId === id);
  const ideas = sel.allIdeas(s).filter((i) => i.authorId === id);
  const tools = sel.allTools(s).filter((t) => t.creatorId === id);
  const tabs = [
    { id: 'projects', label: `Projects ${projects.length}` }, { id: 'ideas', label: `Ideas ${ideas.length}` }, { id: 'tools', label: `AI tools ${tools.length}` }, { id: 'activity', label: 'Activity' },
    ...(mine ? [{ id: 'brain', label: 'Brain map' }, { id: 'contrib', label: 'Contributions' }, { id: 'following', label: 'Following' }, { id: 'saved', label: 'Saved' }, { id: 'look', label: 'Appearance' }] : []),
  ];
  const followedProjects = s.following.filter((k) => k.startsWith('project:')).map((k) => sel.projectById(s, k.slice(8))).filter(Boolean);
  const followedIdeas = s.following.filter((k) => k.startsWith('idea:')).map((k) => sel.ideaById(s, k.slice(5))).filter(Boolean);
  const followedUsers = s.following.filter((k) => k.startsWith('user:')).map((k) => sel.userById(k.slice(5))).filter(Boolean);
  const message = () => navigate(`/messages/${a.startConversation(id)}`);
  return (
    <div className="stack stack--lg">
      <GlassPanel className="page-head profile-head">
        <div className="row row--wrap profile-id">
          <Avatar user={user} size={84} />
          <div className="grow">
            <h1>{user.name}</h1>
            <span className="muted">@{user.handle} · {user.location}</span>
            {mine && s.rewards.equipped.title && <div><span className="badge badge--accent">{SHOP.find((x) => x.id === s.rewards.equipped.title)?.text}</span></div>}
            <div className="secondary">{user.headline.join(' • ')}</div>
          </div>
          {mine ? <TactileButton to="/settings" icon="settings">Edit profile</TactileButton> : <div className="row"><FollowBtn type="user" id={id} name={user.name} size="md" /><TactileButton icon="mail" onClick={message}>Message</TactileButton></div>}
        </div>
        <div className="stack stack--sm"><span className="eyebrow">About</span><p className="secondary">{user.bio}</p></div>
        <div className="chips">
          {user.career && <span className="badge badge--accent">💼 {careerLabel(user.career)}</span>}
          {user.openToCollab && <span className="badge badge--success">🤝 Open to collaborations</span>}
          {user.openToCollab && user.collabTypes.map((t) => <span key={t} className="badge badge--plain">{t}</span>)}
        </div>
        {user.interests?.length > 0 && <div className="chips chips--tags">{user.interests.map((t) => <Tag key={t} tag={t} />)}</div>}
        {Object.keys(user.socials || {}).length > 0 && <div className="chips" aria-label="Links">{SOCIALS.filter((x) => user.socials[x.id]).map((x) => <a key={x.id} className="linkchip" href={user.socials[x.id]} target="_blank" rel="noopener noreferrer">{x.label}<span className="sr-only"> (opens in a new tab)</span></a>)}</div>}
        <div className="stack stack--sm"><span className="eyebrow">Skills</span><div className="chips">{user.skills.map((k) => <Link key={k} to={`/search?q=${k}`} className="chip">{k}</Link>)}</div></div>
      </GlassPanel>
      <Tabs label="Profile sections" tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'projects' && <ProfileProjects projects={projects} />}
      {tab === 'ideas' && (ideas.length ? <div className="grid grid--2">{ideas.map((i) => <IdeaCard key={i.id} idea={i} embedded />)}</div> : <Empty title="No ideas yet" />)}
      {tab === 'tools' && (tools.length ? <div className="grid grid--2">{tools.map((t) => <AIToolCard key={t.id} tool={t} />)}</div> : <Empty title="No AI tools yet" />)}
      {tab === 'activity' && <ProfileActivity userId={id} />}
      {mine && tab === 'brain' && (<div className="stack stack--lg"><div className="tile"><LearningToday /></div><BrainMap /><BadgeShelf /></div>)}
      {mine && tab === 'look' && (<div className="stack"><h2>Colors</h2><p className="secondary">Choose a pair of colors for Nomi.</p><ThemePicker /></div>)}
      {mine && tab === 'contrib' && (<div className="stack"><div className="row row--between"><h2>Contribution history</h2><strong>{cents(sel.contributionStats(s).total)} total</strong></div><ContributionHistory items={s.contributions} /></div>)}
      {mine && tab === 'following' && (
        <div className="stack">
          <h2>Projects</h2>{followedProjects.length ? <div className="grid grid--2">{followedProjects.map((p) => <a key={p.id} className="tile tile--interactive" href={`#/project/${p.id}`}><strong>{p.title}</strong><div className="muted">{p.tagline}</div></a>)}</div> : <Empty title="Not following any projects" />}
          <h2>Ideas</h2>{followedIdeas.length ? <div className="grid grid--2">{followedIdeas.map((i) => <a key={i.id} className="tile tile--interactive" href={`#/idea/${i.id}`}><strong>{i.title}</strong><div className="muted">{i.pitch}</div></a>)}</div> : <Empty title="Not following any ideas" />}
          <h2>People</h2><div className="chips">{followedUsers.map((u) => <Link key={u.id} to={`/u/${u.id}`} className="chip">{u.name}</Link>)}</div>
        </div>
      )}
      {mine && tab === 'saved' && (s.saved.length ? <div className="stack">{s.saved.map((pid) => sel.postById(s, pid)).filter(Boolean).map((p) => <PostCard key={p.id} post={p} />)}</div> : <Empty title="Nothing saved yet">Tap the bookmark on any post.</Empty>)}
    </div>
  );
}
