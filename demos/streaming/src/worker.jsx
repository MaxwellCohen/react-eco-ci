import * as React from 'react';
import { renderToReadableStream } from 'react-dom/server';
import createPages from './pages.cjs';
import version from './version.json';

const PAGES = ['basic', 'nested', 'css', 'style', 'list', 'error', 'heavy'];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function opts(q) {
  return {
    page: PAGES.includes(q.get('page')) ? q.get('page') : 'basic',
    ctx: { cache: new Map(), probe: 'none', cssMs: Number(q.get('cssMs') || 900), boundaries: Number(q.get('n') || 100), order: q.get('order') || 'forwards' },
  };
}
async function stream(q) {
  const { page, ctx } = opts(q);
  const { App } = createPages(React, ctx);
  // The flag only makes the option available; declarative patching is opt-in per render.
  // Default: on for variants that force the flag, override with ?mode=decl|script.
  const mode = q.get('mode') || (version.flags.includes('enableFizzDeclarativePatching') ? 'decl' : 'script');
  return renderToReadableStream(React.createElement(App, { page }), { unstable_declarativePatching: mode === 'decl' });
}

function index() {
  const v = version;
  const links = PAGES.map(p => `<li><b>${p}</b> &middot; <a href="/page?page=${p}">render</a> &middot; <a href="/raw?page=${p}">raw HTML (text)</a> &middot; <a href="view-source:${'/page?page=' + p}">view-source</a> &middot; <a href="/stats.json?page=${p}">stats</a></li>`).join('');
  return `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Fizz streaming: ${esc(v.variant)}</title>
<style>body{font:15px/1.5 system-ui;max-width:760px;margin:24px auto;padding:0 16px}code{background:#8882;padding:1px 5px;border-radius:4px}li{margin:6px 0}</style>
<h1>Fizz streaming demo</h1>
<p>variant <code>${esc(v.variant)}</code> &middot; ${esc(v.repo)}@<code>${esc(v.ref)}</code> (<code>${esc(v.sha.slice(0, 8))}</code>) &middot; React <code>${esc(React.version)}</code><br>
flags forced on: ${v.flags.length ? v.flags.map(f => `<code>${esc(f)}</code>`).join(' ') : 'none'}</p>
<p>Each page is rendered live and streamed by this Worker. <b>raw HTML</b> shows the exact bytes as they arrive. Open another variant's URL and compare.</p>
<ul>${links}</ul>
<p>Extra params: <code>mode=decl|script</code> (declarative patching vs <code>$RC</code> scripts; only effective on builds with the flag), <code>n=500</code> (heavy boundaries), <code>cssMs=900</code>, <code>order=forwards|reverse</code>.</p>`;
}

export default {
  async fetch(req) {
    const url = new URL(req.url), q = url.searchParams;
    if (url.pathname === '/') return new Response(index(), { headers: { 'content-type': 'text/html; charset=utf-8' } });
    if (url.pathname === '/slow.css') {
      await new Promise(r => setTimeout(r, Number(q.get('ms') || 900)));
      return new Response('body{outline:0 solid transparent}.fb{color:#888}', { headers: { 'content-type': 'text/css' } });
    }
    if (url.pathname === '/page') return new Response(await stream(q), { headers: { 'content-type': 'text/html; charset=utf-8' } });
    if (url.pathname === '/raw') return new Response(await stream(q), { headers: { 'content-type': 'text/plain; charset=utf-8', 'x-content-type-options': 'nosniff' } });
    if (url.pathname === '/stats.json') {
      const reader = (await stream(q)).getReader();
      let bytes = 0, writes = 0;
      for (;;) { const { done, value } = await reader.read(); if (done) break; bytes += value.length; writes++; }
      return Response.json({ ...version, react: React.version, page: opts(q).page, bytes, writes });
    }
    return new Response('not found', { status: 404 });
  },
};
