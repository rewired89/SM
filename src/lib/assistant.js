import { analyze } from './analyzers.js';
import { classify } from './conduct.js';

/* PROTOTYPE stand-in for the model behind NOMI.ask. A real build calls a hosted model with spend limits,
   and the demo's creator never sees the prompt. */
export async function nomiAnswer(prompt) {
  await new Promise((r) => setTimeout(r, 350));
  if (classify(prompt).level >= 2) return { headline: 'Cannot help with that', items: [{ label: 'Why', text: 'The text breaks Nomi community standards.' }] };
  const lines = prompt.split('\n').filter((l) => l.trim());
  if (lines.length >= 2 && /sshd|sudo|failed|accepted|error|warn|denied|cron/i.test(prompt)) return analyze('logs', prompt.slice(0, 4000));
  return analyze('keywords', prompt.slice(0, 2000));
}
