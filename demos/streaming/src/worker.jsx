import * as React from 'react';
import {renderToReadableStream} from 'react-dom/server.browser';
import {createScenarios, DPU_SET, META, GROUPS, RECORDER} from './scenarios.js';
import version from './version.json';

const CSS = `body{font:15px/1.4 system-ui,sans-serif;max-width:960px;margin:0 auto;padding:16px;color:#18181b;background:#fafafa}
nav a{margin-right:8px}.meta{color:#52525b;font-size:13px}.toc{columns:2;font-size:13px}
.card{background:#fff;border:1px solid #e4e4e7;border-radius:10px;padding:12px;margin:12px 0}
.card h3{margin:0 0 6px}.card small{color:#71717a;font-weight:400;margin-left:6px}
.expected{background:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;padding:6px 10px;font-size:13px;margin:6px 0}
.stage{border:1px dashed #d4d4d8;border-radius:6px;padding:10px;background:#fafafa;min-height:32px;overflow:auto}
.panel{border:1px solid #bae6fd;background:#f0f9ff;border-radius:6px;padding:8px;margin:4px 0}
.grid10{display:grid;grid-template-columns:repeat(10,1fr);gap:4px}.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.done{background:#a7f3d0;border-radius:4px;padding:6px;text-align:center}.pulse{background:#e4e4e7;border-radius:4px;padding:6px;text-align:center}
button{padding:4px 10px}
#dpu-diag{background:#fff;border:1px solid #e4e4e7;border-radius:10px;padding:10px 14px;margin:12px 0}
#dpu-diag th{text-align:left;font-weight:400;padding-right:16px}#dpu-diag td{font-variant-numeric:tabular-nums}
.ok{color:#047857;font-weight:600}.bad{color:#b91c1c;font-weight:700}#dpu-diag pre{font-size:12px;max-height:200px;overflow:auto}
#controls{background:#fff;border:1px solid #e4e4e7;border-radius:10px;padding:10px 14px;margin:12px 0}
#controls summary{cursor:pointer;font-weight:600}#controls fieldset{border:1px solid #e4e4e7;border-radius:8px;margin:8px 0;padding:6px 10px}
#controls legend{font-size:13px;color:#52525b}#controls label{display:inline-block;margin:2px 12px 2px 0;font-size:13px}
#controls .list{columns:2}#controls .list label{display:block}#controls .bar{position:sticky;bottom:0;background:#fff;padding:8px 0}
.styled{display:block;background-color:rgb(0,128,0);padding:40px;color:#fff}`;

const esc = x => String(x).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

function controls({scale, hydrate, mode, polyfill, selected, nonce}) {
  const radio = (name, val, cur, label = val) =>
    `<label><input type="radio" name="${name}" value="${esc(val)}"${String(cur) === String(val) ? ' checked' : ''}> ${esc(label)}</label>`;
  const groups = GROUPS.map(g => {
    const items = META.filter(x => x.group === g).map(x =>
      `<label title="${esc(x.expected)}"><input type="checkbox" name="only" value="${x.id}" data-g="${g}"${selected.has(x.id) ? ' checked' : ''}> ${esc(x.title)}</label>`
    ).join('');
    return `<fieldset><legend>${g} <a href="#" data-sel="${g}:1">all</a> / <a href="#" data-sel="${g}:0">none</a></legend><div class="list">${items}</div></fieldset>`;
  }).join('');
  return `<details id="controls" open><summary>Choose scenarios &amp; options</summary>
<form method="GET" action="/">
<fieldset><legend>Hydration</legend>${radio('hydrate', 'late', hydrate, 'late (after stream)')}${radio('hydrate', 'early', hydrate, 'early (mid-stream)')}${radio('hydrate', 'off', hydrate, 'off (no JS)')}</fieldset>
<fieldset><legend>Mode</legend>${radio('mode', 'decl', mode, 'declarative (<template for>)')}${radio('mode', 'script', mode, 'classic $RC')}</fieldset>
<fieldset><legend>Speed (delay ×)</legend>${[1, 2, 3, 5].map(n => radio('scale', n, scale, '×' + n)).join('')}</fieldset>
<fieldset><legend>Options</legend><label><input type="checkbox" name="polyfill" value="1"${polyfill ? ' checked' : ''}> template-for polyfill</label></fieldset>
<fieldset><legend>Scenarios <a href="#" data-sel="*:1">all</a> / <a href="#" data-sel="*:0">none</a></legend></fieldset>
${groups}
<div class="bar"><button type="submit">Run selected</button> <a href="/">reset</a></div>
</form>
<script${nonce ? ` nonce="${nonce}"` : ''}>document.addEventListener('click',function(e){var a=e.target.closest('[data-sel]');if(!a)return;e.preventDefault();var p=a.dataset.sel.split(':'),on=p[1]==='1';document.querySelectorAll('#controls input[name=only]').forEach(function(i){if(p[0]==='*'||i.dataset.g===p[0])i.checked=on})})</script>
</details>`;
}

