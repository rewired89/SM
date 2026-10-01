import { useUI } from '../../store/UIProvider.jsx';
import SupportModal from './SupportModal.jsx';
import CollaborationModal from './CollaborationModal.jsx';
import CreateModal from './CreateModal.jsx';
import { navigate } from '../../lib/router.js';

export default function ModalHost() {
  const { modal, toasts } = useUI();
  return (
    <>
      {modal?.type === 'support' && <SupportModal {...modal.props} />}
      {modal?.type === 'collab' && <CollaborationModal {...modal.props} />}
      {modal?.type === 'create' && <CreateModal {...modal.props} />}
      <div className="toasts" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div key={t.id} className={`glass toast toast--${t.tone}`} role={t.to ? 'link' : 'status'} tabIndex={t.to ? 0 : undefined}
            onClick={t.to ? () => navigate(t.to) : undefined} onKeyDown={t.to ? (e) => e.key === 'Enter' && navigate(t.to) : undefined}>{t.text}</div>
        ))}
      </div>
    </>
  );
}
