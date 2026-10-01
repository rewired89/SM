import { useEffect } from 'react';
import TopBar from './TopBar.jsx';
import Sidebar from './Sidebar.jsx';
import MobileNav from './MobileNav.jsx';
import RightRail from './RightRail.jsx';
import OfflineBanner from '../games/OfflineBanner.jsx';
import ModalHost from '../modals/ModalHost.jsx';
import { useRoute } from '../../lib/router.js';

export default function AppShell({ children }) {
  const { path } = useRoute();
  useEffect(() => { window.scrollTo({ top: 0 }); document.getElementById('main')?.focus({ preventScroll: true }); }, [path]);
  const wide = ['/explore', '/ideas', '/projects', '/ai', '/communities', '/fund', '/play'].some((p) => path === p);
  return (
    <>
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('main').focus(); }}>Skip to content</a>
      <TopBar />
      <div className={`shell ${wide ? 'shell--wide' : ''}`}>
        <Sidebar />
        <main id="main" tabIndex={-1} className="main"><OfflineBanner />{children}</main>
        {!wide && <RightRail />}
      </div>
      <MobileNav />
      <ModalHost />
    </>
  );
}