const PANEL = `<section id="dpu-diag"><h2>DPU diagnostics</h2>
<table><tbody id="dpu-rows"></tbody></table>
<details><summary>per-call log</summary><pre id="dpu-log"></pre></details></section>
<script nonce="__N__">(function(){
function row(k,v,ok){return '<tr><th>'+k+'</th><td class="'+(ok===true?'ok':ok===false?'bad':'')+'">'+v+'</td></tr>'}
function paint(){var r=window.__rp||{calls:0,ids:0,hadTemplate:0,errors:0,maxGap:0,inits:0},
 left=document.querySelectorAll('template[for]').length,fb=document.querySelectorAll('[data-testid=fallback]').length,
 done=document.readyState==='complete', nativeSupport=('htmlFor' in (HTMLTemplateElement.prototype||{}));
 document.getElementById('dpu-rows').innerHTML=
  row('native <template for> support', nativeSupport, !!nativeSupport)+
  row('$RP init (expect 1 on DPU builds)',r.inits,r.inits===0||r.inits===1)+
  row('$RP calls',r.calls)+
  row('calls that still had template',r.hadTemplate)+
  row('leftover &lt;template for&gt; '+(done?'(final)':'(streaming…)'),left,done?left===0:undefined)+
  row('fallbacks still showing',fb)+
  row('uncaught errors',r.errors,r.errors===0)+
  row('worst main-thread stall (ms)',Math.round(r.maxGap),r.maxGap<500)+
  row('document.readyState',document.readyState);
 document.getElementById('dpu-log').textContent='calls='+r.calls+' ids='+r.ids+' hadTemplate='+r.hadTemplate}
paint();setInterval(paint,250)})();</script>`;

