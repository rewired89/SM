import { useState } from 'react';
import { Tabs, Empty } from '../components/ui/index.jsx';
import MeetingCard from '../components/meetings/MeetingCard.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import * as sel from '../store/selectors.js';

export default function Meetings() {
  const { s } = useStore();
  const [tab, setTab] = useState('open');
  const all = sel.meetingsFor(s).slice().sort((a, b) => b.createdAt - a.createdAt);
  const groups = { open: all.filter((m) => m.status === 'negotiating'), confirmed: all.filter((m) => m.status === 'confirmed'), past: all.filter((m) => ['declined', 'cancelled'].includes(m.status)) };
  const list = groups[tab];
  return (
    <div className="stack stack--lg">
      <div><h1>Meetings</h1><p className="secondary">Backers who give $500 to a project can ask the founder for a meeting. You trade times until you both agree.</p></div>
      <Tabs label="Meeting status" tabs={[{ id: 'open', label: `In progress ${groups.open.length}` }, { id: 'confirmed', label: `Confirmed ${groups.confirmed.length}` }, { id: 'past', label: `Past ${groups.past.length}` }]} value={tab} onChange={setTab} />
      {list.length ? <div className="stack">{list.map((m) => <MeetingCard key={m.id} m={m} />)}</div> : <Empty title="Nothing here yet">{tab === 'open' ? 'When you or a backer ask for a meeting it shows up here.' : 'Nothing to show.'}</Empty>}
    </div>
  );
}
