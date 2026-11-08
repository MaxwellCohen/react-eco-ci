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

async function renderPage(optIn, rows, delayMs) {
  const elided = optIn ? new Map() : null;
  const options = optIn ? { onElidedValue: (id, v) => elided.set(id, resolveLive(v)) } : undefined;
  const flight = await render(optIn, rows, delayMs, options);
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

// Streaming: send the Fizz shell as soon as it is ready, then interleave Fizz chunks and inlined Flight data as they
// arrive. HTML is buffered within a tick so a <script> is never injected mid-tag.
async function streamPage(optIn, rows, delayMs, early = true) {
  const elided = optIn ? new Map() : null;
  const options = optIn ? { onElidedValue: (id, v) => elided.set(id, resolveLive(v)) } : undefined;
  const flight = await render(optIn, rows, delayMs, options);
  const [forSsr, forInline] = flight.tee();
  const response = createFromReadableStream(forSsr, { serverConsumerManifest: ssrManifest, ...(elided ? { elidedRows: elided } : {}) });
  function Root() { return React.use(response); }
  // Early: Fizz emits <script async src> right after the shell, so the client boots (and hydrates) while the stream is still open.
  const fizz = await renderToReadableStream(React.createElement(Root), early ? { bootstrapScripts: ['/client.js'] } : undefined);
  const trailer = '</body></html>';
  const { readable, writable } = new TransformStream();
  const w = writable.getWriter();
  let htmlBuf = '', scripts = '', timer = null, chain = Promise.resolve();
  const flush = async () => {
    if (htmlBuf) { const h = htmlBuf; htmlBuf = ''; await w.write(enc.encode(h)); }
    if (scripts) { const s = scripts; scripts = ''; await w.write(enc.encode(s)); }
  };
  const schedule = () => { if (!timer) timer = setTimeout(() => { timer = null; chain = chain.then(flush); }, 0); };
  const htmlDec = new TextDecoder(), fDec = new TextDecoder();
  const htmlDone = (async () => {
    const r = fizz.getReader();
    for (;;) {
      const { done, value } = await r.read();
      if (done) break;
      let s = htmlDec.decode(value, { stream: true });
      if (s.endsWith(trailer)) s = s.slice(0, -trailer.length);
      htmlBuf += s; schedule();
    }
  })();
  const flightDone = (async () => {
    const r = forInline.getReader();
    for (;;) {
      const { done, value } = await r.read();
      if (done) break;
      scripts += `<script>(self.__FLIGHT_DATA||=[]).push(${JSON.stringify(fDec.decode(value, { stream: true }))})</script>`; schedule();
    }
  })();
  (async () => {
    try {
      await Promise.all([htmlDone, flightDone]);
      if (timer) clearTimeout(timer), (timer = null);
      await chain; await flush();
      // null tells the client's Flight stream that the server is done; late hydration loads the script only now.
      await w.write(enc.encode('<script>(self.__FLIGHT_DATA||=[]).push(null)</script>' + (early ? '' : '<script src="/client.js" async></script>') + trailer));
      await w.close();
    } catch (e) { await w.abort(e); }
  })();
  return readable;
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
<p><b>Early hydration:</b> the client script boots right after the shell (a bootstrap <code>&lt;script async&gt;</code>, like Next.js) and hydrates while the document is still streaming; the Flight stream stays open until the server says it is done. <code>?hydrate=late</code> loads the script only after the document ends. The badge reports whether hydration started before the stream finished.</p>
<p><b>Streaming:</b> pages stream Fizz HTML with the Flight data inlined as it arrives. Add <code>?delay=1500</code> to make a Suspense section (&ldquo;Reviews&rdquo;) arrive late, and <code>?stream=0</code> to buffer the whole document instead. Try <a href="/optin?delay=1500">/optin?delay=1500</a> or <a href="/plain?delay=1500">/plain?delay=1500</a>.</p>
<p>Each page shows a live <b>hydration check</b> badge (bottom-right): rows adopted from the server DOM, recoverable errors, and a click self-test.</p>`;

export default {
  async fetch(req, env) {
    try {
      return await handle(req, env);
    } catch (e) {
      return new Response(`render error: ${e && e.stack || e}`, { status: 500, headers: { 'content-type': 'text/plain' } });
    }
  },
};

const handler = {
  async fetch(req, env) {
    const url = new URL(req.url), q = url.searchParams;
    if (url.pathname === '/') return new Response(index(), { headers: { 'content-type': 'text/html; charset=utf-8' } });
    const rows = Math.min(+(q.get('rows') || 1000), 5000);
    const delay = Math.min(+(q.get('delay') || 0), 5000);
    if (url.pathname === '/plain' || url.pathname === '/optin') {
      const optIn = url.pathname === '/optin';
      if (q.get('stream') === '0') {
        const { doc } = await renderPage(optIn, rows, delay);
        return new Response(doc, { headers: { 'content-type': 'text/html; charset=utf-8' } });
      }
      return new Response(await streamPage(optIn, rows, delay, q.get('hydrate') !== 'late'), { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    if (url.pathname === '/stats.json') {
      const optIn = q.get('mode') === 'optin';
      const t0 = Date.now();
      const body = await streamPage(optIn, rows, delay, q.get('hydrate') !== 'late');
      const parts = []; let firstMs = -1;
      const r = body.getReader(); const sd = new TextDecoder();
      for (;;) { const { done, value } = await r.read(); if (done) break; if (firstMs < 0) firstMs = Date.now() - t0; parts.push(sd.decode(value, { stream: true })); }
      const doc = parts.join('');
      const flightBytes = [...doc.matchAll(/<script>\(self\.__FLIGHT_DATA[^]*?<\/script>/g)].reduce((n, m) => n + m[0].length, 0);
      return Response.json({ ...version, mode: optIn ? 'optin' : 'plain', rows, delay, htmlBytes: enc.encode(doc).length, htmlGzip: await gzipSize(doc), inlinedFlightBytes: flightBytes, chunks: parts.length, firstChunkMs: firstMs, totalMs: Date.now() - t0, react: React.version });
    }
    return env.ASSETS.fetch(req);
  },
};
const handle = (req, env) => handler.fetch(req, env);
