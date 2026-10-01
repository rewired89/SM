import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const Ctx = createContext(null);
export const useUI = () => useContext(Ctx);

export function UIProvider({ children }) {
  const [modal, setModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const openModal = useCallback((type, props = {}) => setModal({ type, props }), []);
  const closeModal = useCallback(() => setModal(null), []);
  const toast = useCallback((text, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t.slice(-2), { id, text, tone: opts.tone || 'default', to: opts.to }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts.ms || 3600);
  }, []);
  const value = useMemo(() => ({ modal, toasts, openModal, closeModal, toast }), [modal, toasts, openModal, closeModal, toast]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
