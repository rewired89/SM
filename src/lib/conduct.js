/* PROTOTYPE CONDUCT FILTER: a small pattern check for directed abuse and threats.
   Honest criticism of work is allowed. A real build uses a maintained moderation model plus human review, because context matters. */
const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's', '!': 'i' };
const norm = (t) => t.toLowerCase().replace(/[01345 7@$!]/g, (c) => (c === ' ' ? ' ' : LEET[c] || c)).replace(/(.)\1{2,}/g, '$1$1');

const SEVERE = [/\bkill (yourself|urself)\b/, /\bkys\b/, /\bi (will|ll) (find|hurt|kill|ruin|destroy) you\b/, /\b(hope|wish) you (die|get hurt|suffer)\b/, /\byou (should|deserve to) (die|suffer)\b/, /\bgo (die|rot)\b/];
const DIRECTED = [
  /\byou(?:'re| are| r|re)? (?:such |so |just )?(?:an? )?(?:complete |total |absolute |fucking |f\*+king )?(?:idiot|moron|stupid|dumb|trash|garbage|worthless|pathetic|loser|scum|clown|disgusting|retard)/,
  /\b(shut up|piece of (shit|crap|garbage|trash)|go to hell|screw you)\b/, /\bfuck (you|off|yourself)\b/, /\b(you|u) (suck|stink)\b/,
  /\b(your|ur) (project|work|idea) is (trash|garbage|shit|worthless) and so are you\b/,
];
const MILD = [/\b(shit|fuck|fucking|bullshit|asshole|bastard)\b/, /\b(idiots?|morons?)\b/];

export function classify(text) {
  const t = norm(text || '');
  if (SEVERE.some((r) => r.test(t))) return { level: 3, reason: 'Threats or telling someone to hurt themselves' };
  if (DIRECTED.some((r) => r.test(t))) return { level: 2, reason: 'Insulting or demeaning another person' };
  if (MILD.some((r) => r.test(t))) return { level: 1, reason: 'Strong language' };
  return { level: 0, reason: '' };
}
export const STRIKE_WINDOW_DAYS = 30;
export const SUSPENSION_DAYS = 3;
