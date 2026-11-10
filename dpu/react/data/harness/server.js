'use strict';
// Test server: React Fizz declarative patching, Preact-style scenario pages.
//   GET /dpu | /s/<id>  ?mode=decl|script &hydrate=off|late|early &polyfill=1 &batchMs=N &only= &skip=
const fs = require('fs'), http = require('http'), path = require('path');
const {createRequire} = require('module');
const ROOT = process.env.REACT_ROOT, PORT = Number(process.env.PORT || 3010);
const rootRequire = createRequire(path.join(ROOT, 'noop.js'));
const React = rootRequire('react');
const {renderToPipeableStream} = rootRequire('react-dom/server');
const createScenarios = require('./scenarios.js');
const esbuild = require(process.env.ESBUILD);
let clientBundle;
async function buildClient() {
  const nm = path.join(ROOT, 'node_modules');
  const r = await esbuild.build({entryPoints: [path.join(__dirname, 'client.js')], bundle: true, write: false, minify: true,
    define: {'process.env.NODE_ENV': '"production"'},
    alias: {react: path.join(nm, 'react'), 'react-dom': path.join(nm, 'react-dom'), scheduler: path.join(nm, 'scheduler')}});
  clientBundle = r.outputFiles[0].text;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
const send = (res, type, body) => { res.writeHead(200, {'content-type': type, 'cache-control': 'no-store'}); res.end(body); };
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname, q = url.searchParams;
  if (p === '/client.js') { await sleep(Number(q.get('delay') || 0)); return send(res, 'text/javascript', clientBundle); }
  if (p === '/polyfill.js') return send(res, 'text/javascript', fs.readFileSync(path.join(__dirname, 'polyfill.js')));
  if (p === '/slow.css') { await sleep(Number(q.get('ms') || 0)); return send(res, 'text/css', '.styled{display:block;background-color:rgb(0,128,0);padding:40px;color:#fff}'); }
  const m = p.match(/^\/s\/([\w-]+)$/);
  if (p !== '/dpu' && !m) { res.writeHead(p === '/favicon.ico' ? 204 : 404); return res.end(); }
  const multi = k => q.getAll(k).flatMap(v => v.split(',')).filter(Boolean);
  const mode = q.get('mode') || 'decl', hydrate = q.get('hydrate') || 'off';
  const ctx = {cache: new Map(), polyfill: q.get('polyfill') === '1', hydrate};
  const {App} = createScenarios(React, ctx);
  const {pipe} = renderToPipeableStream(React.createElement(App, {only: m ? [m[1]] : multi('only'), skip: multi('skip')}), {
    bootstrapScripts: hydrate === 'early' ? ['/client.js'] : undefined,
    unstable_declarativePatching: mode === 'decl',
    unstable_declarativeBatchMs: q.has('batchMs') ? Number(q.get('batchMs')) : undefined,
    onShellReady() { res.writeHead(200, {'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store'}); pipe(res); },
    onShellError(e) { res.writeHead(500); res.end(String(e && e.stack || e)); },
    onError(e) { console.error('server error:', e && e.message); },
  });
}).listen(PORT, () => console.log('listening', PORT));
buildClient().then(() => console.log('client built'));
