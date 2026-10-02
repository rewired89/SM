const STOP = new Set('the a an and or of to in on for with is are was were be been that this it as by at from which their they we our can may more most not no than then so such these those into also have has had will would should could about over under between during after before while because very much many some any each other'.split(' '));

const words = (t) => (t.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || []);
const sentences = (t) => (t.match(/[^.!?\n]+[.!?]*/g) || []).map((s) => s.trim()).filter(Boolean);
const topWords = (t, n) => {
  const c = {};
  words(t).filter((w) => !STOP.has(w)).forEach((w) => (c[w] = (c[w] || 0) + 1));
  return Object.entries(c).sort((a, b) => b[1] - a[1] || b[0].length - a[0].length).slice(0, n).map(([w]) => w);
};
const nums = (t) => (t.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);

const A = {
  summarize(t) {
    const s = sentences(t);
    const keys = topWords(t, 3);
    return {
      headline: `${keys.length} key concept${keys.length === 1 ? '' : 's'} detected`,
      items: [
        ...keys.map((k, i) => ({ label: `Concept ${i + 1}`, text: k })),
        { label: 'One-line summary', text: s[0] ? s[0].slice(0, 160) : 'Not enough text.' },
        { label: 'Length', text: `${words(t).length} words in ${s.length} sentence${s.length === 1 ? '' : 's'}` },
      ],
    };
  },
  lint(t) {
    const w = words(t);
    const issues = [];
    if (!/\b(you are|act as|role)\b/i.test(t)) issues.push(['Missing role', 'Say who the model should be, for example "You are a careful editor."']);
    if (w.length < 12) issues.push(['Very short', 'Add context, audience and the format you want back.']);
    if (/\b(good|nice|great|something)\b/i.test(t)) issues.push(['Vague wording', 'Replace words like "good" or "something" with a measurable target.']);
    if (/short/i.test(t) && /detail/i.test(t)) issues.push(['Conflicting rules', 'You asked for both short and detailed output. Pick a priority.']);
    if (!/\b(format|bullet|json|table|list|paragraph)\b/i.test(t)) issues.push(['No output format', 'State the format, such as three bullets or JSON.']);
    return {
      headline: issues.length ? `${issues.length} issue${issues.length === 1 ? '' : 's'} found` : 'Prompt looks solid',
      items: issues.length ? issues.map(([label, text]) => ({ label, text })) : [{ label: 'All clear', text: 'Role, goal and format are all present.' }],
    };
  },
  cards(t) {
    const cards = sentences(t).slice(0, 4).map((s) => {
      const key = topWords(s, 1)[0] || 'this idea';
      return { label: `Q: What should you remember about "${key}"?`, text: `A: ${s}` };
    });
    return { headline: `${cards.length} flashcard${cards.length === 1 ? '' : 's'} created`, items: cards.length ? cards : [{ label: 'Nothing to learn yet', text: 'Paste a few sentences.' }] };
  },
  numbers(t) {
    const n = nums(t);
    if (!n.length) return { headline: 'No numbers found', items: [{ label: 'Hint', text: 'Paste numbers separated by commas or new lines.' }] };
    const sum = n.reduce((a, b) => a + b, 0);
    const mean = sum / n.length;
    const sd = Math.sqrt(n.reduce((a, b) => a + (b - mean) ** 2, 0) / n.length);
    const out = n.filter((v) => sd > 0 && Math.abs(v - mean) > 2 * sd);
    const lines = t.split('\n').filter((l) => nums(l).length);
    const trend = n[n.length - 1] > n[0] ? 'rising' : n[n.length - 1] < n[0] ? 'falling' : 'flat';
    return {
      headline: `${n.length} values analysed`,
      items: [
        { label: 'Mean', text: mean.toFixed(2) }, { label: 'Range', text: `${Math.min(...n)} to ${Math.max(...n)}` },
        { label: 'Trend', text: `Overall ${trend} (${n[0]} to ${n[n.length - 1]})` },
        { label: 'Outliers', text: out.length ? out.join(', ') : 'None beyond two standard deviations' },
        ...(lines.length > 1 ? [{ label: 'Runs', text: `${lines.length} runs compared, last run differs by ${(nums(lines[lines.length - 1])[1] - nums(lines[0])[1] || 0).toFixed(1)} on the first metric` }] : []),
      ],
    };
  },
  logs(t) {
    const items = [];
    const fails = (t.match(/failed/gi) || []).length;
    if (fails) items.push({ label: `${fails} failed login${fails > 1 ? 's' : ''}`, text: 'Repeated failures from the same address look like a brute force attempt. Block it and disable password login.' });
    if (/root/i.test(t)) items.push({ label: 'Root targeted', text: 'Attackers often try the root account first. Disable direct root login.' });
    if (/accepted/i.test(t) && fails) items.push({ label: 'Success after failures', text: 'A login succeeded soon after failures. Check that account and rotate its password.' });
    if (/chmod\s+777|\/etc\/shadow/i.test(t)) items.push({ label: 'Dangerous permission change', text: 'World-writable or shadow file changes are a strong sign of compromise.' });
    if (/ports? 22|8080|exposed/i.test(t)) items.push({ label: 'Exposed services', text: 'Put SSH behind a VPN or key-only login and review whether 8080 needs to be public.' });
    if (!items.length) items.push({ label: 'Nothing alarming', text: 'No obvious indicators found in what you pasted.' });
    return { headline: items.length === 1 && items[0].label === 'Nothing alarming' ? 'Looks calm' : `${items.length} finding${items.length > 1 ? 's' : ''}`, items };
  },
  code(t) {
    const items = [];
    if (/\bvar\b/.test(t)) items.push({ label: 'Use let or const', text: 'var is function scoped and easy to misuse.' });
    if (/for\s*\(.*\.length/.test(t)) items.push({ label: 'Simplify the loop', text: 'A reduce or for...of loop would be clearer than an index loop.' });
    if (/TODO|FIXME/.test(t)) items.push({ label: 'Unfinished work', text: 'There is a TODO in the code. Turn it into a tracked issue.' });
    if (!/(test|assert|expect)/i.test(t)) items.push({ label: 'Add a test', text: 'Cover the empty list and a single item at minimum.' });
    items.push({ label: 'Size', text: `${t.split('\n').length} lines, ${(t.match(/function|=>/g) || []).length} function(s)` });
    return { headline: `${items.length - 1} suggestion${items.length - 1 === 1 ? '' : 's'}`, items };
  },
  critic(t) {
    const items = [];
    if (/grey|gray/i.test(t) && /light/i.test(t)) items.push({ label: 'Low contrast', text: 'Grey on light grey fails accessibility checks. Aim for a 4.5:1 ratio.' });
    if (/five|many|different font/i.test(t)) items.push({ label: 'Too many type sizes', text: 'Limit yourself to three sizes so hierarchy is obvious.' });
    if (/tiny|small/i.test(t)) items.push({ label: 'Hidden action', text: 'The main call to action is too small. Make it the clearest element.' });
    if (/huge|hero/i.test(t)) items.push({ label: 'Hero is competing', text: 'A very large image can push the message below the fold.' });
    if (!items.length) items.push({ label: 'Needs detail', text: 'Describe colours, layout and the main action to get sharper feedback.' });
    return { headline: `${items.length} critique${items.length > 1 ? 's' : ''}`, items };
  },
  writing(t) {
    const s = sentences(t);
    const w = words(t).length;
    const avg = s.length ? Math.round(w / s.length) : 0;
    const items = [{ label: 'Average sentence', text: `${avg} words${avg > 22 ? ' (long, try splitting)' : ''}` }];
    if (/it should be noted|in many cases|a number of|very /i.test(t)) items.push({ label: 'Filler detected', text: 'Cut phrases like "it should be noted" and "in many cases".' });
    if (/\b(was|were|been)\b/.test(t)) items.push({ label: 'Passive voice', text: 'Try active voice: say who did what.' });
    items.push({ label: 'Tighter version', text: s[0] ? s[0].replace(/it should be noted that /i, '').replace(/\bvery\b\s*/gi, '').slice(0, 140) + '…' : '' });
    return { headline: `${items.length - 1} edit suggestion${items.length > 2 ? 's' : ''}`, items };
  },
  bom(t) {
    const rows = t.split('\n').map((l) => l.split(',')).filter((r) => r.length >= 3);
    const total = rows.reduce((a, r) => a + Number(r[1]) * Number(r[2]), 0);
    const top = rows.slice().sort((a, b) => Number(b[1]) * Number(b[2]) - Number(a[1]) * Number(a[2]))[0];
    return {
      headline: rows.length ? `Total ${('$' + total.toFixed(2))} across ${rows.length} parts` : 'No parts parsed',
      items: rows.length ? [{ label: 'Biggest cost', text: `${top[0].trim()} at $${(Number(top[1]) * Number(top[2])).toFixed(2)}` }, { label: 'Suggestion', text: 'Ask two suppliers for a bulk quote on the largest line item.' }, { label: 'Risk', text: 'Single-source parts detected. Keep one alternative on file.' }] : [{ label: 'Hint', text: 'Use: name, qty, unit price.' }],
    };
  },
  keywords(t) {
    const k = topWords(t, 4);
    return { headline: `${k.length} themes spotted`, items: [...k.map((w) => ({ label: 'Theme', text: w })), { label: 'Next step', text: 'Pick one theme and expand it into a short description.' }] };
  },
};

export const analyze = (key, text) => (A[key] || A.keywords)(text.trim());
