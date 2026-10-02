/* Transparent reputation: starts at 40 and is earned. Delivery matters most.
   Formula (0 to 100):
   40 base
   +30 evidence: share of completed milestones where the founder posted results
   +10 funding: share of launched projects that earned funding
   +10 consistency: regular project updates
   +10 quality: average project review score above 80
   +10 community: tiny games approved
   -10 per conduct strike in the last 30 days, -20 per suspension */
export const TIERS = [[90, 'Highly trusted'], [75, 'Trusted'], [55, 'Growing'], [0, 'New']];
export const tierOf = (score) => TIERS.find(([min]) => score >= min)[1];

export function computeReputation(i) {
  const f = [{ label: 'Starting point', delta: 40, note: 'Everyone starts here. Trust is earned.' }];
  if (i.done > 0) f.push({ label: 'Results posted', delta: Math.round(30 * (i.evidence / i.done)), note: `${i.evidence} of ${i.done} completed milestones have posted evidence` });
  else f.push({ label: 'Results posted', delta: 0, note: 'No completed milestones yet' });
  if (i.launched > 0) f.push({ label: 'Projects that earned funding', delta: Math.round(10 * (i.funded / i.launched)), note: `${i.funded} of ${i.launched} launched projects got funded` });
  f.push({ label: 'Regular updates', delta: Math.min(10, Math.round(i.updates * 1.5)), note: `${i.updates} update${i.updates === 1 ? '' : 's'} posted` });
  const avg = i.reviews.length ? i.reviews.reduce((a, b) => a + b, 0) / i.reviews.length : 0;
  f.push({ label: 'Project quality', delta: avg > 80 ? Math.min(10, Math.round(((avg - 80) / 20) * 10 + 4)) : 0, note: i.reviews.length ? `Average review score ${Math.round(avg)}/100` : 'No reviewed projects yet' });
  f.push({ label: 'Community games', delta: Math.min(10, i.games * 3), note: `${i.games} approved game${i.games === 1 ? '' : 's'}` });
  if (i.strikes) f.push({ label: 'Conduct strikes', delta: -10 * i.strikes, note: `${i.strikes} strike${i.strikes === 1 ? '' : 's'} in the last 30 days for disrespect` });
  if (i.suspensions) f.push({ label: 'Suspensions', delta: -20 * i.suspensions, note: `${i.suspensions} suspension${i.suspensions === 1 ? '' : 's'}` });
  const score = Math.max(0, Math.min(100, f.reduce((a, x) => a + x.delta, 0)));
  return { score, tier: tierOf(score), factors: f, evidenceRatio: i.done ? i.evidence / i.done : null, funded: i.funded, launched: i.launched };
}
