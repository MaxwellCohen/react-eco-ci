// Browser bootstrap: hydrate the whole document from the inlined Flight data, then self-check hydration.
import { use, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createFromReadableStream } from 'react-server-dom-webpack/client.browser';
import Counter from './Counter.jsx';
import Row from './Row.jsx';

const modules = { Counter: { default: Counter }, Row: { default: Row } };
self.__modules = modules;

const saved = { rows: null };
document.addEventListener('readystatechange', () => { if (document.readyState === 'interactive' && !saved.rows) saved.rows = Array.from(document.querySelectorAll('tr')); });
const recoverable = [];

function Shell({ response }) {
  const tree = use(response);
  useEffect(() => { window.__hydratedAt = performance.now(); }, []);
  return tree;
}
const encoder = new TextEncoder();
const stream = new ReadableStream({
  start(c) {
    const push = chunk => c.enqueue(encoder.encode(chunk));
    (self.__FLIGHT_DATA || []).forEach(push);
    self.__FLIGHT_DATA = { push };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => c.close()); else c.close();
  },
});
hydrateRoot(document, <Shell response={createFromReadableStream(stream)} />, { onRecoverableError: e => recoverable.push(String(e && e.message).slice(0, 200)) });

function check() {
  const now = Array.from(document.querySelectorAll('tr')), was = saved.rows || [];
  const adopted = was.filter((r, i) => now[i] === r).length;
  const btn = document.querySelector('button.counter');
  const before = btn.textContent; btn.click();
  setTimeout(() => {
    const interactive = btn.textContent !== before;
    const ok = window.__hydratedAt !== undefined && adopted === was.length && was.length > 0 && recoverable.length === 0 && interactive;
    const el = document.createElement('div');
    el.id = 'hydration-badge';
    el.style.cssText = `position:fixed;right:12px;bottom:12px;z-index:99;padding:10px 14px;border-radius:8px;font:13px/1.4 system-ui;color:#fff;background:${ok ? '#15803d' : '#b91c1c'};box-shadow:0 2px 8px #0005`;
    el.innerHTML = `<b>Hydration ${ok ? 'PASS' : 'FAIL'}</b><br>rows adopted: ${adopted}/${was.length}<br>recoverable errors: ${recoverable.length}<br>click self-test: ${interactive ? 'ok' : 'FAILED'}<br>hydrated at: ${Math.round(window.__hydratedAt || 0)} ms`;
    document.body.appendChild(el);
    window.__hydrationResult = { ok, adopted, rows: was.length, recoverable, interactive, hydratedAt: window.__hydratedAt };
  }, 100);
}
addEventListener('load', () => setTimeout(check, 300));
