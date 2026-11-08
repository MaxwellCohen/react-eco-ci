import { createElement, Suspense, use, useState, startTransition } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { flushSync } from 'react-dom';

const ROWS = 1000;
const mk = n => Array.from({ length: n }, (_, i) => ({ id: i, name: `Item ${i}`, price: (i * 7.31) % 500, tags: ['a', 'b', 'c'].slice(0, (i % 3) + 1) }));

function Row({ r }) {
  return (
    <tr>
      <td>{r.id}</td><td>{r.name}</td><td>${r.price.toFixed(2)}</td>
      <td>{r.tags.map(t => <span key={t} className="tag">{t}</span>)}</td>
    </tr>
  );
}
function Table({ rows }) {
  return <table><tbody>{rows.map(r => <Row key={r.id} r={r} />)}</tbody></table>;
}
const pending = new Map();
function Slow({ id }) {
  if (!pending.has(id)) pending.set(id, new Promise(res => setTimeout(res, 0)).then(() => id));
  return <li>{use(pending.get(id))}</li>;
}
function Boundaries({ n }) {
  return <ul>{Array.from({ length: n }, (_, i) => <Suspense key={i} fallback={<li>…</li>}><Slow id={`${n}-${i}-${Math.random()}`} /></Suspense>)}</ul>;
}

const host = () => { const d = document.createElement('div'); document.body.appendChild(d); return d; };
const time = fn => { const t = performance.now(); fn(); return performance.now() - t; };

export const BENCHES = {
  'mount 1000 rows': () => {
    const d = host(), root = createRoot(d);
    const ms = time(() => flushSync(() => root.render(<Table rows={mk(ROWS)} />)));
    root.unmount(); d.remove(); return ms;
  },
  'update 1000 rows': () => {
    const d = host(), root = createRoot(d);
    flushSync(() => root.render(<Table rows={mk(ROWS)} />));
    const rows = mk(ROWS).map(r => ({ ...r, price: r.price + 1 }));
    const ms = time(() => flushSync(() => root.render(<Table rows={rows} />)));
    root.unmount(); d.remove(); return ms;
  },
  'renderToString 1000 rows': () => time(() => renderToString(<Table rows={mk(ROWS)} />)),
  'hydrate 1000 rows': () => {
    const d = host();
    d.innerHTML = renderToString(<Table rows={mk(ROWS)} />);
    let root;
    const ms = time(() => flushSync(() => { root = hydrateRoot(d, <Table rows={mk(ROWS)} />); }));
    root.unmount(); d.remove(); return ms;
  },
  'renderToString 250 suspense boundaries': () => time(() => renderToString(<Boundaries n={250} />)),
};

const median = a => [...a].sort((x, y) => x - y)[a.length >> 1];
export async function runAll(runs, onProgress) {
  const out = {};
  for (const [name, fn] of Object.entries(BENCHES)) {
    fn(); // warmup
    const s = [];
    for (let i = 0; i < runs; i++) { await new Promise(r => setTimeout(r, 0)); s.push(fn()); }
    out[name] = { median: median(s), min: Math.min(...s), max: Math.max(...s) };
    onProgress?.(name, out[name]);
  }
  return out;
}
