import { useState } from 'react';
import { TactileButton } from '../ui/index.jsx';
import { useStore } from '../../store/StoreProvider.jsx';
import { analyze } from '../../lib/analyzers.js';

export default function AIToolDemo({ tool }) {
  const { a } = useStore();
  const [text, setText] = useState('');
  const [state, setState] = useState('idle');
  const [result, setResult] = useState(null);
  const run = (e) => {
    e.preventDefault();
    if (!text.trim() || state === 'running') return;
    setState('running'); setResult(null);
    setTimeout(() => {
      setResult(analyze(tool.analyzer, text));
      setState('done');
      a.useTool(tool.id);
    }, 1100);
  };
  return (
    <form className="demo stack" onSubmit={run} aria-label={`${tool.name} demo`}>
      <div className="field">
        <label htmlFor="demo-in">{tool.kind === 'agent' ? 'Ask the agent' : 'Input'}</label>
        <textarea id="demo-in" className="textarea" rows={5} placeholder={tool.placeholder} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="row row--wrap">
        <TactileButton type="submit" variant="primary" disabled={!text.trim() || state === 'running'} icon="spark">{tool.kind === 'agent' ? 'Ask' : 'Analyze'}</TactileButton>
        {tool.sample && <TactileButton variant="ghost" onClick={() => setText(tool.sample)}>Use sample</TactileButton>}
      </div>
      <div className="demo__out" aria-live="polite">
        {state === 'running' && <div className="row"><span className="spinner" /> <span className="secondary">Analyzing...</span></div>}
        {result && (
          <div className="result">
            <span className="eyebrow">Result</span>
            <h3>{result.headline}</h3>
            <ul className="stack stack--sm">{result.items.map((it, i) => <li key={i}><span className="eyebrow">{it.label}</span><p>{it.text}</p></li>)}</ul>
            <p className="muted">Simulated output for the prototype. No model is called.</p>
          </div>
        )}
      </div>
    </form>
  );
}
