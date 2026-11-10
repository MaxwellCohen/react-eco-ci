#!/usr/bin/env node
// Pre-render flight-ssr-bench scenarios for Cloudflare Workers hosting.
// Usage:
//   SCENARIO_BUILDS=<dir> FIXTURE=<flight-ssr-bench> node scripts/export-html-first-pages.mjs \
//     [--size smoke|full] [--variants off,all] [--out .build/html-first-pages]
import {spawnSync} from 'node:child_process';
import {mkdirSync, writeFileSync, existsSync, readFileSync, renameSync, readdirSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
function flag(name, fallback) {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
}
const size = flag('--size', 'smoke');
const variants = flag('--variants', 'off,all').split(',').filter(Boolean);
const out = resolve(flag('--out', join(root, '.build/html-first-pages')));
const fixture = resolve(
  process.env.FIXTURE ||
    '/private/tmp/claude-501/-Users-maxcohen-code-react-ecosystem/5438c7db-c430-4036-93af-a9b1d4699b04/scratchpad/oneflag-wt/fixtures/flight-ssr-bench',
);
const builds = resolve(
  process.env.SCENARIO_BUILDS ||
    '/private/tmp/claude-501/-Users-maxcohen-code-react-ecosystem/5438c7db-c430-4036-93af-a9b1d4699b04/scratchpad/builds-oneflag',
);

if (!existsSync(fixture)) throw new Error('FIXTURE not found: ' + fixture);
if (!existsSync(builds)) throw new Error('SCENARIO_BUILDS not found: ' + builds);

const exporter = join(fixture, 'export-cf-pages.js');
writeFileSync(
  exporter,
  `'use strict';
const fs = require('fs');
const path = require('path');
const {parseArgs} = require('./scenarios-lib/common');
const {boot} = require('./scenarios-lib/boot');

(async () => {
  const opts = parseArgs(process.argv.slice(2));
  const outDir = process.env.EXPORT_OUT;
  if (!outDir) throw new Error('EXPORT_OUT required');
  fs.rmSync(outDir, {recursive: true, force: true});
  fs.mkdirSync(outDir, {recursive: true});
  const ctx = await boot(opts, {client: true});
  const index = {size: opts.size, variants: opts.variants, scenarios: []};
  try {
    for (const s of ctx.scenarios) {
      index.scenarios.push({
        id: s.id,
        title: s.title,
        category: s.category,
        description: s.description || '',
        size: s.size,
      });
      for (const w of ctx.workers) {
        const r = await w.call('render', {
          id: s.id,
          size: s.size,
          recoverErrors: s.allowRecoverableErrors,
        });
        const f = await w.call('flight', {id: s.id, size: s.size});
        const vDir = path.join(outDir, w.name);
        fs.mkdirSync(path.join(vDir, 'rsc'), {recursive: true});
        const html = r.html.replace(
          '</body></html>',
          '<script src="/' + w.name + '/client.js" defer></script></body></html>',
        );
        fs.writeFileSync(path.join(vDir, s.id + '.html'), html);
        fs.writeFileSync(path.join(vDir, 'rsc', s.id), f.flight);
        process.stdout.write('.');
      }
    }
    for (const w of ctx.workers) {
      const client = path.join(ctx.dirs[w.name], 'build-client/client.js');
      fs.copyFileSync(client, path.join(outDir, w.name, 'client.js'));
    }
    fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
    console.log('\\nexported', index.scenarios.length, 'scenarios x', opts.variants.length, 'variants ->', outDir);
  } finally {
    ctx.kill();
  }
})().catch(e => {
  console.error(e);
  process.exit(1);
});
`,
);

const result = spawnSync(
  process.execPath,
  [exporter, '--builds', builds, '--variants', variants.join(','), '--size', size],
  {
    cwd: fixture,
    env: {...process.env, NODE_ENV: 'production', EXPORT_OUT: out, SCENARIO_BUILDS: builds},
    stdio: 'inherit',
  },
);
if (result.status) process.exit(result.status || 1);

// Move rendered files under public/ so wrangler assets don't include worker.js
const pub = join(out, 'public');
mkdirSync(pub, {recursive: true});
for (const name of readdirSync(out)) {
  if (name === 'public') continue;
  renameSync(join(out, name), join(pub, name));
}

const meta = JSON.parse(readFileSync(join(pub, 'index.json'), 'utf8'));
const esc = s =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const rows = meta.scenarios
  .map(s => {
    const links = variants.map(v => `<a href="/${v}/${s.id}">${v}</a>`).join(' · ');
    return `<tr><td><code>${esc(s.id)}</code><div class="t">${esc(s.title || '')}</div></td><td>${links}</td></tr>`;
  })
  .join('\n');

writeFileSync(
  join(pub, 'index.html'),
  `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>HTML-first scenario live demos</title>
<style>body{font:15px/1.45 system-ui,sans-serif;max-width:900px;margin:24px auto;padding:0 16px;color:#18181b}
table{border-collapse:collapse;width:100%}td,th{border-top:1px solid #e4e4e7;padding:8px;text-align:left;vertical-align:top}
.t{color:#52525b;font-size:.9rem}code{background:#f4f4f5;padding:0 4px;border-radius:4px}
a{color:#0b57d0}</style>
<h1>HTML-first Flight — live scenario demos</h1>
<p>Same corpus as <a href="https://html-first-react.pages.dev/examples/">the examples index</a>, pre-rendered and hosted on Cloudflare Workers.
<code>all</code> = <code>enableFlightHtmlFirst</code> on with framework opt-in; <code>off</code> = stock flags-off. Size: <code>${esc(size)}</code>.</p>
<p>Source: <a href="https://github.com/MaxwellCohen/react/pull/24">PR #24</a> · fixture <code>flight-ssr-bench</code>.</p>
<table><thead><tr><th>Scenario</th><th>Live</th></tr></thead><tbody>
${rows}
</tbody></table>
`,
);

writeFileSync(
  join(out, 'worker.js'),
  `export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    let p = url.pathname;
    if (p === '/' || p === '') p = '/index.html';
    const m = p.match(/^\\/([\\w-]+)\\/([\\w-]+)$/);
    if (m && m[2] !== 'client.js' && m[2] !== 'rsc') {
      p = '/' + m[1] + '/' + m[2] + '.html';
    }
    const res = await env.ASSETS.fetch(new Request(new URL(p, url.origin), req));
    if (res.status === 404) return new Response('not found: ' + p, {status: 404});
    const headers = new Headers(res.headers);
    if (p.includes('/rsc/')) headers.set('content-type', 'text/x-component');
    else if (p.endsWith('.html')) headers.set('content-type', 'text/html; charset=utf-8');
    headers.set('cache-control', 'no-store');
    return new Response(res.body, {status: res.status, headers});
  },
};
`,
);

writeFileSync(
  join(out, 'wrangler.jsonc'),
  JSON.stringify(
    {
      name: 'react-eco-html-first',
      main: 'worker.js',
      compatibility_date: '2026-01-01',
      assets: {
        directory: 'public',
        binding: 'ASSETS',
        run_worker_first: true,
        html_handling: 'none',
      },
    },
    null,
    2,
  ),
);

console.log('ready to deploy from', out);
console.log('  cd', out, '&& npx wrangler deploy');
