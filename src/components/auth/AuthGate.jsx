import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AuthPage from './AuthPage.jsx';
import BanPage from './BanPage.jsx';
import { getBan, clearBan } from '../../lib/bans.js';
import { StoreProvider } from '../../store/StoreProvider.jsx';
import { setMe } from '../../data/users.js';
import { getSession, getAccount, startSession, endSession, registerAll, deleteAccount } from '../../lib/auth.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export default function AuthGate({ children }) {
  registerAll();
  const [accountId, setAccountId] = useState(() => { const s = getSession(); return s && getAccount(s.accountId) ? s.accountId : null; });
  const [, bump] = useState(0);
  const applyBan = useCallback(() => { bump((n) => n + 1); }, []);
  const signIn = useCallback((id) => { startSession(id); setAccountId(id); window.location.hash = '#/'; }, []);
  const signOut = useCallback(() => { endSession(); setAccountId(null); window.location.hash = '#/'; }, []);
  const remove = useCallback((id) => { deleteAccount(id); setAccountId(null); window.location.hash = '#/'; }, []);
  const value = useMemo(() => ({ account: accountId ? getAccount(accountId) : null, signOut, remove, applyBan }), [accountId, signOut, remove, applyBan]);
  if (!accountId) return <AuthPage onAuth={signIn} />;
  const ban = getBan(accountId);
  if (ban) return <BanPage account={getAccount(accountId)} ban={ban} onSignOut={signOut} onClear={() => { clearBan(accountId); try { if (ban.permanent) localStorage.removeItem(accountId === 'u_dayana' ? 'nomi_state_v1' : `nomi_state_v1:${accountId}`); } catch { /* ignore */ } bump((n) => n + 1); }} />;
  setMe(accountId);
  return (
    <Ctx.Provider value={value}>
      <StoreProvider key={accountId} accountId={accountId}>{children}</StoreProvider>
    </Ctx.Provider>
  );
}
