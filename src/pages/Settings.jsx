import { useState } from 'react';
import { Tabs, GlassPanel, StoneCard, TactileButton } from '../components/ui/index.jsx';
import { ProfilePanel, InterestsPanel, LinksPanel, CollabPanel } from '../components/settings/SettingsPanels.jsx';
import PaymentsPanel from '../components/settings/PaymentsPanel.jsx';
import ThemePicker from '../components/common/ThemePicker.jsx';
import IdentityFlow from '../components/trust/IdentityFlow.jsx';
import { useAuth } from '../components/auth/AuthGate.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import { Link } from '../lib/router.js';

const TABS = [['profile', 'Profile'], ['interests', 'Interests and career'], ['links', 'Links'], ['collab', 'Collaboration'], ['pay', 'Payments'], ['verify', 'Verification'], ['account', 'Account'], ['look', 'Appearance'], ['data', 'Data']].map(([id, label]) => ({ id, label }));

export default function Settings() {
  const { a } = useStore();
  const auth = useAuth();
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
        {tab === 'verify' && <div className="stack"><h2>Verify your identity</h2><p className="secondary">Required only if you want to receive funds. Everyone else can skip it.</p><IdentityFlow /></div>}
        {tab === 'account' && (
          <div className="stack">
            <h2>Account</h2>
            <p className="secondary">Signed in as <strong>{auth.account.email}</strong>{auth.account.demo ? ' (demo account)' : ''}.</p>
            <div className="row row--wrap"><TactileButton variant="primary" onClick={auth.signOut}>Sign out</TactileButton>{!auth.account.demo && <TactileButton onClick={() => { if (confirm('Delete this account and all its data on this device? This cannot be undone.')) auth.remove(auth.account.id); }}>Delete account</TactileButton>}</div>
            <p className="muted">Prototype accounts live in this browser only. Real accounts will support passkeys and two-step sign-in, required for anyone who receives funds.</p>
          </div>
        )}
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