function head(opts) {
  const {hydrate, props, ui, dpuPage, nonce, polyfill} = opts;
  return (
    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<title>React Fizz streaming — ${esc(version.variant)}</title><style>${CSS}</style>` +
    `<script type="application/json" id="__props">${JSON.stringify(props).replace(/</g, '\\u003c')}</script>` +
    (dpuPage ? `<script${nonce ? ` nonce="${nonce}"` : ''}>${RECORDER}</script>` : '') +
    (polyfill ? `<script${nonce ? ` nonce="${nonce}"` : ''} src="/polyfill.js"></script>` : '') +
    (hydrate === 'early' ? `<script async src="/client.js"></script>` : '') +
    `</head><body>` +
    `<p class="meta">variant <code>${esc(version.variant)}</code> · ${esc(version.repo)}@<code>${esc(version.ref)}</code> (<code>${esc(String(version.sha).slice(0, 8))}</code>) · React <code>${esc(React.version)}</code>` +
    ` · flags ${version.flags?.length ? version.flags.map(f => `<code>${esc(f)}</code>`).join(' ') : 'none'}</p>` +
    `<nav><a href="/">all</a> <a href="/dpu">dpu diagnostics</a> <a href="/dpu?csp=strict">dpu + strict CSP</a> ` +
    GROUPS.map(g => `<a href="/?group=${g}">${g}</a>`).join(' ') +
    ` | hydrate: <a href="?hydrate=late">late</a> <a href="?hydrate=early">early</a> <a href="?hydrate=off">off</a>` +
    ` | <a href="/index.json">index.json</a></nav>` +
    (dpuPage ? PANEL.replace('__N__', nonce || '') : '') +
    controls({...ui, nonce}) +
    `<div id="root">`
  );
}
const tail = hydrate => `</div>${hydrate === 'late' ? '<script defer src="/client.js"></script>' : ''}</body></html>`;

const multi = (q, k) => q.getAll(k).flatMap(v => v.split(',')).filter(Boolean);

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const q = url.searchParams;
    const scale = Number(q.get('scale') || 1);
    const hydrate = q.get('hydrate') || 'late';
    const mode = q.get('mode') || (version.flags?.includes('enableFizzDeclarativePatching') ? 'decl' : 'script');
    const polyfill = q.get('polyfill') === '1';

    if (url.pathname === '/index.json') {
      return Response.json({
        ...version,
        react: React.version,
        scenarios: META.map(({id, group, title, expected}) => ({id, group, title, expected, url: `/s/${id}`})),
      });
    }
    if (url.pathname === '/client.js' || url.pathname === '/polyfill.js' || url.pathname === '/health') {
      return env.ASSETS ? env.ASSETS.fetch(req) : new Response('ok');
    }
    if (url.pathname === '/slow.css') {
      await new Promise(r => setTimeout(r, Number(q.get('ms') || 700)));
      return new Response('.styled{display:block;background-color:rgb(0,128,0);padding:40px;color:#fff}', {
        headers: {'content-type': 'text/css', 'cache-control': 'no-store'},
      });
    }

    let only = multi(q, 'only').length ? multi(q, 'only') : undefined;
    const dpuPage = url.pathname === '/dpu';
    if (dpuPage && !only) only = DPU_SET;
    const m = url.pathname.match(/^\/s\/([\w-]+)$/);
    if (m) only = [m[1]];
    if (url.pathname !== '/' && url.pathname !== '/dpu' && !m) {
      return new Response('not found', {status: 404});
    }
    const skip = multi(q, 'skip').length ? multi(q, 'skip') : undefined;
    const group = q.get('group') || undefined;
    if (group && !only) only = META.filter(x => x.group === group && !x.solo).map(x => x.id);
    const props = {only, skip, version, scale, hydrate, mode, polyfill};
    const selected = new Set((only || DPU_SET).filter(id => !(skip || []).includes(id)));
    const nonce = q.get('csp') === 'strict' ? crypto.randomUUID().replace(/-/g, '') : '';
    const ui = {scale, hydrate, mode, polyfill, selected};

    const ctx = {cache: new Map(), scale, n: Number(q.get('n') || 0), hydrate, polyfill};
    const {App} = createScenarios(React, ctx);
    const stream = await renderToReadableStream(React.createElement(App, props), {
      unstable_declarativePatching: mode === 'decl',
      onError(e) { console.error(e); },
    });

    // Copy each React chunk: Fizz reuses the underlying ArrayBuffer (error #612 in workerd).
    const enc = new TextEncoder();
    const body = new ReadableStream({
      async start(c) {
        c.enqueue(enc.encode(head({hydrate, props, ui, dpuPage, nonce, polyfill})));
        const r = stream.getReader();
        for (;;) {
          const {done, value} = await r.read();
          if (done) break;
          c.enqueue(value.slice());
        }
        c.enqueue(enc.encode(tail(hydrate)));
        c.close();
      },
    });
    return new Response(body, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        ...(nonce ? {'content-security-policy': `script-src 'self' 'nonce-${nonce}'`} : {}),
      },
    });
  },
};
