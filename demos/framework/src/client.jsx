// Browser bootstrap: hydrate the whole document from the inlined Flight data, then self-check hydration.
import { use, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createFromReadableStream } from 'react-server-dom-webpack/client.browser';
import Counter from './Counter.jsx';
import Row from './Row.jsx';

const modules = { Counter: { default: Counter }, Row: { default: Row } };
self.__modules = modules;

// Early hydration: this script is a bootstrap <script async> that may run while the document is still streaming, so
// the server DOM is partial. Track every <tr> as it is parsed (before hydration can touch it) to verify adoption later.
const t0 = performance.now();
const originals = new Set(document.querySelectorAll('tr'));
const track = n => { if (n.nodeType === 1) { if (n.tagName === 'TR') originals.add(n); n.querySelectorAll('tr').forEach(r => originals.add(r)); } };
new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(track))).observe(document, { childList: true, subtree: true });
const startedWhileLoading = document.readyState === 'loading';
const recoverable = [];
window.__hydration = { startedAt: t0, startedWhileLoading, streamEndedAt: undefined };

function Shell({ response }) {
  const tree = use(response);
  useEffect(() => { window.__hydratedAt = performance.now(); }, []);
  return tree;
}
const encoder = new TextEncoder();
const stream = new ReadableStream({
  start(c) {
    const push = chunk => {
      if (chunk === null) { window.__hydration.streamEndedAt = performance.now(); c.close(); }
      else c.enqueue(encoder.encode(chunk));
    };
    (self.__FLIGHT_DATA || []).forEach(push);
    self.__FLIGHT_DATA = { push };
  },
});
hydrateRoot(document, <Shell response={createFromReadableStream(stream)} />, { onRecoverableError: e => recoverable.push(String(e && e.message).slice(0, 200)) });

function check() {
  const h = window.__hydration;
  if (window.__hydratedAt === undefined || h.streamEndedAt === undefined || document.readyState !== 'complete') return setTimeout(check, 100);
  const now = Array.from(document.querySelectorAll('tr'));
  const adopted = [...originals].filter(r => r.isConnected).length;
  const btn = document.querySelector('button.counter');
  const before = btn.textContent; btn.click();
  setTimeout(() => {
    const interactive = btn.textContent !== before;
    const early = h.startedWhileLoading && t0 < h.streamEndedAt;
    const ok = adopted === originals.size && originals.size > 0 && now.length === originals.size && recoverable.length === 0 && interactive;
    window.__hydrationResult = { ok, adopted, rows: originals.size, rowsNow: now.length, recoverable, interactive, hydratedAt: window.__hydratedAt, startedAt: t0, streamEndedAt: h.streamEndedAt, startedWhileLoading: h.startedWhileLoading, early };
    // ?badge=0 skips the visual badge (it would otherwise become the LCP element in Lighthouse runs).
    if (location.search.includes('badge=0')) return;
    const el = document.createElement('div');
    el.id = 'hydration-badge';
    el.style.cssText = `position:fixed;right:12px;bottom:12px;z-index:99;padding:10px 14px;border-radius:8px;font:13px/1.4 system-ui;color:#fff;background:${ok ? '#15803d' : '#b91c1c'};box-shadow:0 2px 8px #0005`;
    el.innerHTML = `<b>Hydration ${ok ? 'PASS' : 'FAIL'}</b><br>rows adopted: ${adopted}/${originals.size}<br>recoverable errors: ${recoverable.length}<br>click self-test: ${interactive ? 'ok' : 'FAILED'}<br>started at ${Math.round(t0)} ms ${h.startedWhileLoading ? '(document still loading)' : '(document already loaded)'}<br>stream ended at ${Math.round(h.streamEndedAt)} ms &rarr; ${early ? '<b>EARLY hydration</b>' : 'late hydration'}<br>hydrated at ${Math.round(window.__hydratedAt)} ms`;
    document.body.appendChild(el);
  }, 100);
}
check();
