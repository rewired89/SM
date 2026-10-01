import { Link } from '../../lib/router.js';
import { GlassPanel, TactileButton } from '../ui/index.jsx';
import { dailyGameId } from '../../lib/learn.js';
import { gameById } from '../../data/games.js';

export const gameForTags = (tags = []) => {
  if (tags.some((t) => ['Cybersecurity', 'Privacy'].includes(t))) return 'phish';
  if (tags.includes('AI')) return 'aihuman';
  if (tags.some((t) => ['Biology', 'Research', 'Space'].includes(t))) return 'science';
  if (tags.some((t) => ['Robotics', 'Hardware'].includes(t))) return 'logic';
  if (tags.some((t) => ['Games', 'Music'].includes(t))) return 'dodge';
  return 'fallacy';
};

const TOPIC = { phish: 'online security', aihuman: 'AI and evidence', science: 'how the world works', logic: 'reasoning', dodge: 'facts and myths', fallacy: 'thinking clearly' };

const FEED = [
  { head: 'Take a 30-second brain break', text: 'Can you spot the phishing message?', game: 'phish', cta: 'Play' },
  { head: 'Got 20 seconds?', text: 'Try today\'s challenge.', game: 'daily', cta: 'Play' },
  { head: 'Take a 30-second brain break', text: 'Real or invented? Sorting facts from myths.', game: 'dodge', cta: 'Play' },
  { head: 'Take a 30-second brain break', text: 'Is it AI, human, or can you not tell?', game: 'aihuman', cta: 'Play' },
];

export default function GameBreak({ variant = 'feed', index = 0, tags, topic, communityId }) {
  let head, text, game, cta;
  if (variant === 'knowledge') {
    game = gameForTags(tags);
    head = 'Knowledge break';
    text = `You just learned about ${topic || TOPIC[game]}. Want to test yourself?`;
    cta = 'Play 30 sec';
  } else {
    const f = FEED[index % FEED.length];
    ({ head, text, game, cta } = f);
  }
  const to = game === 'daily' ? `/play/${dailyGameId()}?daily=1` : `/play/${game}`;
  const g = gameById(game === 'daily' ? dailyGameId() : game);
  return (
    <GlassPanel className="break row">
      <span className="break__emoji" aria-hidden="true">{g?.emoji || '🧠'}</span>
      <div className="grow"><span className="eyebrow">{head}</span><p><strong>{text}</strong></p></div>
      <TactileButton variant="primary" size="sm" to={to}>{cta}</TactileButton>
    </GlassPanel>
  );
}
