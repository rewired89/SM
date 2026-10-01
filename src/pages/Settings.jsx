import { useState } from 'react';
import { Tabs, GlassPanel, StoneCard, TactileButton } from '../components/ui/index.jsx';
import { ProfilePanel, InterestsPanel, LinksPanel, CollabPanel } from '../components/settings/SettingsPanels.jsx';
import PaymentsPanel from '../components/settings/PaymentsPanel.jsx';
import ThemePicker from '../components/common/ThemePicker.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import { Link } from '../lib/router.js';

const TABS = [['profile', 'Profile'], ['interests', 'Interests and career'], ['links', 'Links'], ['collab', 'Collaboration'], ['pay', 'Payments'], ['look', 'Appearance'], ['data', 'Data']].map(([id, label]) => ({ id, label }));

export default function Settings() {
  const { a } = useStore();
  const [tab, setTab] = useState('profile');
  return (
    <div className="stack stack--lg">
      <div className="row row--between row--wrap"><div><h1>Settings</h1><p className="secondary">Make Nomi feel like yours.</p></div><Link to="/profile" className="btn">View my profile</Link></div>
      <Tabs label="Settings sections" tabs={TABS} value={tab} onChange={setTab} />
      <GlassPanel className="settings-panel" key={tab}>
        {tab === 'profile' && <ProfilePanel />}
        {tab === 'interests' && <InterestsPanel />}
        {tab === 'links' && <LinksPanel />}
        {tab === 'collab' && <CollabPanel />}
        {tab === 'pay' && <PaymentsPanel />}
        {tab === 'look' && <div className="stack"><h2>Colors</h2><ThemePicker /></div>}
        {tab === 'data' && (
          <div className="stack">
            <p className="secondary">This prototype keeps everything on this device: your profile, posts, uploaded files and settings. Nothing is sent to a server.</p>
            <div><TactileButton onClick={() => { if (confirm('Reset all demo data on this device?')) a.reset(); }} icon="refresh">Reset demo data</TactileButton></div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
