import { Modal } from '../ui/index.jsx';
import PaymentSetup from '../settings/PaymentSetup.jsx';
import { useUI } from '../../store/UIProvider.jsx';

export default function PaymentModal() {
  const { closeModal } = useUI();
  return <Modal title="Add a payment method" onClose={closeModal} label="Add a payment method"><PaymentSetup onDone={closeModal} /></Modal>;
}
