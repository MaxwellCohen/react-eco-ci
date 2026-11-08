import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as React from 'react';
import { BENCHES, runAll } from './bench.jsx';

const KEY = 'react-eco-perf-runs';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const save = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };

function App() {
  const [runs, setRuns] = useState(load);
  const [n, setN] = useState(15);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState({});
  const [paste, setPaste] = useState('');
  useEffect(() => save(runs), [runs]);

  const start = async () => {
    setBusy(true); setLive({});
    const results = await runAll(n, (k, v) => setLive(l => ({ ...l, [k]: v })));
    setRuns(r => [...r, { label: `${React.version} #${r.length + 1}`, version: React.version, at: Date.now(), n, results }]);
    setBusy(false);
  };
  const importRun = () => {
    try { const j = JSON.parse(paste); setRuns(r => [...r, ...[].concat(j)]); setPaste(''); } catch { alert('Invalid JSON'); }
  };
  const names = Object.keys(BENCHES);
  const base = runs[0];
  const cell = (run, k) => {
    const m = run.results[k]?.median;
    if (m == null) return '—';
    const d = base && run !== base && base.results[k] ? (m / base.results[k].median - 1) * 100 : null;
    return <>{m.toFixed(1)} ms{d != null && <small className={d > 3 ? 'bad' : d < -3 ? 'good' : ''}> {d > 0 ? '+' : ''}{d.toFixed(0)}%</small>}</>;
  };
  return (
    <main>
      <h1>React perf demo</h1>
      <p>React <code>{React.version}</code> · {navigator.userAgent.match(/(Chrome|Firefox|Safari)\/[\d.]+/)?.[0]}</p>
      <p>
        <label>runs <input type="number" min="3" max="100" value={n} onChange={e => setN(+e.target.value)} /></label>{' '}
        <button disabled={busy} onClick={start}>{busy ? 'Running…' : 'Run benchmarks'}</button>{' '}
        <button disabled={busy} onClick={() => setRuns([])}>Clear</button>
      </p>
      <table className="results">
        <thead><tr><th>median per op</th>{runs.map((r, i) => <th key={i}>{r.label}{i === 0 && <small> (baseline)</small>}</th>)}{busy && <th>running…</th>}</tr></thead>
        <tbody>{names.map(k => (
          <tr key={k}><td>{k}</td>{runs.map((r, i) => <td key={i}>{cell(r, k)}</td>)}{busy && <td>{live[k] ? `${live[k].median.toFixed(1)} ms` : ''}</td>}</tr>
        ))}</tbody>
      </table>
      <p className="hint">Lower is better; % is vs the first run. Open the same page on another React build's deployment, copy its JSON, and paste it here to compare variants.</p>
      <details>
        <summary>Export / import</summary>
        <button onClick={() => navigator.clipboard.writeText(JSON.stringify(runs))}>Copy JSON</button>
        <textarea value={paste} onChange={e => setPaste(e.target.value)} placeholder="Paste runs JSON" rows={4} />
        <button onClick={importRun}>Import</button>
      </details>
      <p><a href="/version.json">/version.json</a></p>
    </main>
  );
}
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
