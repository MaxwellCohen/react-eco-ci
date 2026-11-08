// The "framework": Flight render -> tee -> Fizz SSR + inlined Flight payload, like Next/Waku do.
//   /plain : framework does not use the new Flight APIs (everything ships as ordinary Flight)
//   /optin : framework passes onElidedValue (live rows to in-process SSR) and the page prunes stateless rows
import * as React from 'react';
import { renderToReadableStream } from 'react-dom/server';
import { createFromReadableStream } from 'react-server-dom-webpack/client.edge';
import { render, clientManifest } from '../dist/rsc.mjs';
import Counter from './Counter.jsx';
import Row from './Row.jsx';
import version from './version.json';

const modules = { Counter: { default: Counter }, Row: { default: Row } };
globalThis.__webpack_require__ = id => modules[id];
globalThis.__webpack_chunk_load__ = () => Promise.resolve();
const ssrManifest = {
  moduleMap: Object.fromEntries(Object.keys(modules).map(id => [id, { '*': { id, chunks: [], name: '*' } }])),
  moduleLoading: { prefix: '/' },
};

// The in-process SSR hand-off: resolve client references inside live elided nodes with the manifest we hold.
const ELEMENT = Symbol.for('react.transitional.element'), PRUNED = Symbol.for('react.pruned'), CLIENT_REF = Symbol.for('react.client.reference');
function resolveLive(node) {
  if (node === null || typeof node !== 'object') return node;
  if (Array.isArray(node)) return node.map(resolveLive);
  if (node.$$typeof === PRUNED) return resolveLive(node.value);
  if (node.$$typeof === ELEMENT) {
    let type = node.type;
    if (type && (typeof type === 'function' || typeof type === 'object') && type.$$typeof === CLIENT_REF) {
      const [file, name] = type.$$id.split('#');
      type = globalThis.__webpack_require__(clientManifest[file].id)[name || 'default'];
    }
    const props = { ...node.props };
    if (props.children !== undefined) props.children = resolveLive(props.children);
    return { ...node, type, props };
  }
  return node;
}

const enc = new TextEncoder(), dec = new TextDecoder();
async function readAll(stream) {
  const chunks = [];
  const r = stream.getReader();
  for (;;) { const { done, value } = await r.read(); if (done) break; chunks.push(value); }
  return chunks;
}
async function gzipSize(str) {
  const cs = new Response(new Blob([str]).stream().pipeThrough(new CompressionStream('gzip')));
  return (await cs.arrayBuffer()).byteLength;
}

async function renderPage(optIn, rows) {
  const elided = optIn ? new Map() : null;
  const options = optIn ? { onElidedValue: (id, v) => elided.set(id, resolveLive(v)) } : undefined;
  const flight = await render(optIn, rows, options);
  const [forSsr, forInline] = flight.tee();
  const inline = readAll(forInline);
  const response = createFromReadableStream(forSsr, { serverConsumerManifest: ssrManifest, ...(elided ? { elidedRows: elided } : {}) });
  function Root() { return React.use(response); }
  const fizz = await renderToReadableStream(React.createElement(Root));
  await fizz.allReady;
  const htmlDec = new TextDecoder();
  const html = (await readAll(fizz)).map(c => htmlDec.decode(c, { stream: true })).join('') + htmlDec.decode();
  const fDec = new TextDecoder();
  const scripts = (await inline).map(c => `<script>(self.__FLIGHT_DATA||=[]).push(${JSON.stringify(fDec.decode(c, { stream: true }))})</script>`).join('');
  const trailer = '</body></html>';
  const doc = (html.endsWith(trailer) ? html.slice(0, -trailer.length) : html) + scripts + '<script src="/client.js" defer></script>' + trailer;
  return { doc, flightBytes: scripts.length };
}

const index = () => `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Flight opt-in demo (${version.variant})</title>
<style>body{font:15px/1.5 system-ui;max-width:760px;margin:24px auto;padding:0 16px}code{background:#8882;padding:1px 5px;border-radius:4px}li{margin:8px 0}</style>
<h1>Flight HTML-first: framework opt-in demo</h1>
<p>variant <code>${version.variant}</code> &middot; ${version.repo}@<code>${version.ref}</code> (<code>${version.sha.slice(0, 8)}</code>) &middot; flags forced on: ${version.flags.length ? version.flags.map(f => `<code>${f}</code>`).join(' ') : 'none'}</p>
<p>The same 1000-row page (244 KB inline CSS, JSON-LD, stateless client rows, an interactive counter every 100 rows), rendered by a tiny Flight+Fizz framework running on this Worker:</p>
<ul>
<li><b>Framework does NOT opt in</b>: <a href="/plain">/plain</a> &middot; <a href="/stats.json?mode=plain">stats</a> &middot; <a href="view-source:/plain">view-source</a></li>
<li><b>Framework opts in</b> (<code>onElidedValue</code> + <code>unstable_pruneForBrowser</code>): <a href="/optin">/optin</a> &middot; <a href="/stats.json?mode=optin">stats</a> &middot; <a href="view-source:/optin">view-source</a></li>
</ul>
<p>Each page shows a live <b>hydration check</b> badge (bottom-right): rows adopted from the server DOM, recoverable errors, and a click self-test.</p>`;

export default {
  async fetch(req, env) {
    const url = new URL(req.url), q = url.searchParams;
    if (url.pathname === '/') return new Response(index(), { headers: { 'content-type': 'text/html; charset=utf-8' } });
    const rows = Math.min(+(q.get('rows') || 1000), 5000);
    if (url.pathname === '/plain' || url.pathname === '/optin') {
      const { doc } = await renderPage(url.pathname === '/optin', rows);
      return new Response(doc, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    if (url.pathname === '/stats.json') {
      const optIn = q.get('mode') === 'optin';
      const { doc, flightBytes } = await renderPage(optIn, rows);
      return Response.json({ ...version, mode: optIn ? 'optin' : 'plain', rows, htmlBytes: enc.encode(doc).length, htmlGzip: await gzipSize(doc), inlinedFlightBytes: flightBytes, react: React.version });
    }
    return env.ASSETS.fetch(req);
  },
};
