import CommunityCard from '../components/communities/CommunityCard.jsx';
import { TactileButton } from '../components/ui/index.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import { useUI } from '../store/UIProvider.jsx';
import * as sel from '../store/selectors.js';

export default function Communities() {
  const { s } = useStore();
  const { openModal } = useUI();
  const list = sel.allCommunities(s).slice().sort((a, b) => Number(sel.has(s, 'joined', b.id)) - Number(sel.has(s, 'joined', a.id)) || b.members - a.members);
  return (
    <div className="stack stack--lg">
      <div className="row row--between row--wrap"><div><h1>Communities</h1><p className="secondary">Living spaces for people who care about the same things.</p></div><TactileButton variant="primary" icon="plus" onClick={() => openModal('create', { start: 'community' })}>Start a community</TactileButton></div>
      <div className="grid grid--2">{list.map((c) => <CommunityCard key={c.id} community={c} />)}</div>
    </div>
  );
}
