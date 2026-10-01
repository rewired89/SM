import { useEffect, useState } from 'react';
import { GlassPanel, TactileButton } from '../ui/index.jsx';
import { useUI } from '../../store/UIProvider.jsx';

export default function OfflineBanner() {
  const { simOffline, setSimOffline } = useUI();
  const [off, setOff] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const on = () => { setOff(false); setHidden(false); }, down = () => { setOff(true); setHidden(false); };
    window.addEventListener('online', on); window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', down); };
  }, []);
  if ((!off && !simOffline) || hidden) return null;
  return (
    <GlassPanel className="offline row" role="status">
      <span aria-hidden="true" style={{ fontSize: '1.6rem' }}>📡</span>
      <div className="grow"><span className="eyebrow">No connection</span><p><strong>But your brain still works.</strong></p></div>
      <TactileButton variant="primary" size="sm" to="/play/runner?offline=1">Play offline</TactileButton>
      <TactileButton variant="ghost" size="sm" onClick={() => { setHidden(true); setSimOffline(false); }}>Dismiss</TactileButton>
    </GlassPanel>
  );
}
