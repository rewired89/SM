import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AuthPage from './AuthPage.jsx';
import { StoreProvider } from '../../store/StoreProvider.jsx';
import { setMe } from '../../data/users.js';
import { getSession, getAccount, startSession, endSession, registerAll, deleteAccount } from '../../lib/auth.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export default function AuthGate({ children }) {
  registerAll();
  const [accountId, setAccountId] = useState(() => { const s = getSession(); return s && getAccount(s.accountId) ? s.accountId : null; });
  const signIn = useCallback((id) => { startSession(id); setAccountId(id); window.location.hash = '#/'; }, []);
  const signOut = useCallback(() => { endSession(); setAccountId(null); window.location.hash = '#/'; }, []);
  const remove = useCallback((id) => { deleteAccount(id); setAccountId(null); window.location.hash = '#/'; }, []);
  const value = useMemo(() => ({ account: accountId ? getAccount(accountId) : null, signOut, remove }), [accountId, signOut, remove]);
  if (!accountId) return <AuthPage onAuth={signIn} />;
  setMe(accountId);
  return (
    <Ctx.Provider value={value}>
      <StoreProvider key={accountId} accountId={accountId}>{children}</StoreProvider>
    </Ctx.Provider>
  );
}
