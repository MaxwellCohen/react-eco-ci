#!/usr/bin/env node
// Pre-render flight-ssr-bench scenarios for Cloudflare Workers hosting.
// Usage:
//   SCENARIO_BUILDS=<dir> FIXTURE=<flight-ssr-bench> node scripts/export-html-first-pages.mjs \
//     [--size smoke|full] [--variants off,all,tee] [--out .build/html-first-pages] \
//     [--build <variant>=<dir> ...] [--index-variants off,all,tee]
// --build overrides one variant's React build (e.g. tee=<oss-experimental dir>).
// --index-variants sets the links listed in index.html/index.json (default: --variants),
// so a tee-only export can be merged into an existing off/all public/ dir.
// --existing-public <dir>: an already-deployed public/ dir; a variant link is listed for a
// scenario only if its page exists in the export or in that dir (e.g. no registry page).
import {spawnSync} from 'node:child_process';
import {
  mkdirSync,
  writeFileSync,
  existsSync,
  readFileSync,
  renameSync,
  readdirSync,
  statSync,
} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {homedir} from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
function flag(name, fallback) {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
}
const size = flag('--size', 'smoke');
const variants = flag('--variants', 'off,all').split(',').filter(Boolean);
const indexVariants = flag('--index-variants', variants.join(',')).split(',').filter(Boolean);
// --publish-as <variant>=<name>: publish that exported variant under another name
// (the final build is the fixture's `all` variant, published as /tee/).
const publishAs = {};
args.forEach((a, i) => {
  if (a === '--publish-as') {
    const [v, n] = args[i + 1].split('=');
    publishAs[v] = n;
  }
});
const existingPublic = flag('--existing-public', '');
// --only a,b: export just these scenario ids; with --existing-public the index keeps the
// existing public/index.json's scenarios and only updates these entries and the links.
const only = flag('--only', '');
// --client-name <file>: name of the exported client bundle (default client.js), so a
// differing bundle does not overwrite the one already deployed for that variant.
const clientName = flag('--client-name', 'client.js');
const buildFlags = [];
args.forEach((a, i) => {
  if (a === '--build') buildFlags.push('--build', args[i + 1]);
});
const out = resolve(flag('--out', join(root, '.build/html-first-pages')));
const fixture = resolve(
  process.env.FIXTURE || join(root, 'fixtures/flight-ssr-bench'),
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
          '<script src="/' + w.name + '/' + ${JSON.stringify(clientName)} + '" defer></script></body></html>',
        );
        fs.writeFileSync(path.join(vDir, s.id + '.html'), html);
        fs.writeFileSync(path.join(vDir, 'rsc', s.id), f.flight);
        process.stdout.write('.');
      }
    }
    for (const w of ctx.workers) {
      const client = path.join(ctx.dirs[w.name], 'build-client/client.js');
      fs.copyFileSync(client, path.join(outDir, w.name, ${JSON.stringify(clientName)}));
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
  [exporter, '--builds', builds, ...buildFlags, ...(only ? ['--only', only] : []), '--variants', variants.join(','), '--size', size],
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
for (const [v, n] of Object.entries(publishAs)) {
  renameSync(join(pub, v), join(pub, n));
  for (const f of readdirSync(join(pub, n))) {
    if (!f.endsWith('.html')) continue;
    const fp = join(pub, n, f);
    writeFileSync(fp, readFileSync(fp, 'utf8').replace('src="/' + v + '/' + clientName + '"', 'src="/' + n + '/' + clientName + '"'));
  }
}

// Scrub absolute machine paths from Flight module rows / HTML / RSC / client bundles.
// Client module ids often embed the fixture absolute path; never publish those.
function scrubPrivatePaths(text) {
  let s = text;
  // Collapse anything up through fixtures/flight-ssr-bench/
  s = s.replace(
    /(?:\/(?:private\/)?tmp\/|\/var\/folders\/|\/Users\/|\/home\/)[^"'\\\s<>]*?\/fixtures\/flight-ssr-bench\//g,
    'fixtures/flight-ssr-bench/',
  );
  // Same for JS-string-escaped slashes (\/private\/tmp\/…\/fixtures\/flight-ssr-bench\/)
  s = s.replace(
    /(?:\\\/(?:private\\\/)?tmp\\\/|\\\/var\\\/folders\\\/|\\\/Users\\\/|\\\/home\\\/)[^"'\\\s<>]*?\\\/fixtures\\\/flight-ssr-bench\\\//g,
    'fixtures\\/flight-ssr-bench\\/',
  );
  // Remaining absolute roots that may appear outside the fixture suffix
  const roots = [resolve(fixture, '../..'), resolve(fixture), resolve(builds)];
  for (const root of roots) {
    if (!root || root === '/') continue;
    const esc = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp(esc, 'g'), '[scrubbed]');
  }
  s = s.replace(/\/private\/tmp\/[^"'\\\s<>]+/g, '[scrubbed]');
  s = s.replace(new RegExp(homedir().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/[^"\'\\\\\\s<>]+', 'g'), '[scrubbed]');
  return s;
}
function walkScrub(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      walkScrub(p);
      continue;
    }
    // HTML/JS/JSON plus extensionless RSC payloads
    if (/\.(html|js|json|map)$/.test(name) || !name.includes('.')) {
      const before = readFileSync(p, 'utf8');
      const after = scrubPrivatePaths(before);
      if (after !== before) writeFileSync(p, after);
    }
  }
}
walkScrub(pub);

const meta = JSON.parse(readFileSync(join(pub, 'index.json'), 'utf8'));
const esc = s =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

meta.variants = indexVariants;
if (only && existingPublic) {
  const prev = JSON.parse(readFileSync(join(resolve(existingPublic), 'index.json'), 'utf8'));
  const fresh = new Map(meta.scenarios.map(s => [s.id, s]));
  meta.scenarios = prev.scenarios.map(s => ({...s, ...(fresh.get(s.id) || {})}));
}
const has = (v, id) =>
  existsSync(join(pub, v, id + '.html')) ||
  (existingPublic && existsSync(join(resolve(existingPublic), v, id + '.html')));
const label = v => (v === 'all' ? 'registry' : v);
for (const s of meta.scenarios) s.variants = indexVariants.filter(v => has(v, s.id));
writeFileSync(join(pub, 'index.json'), JSON.stringify(meta, null, 2));

const missingRegistry = meta.scenarios.filter(s => !s.variants.includes('all')).map(s => s.id);
const noRegistry = missingRegistry.length
  ? missingRegistry.map(id => '<code>' + id + '</code>').join(', ') +
    (missingRegistry.length > 1 ? ' have' : ' has') +
    ' no registry page' +
    (missingRegistry.includes('client-aschild-slot')
      ? ': the registry hands a Client Component its direct child as a lazy reference, so <code>Children.only</code> throws during SSR (the tee keeps that child a real element).'
      : '.')
  : 'Every scenario has a registry page.';
const registryNote = meta.scenarios.some(s => s.id === 'client-children-inspect' && s.variants.includes('all'))
  ? ' The registry page of <code>client-children-inspect</code> shows the registry limit: SSR is complete, but in the browser the client components see lazy stubs instead of their children, so hydration mismatches and the list renders empty.'
  : '';
const rows = meta.scenarios
  .map(s => {
    const links = s.variants.map(v => `<a href="/${v}/${s.id}">${label(v)}</a>`).join(' · ');
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
<code>off</code> = the flag off; <code>registry</code> = <code>enableFlightHTMLFirst</code> on and the render opted in with <code>htmlFirst: true</code> (the PR #24 build from Nov 19, registry design); <code>tee</code> = the final build, React <code>d5dd0f51</code> (PR #28 @ 6f7f804093, Nov 23 2026): the same flag over the Flight tee (SSR passes <code>{htmlFirst: true, tee}</code> and reads with <code>createFromTee</code>). ${noRegistry}${registryNote} Size: <code>${esc(size)}</code>.</p>
<p>Source: <a href="https://github.com/MaxwellCohen/react/pull/24">PR #24</a> (registry) · <a href="https://github.com/MaxwellCohen/react/pull/28">PR #28</a> (tee) · fixture <code>flight-ssr-bench</code>.</p>
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
