import { Modal } from '../ui/index.jsx';
import ThemePicker from '../common/ThemePicker.jsx';
import { useUI } from '../../store/UIProvider.jsx';

export default function ThemeModal() {
  const { closeModal } = useUI();
  return (
    <Modal title="Your colors" onClose={closeModal} label="Choose colors">
      <div className="stack"><p className="secondary">Pick the pair of colors you want Nomi to wear. It is saved on this device.</p><ThemePicker /></div>
    </Modal>
  );
}
