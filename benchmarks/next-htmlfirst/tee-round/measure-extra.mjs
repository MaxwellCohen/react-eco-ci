// usage: VARIANTS=t-off,t-reg,t-tee CC=t-cc-off,t-cc-reg,t-cc-tee OUT=name node measure-extra.mjs
// Prerendered page bytes and stored payload, cacheComponents PPR/static page bytes and DOM checks,
// router.refresh() main-thread ms (refresh-cpu.mjs method) and DOM nodes / JS heap after leaving /table (mem.mjs method).
// Variants are interleaved per trial. The first variant of each list is the baseline for DOM comparisons.
import { spawn } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
const require = createRequire('/Users/maxcohen/code/react-ecosystem/wakujs/package.json');
const { chromium } = require('@playwright/test');
const H = '/Users/maxcohen/code/react-ecosystem/next-htmlfirst-bench';
const B = `${H}/.build`;
const variants = (process.env.VARIANTS || 't-off,t-reg,t-tee').split(',');
const ccVariants = (process.env.CC || 't-cc-off,t-cc-reg,t-cc-tee').split(',');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const stats = (a) => ({ median: median(a), min: Math.min(...a), max: Math.max(...a), samples: a });
const ports = {};
const servers = [];
[...variants, ...ccVariants].forEach((v, i) => {
  ports[v] = 8201 + i;
  servers.push(spawn(`${B}/${v}/node_modules/.bin/next`, ['start', '--port', String(ports[v])], { cwd: `${B}/${v}`, stdio: 'ignore', detached: true, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } }));
});
const cleanup = () => servers.forEach((s) => { try { process.kill(-s.pid); } catch {} });
process.on('exit', cleanup);
await sleep(6000);
const url = (v, p) => `http://localhost:${ports[v]}${p}`;
const flightBytes = (html) => [...html.matchAll(/<script[^>]*>self\.__next_f\.push\([\s\S]*?<\/script>/g)].reduce((n, m) => n + Buffer.byteLength(m[0]), 0);
const out = { config: { variants, ccVariants, node: process.version }, bytes: {}, stored: {}, refresh: {}, mem: {}, cc: {} };

// ---- bytes: prerendered /static-table, cc /ppr and /static (5 samples) ----
for (const [vs, paths] of [[variants, ['/static-table']], [ccVariants, ['/ppr', '/static']]]) for (const v of vs) for (const p of paths) {
  const fl = [], gz = [], raw = [], st = [];
  for (let i = 0; i < 5; i++) {
    const r = await fetch(url(v, p)); const html = await r.text();
    st.push(r.status); raw.push(Buffer.byteLength(html)); gz.push(gzipSync(html, { level: 6 }).length); fl.push(flightBytes(html));
  }
  out.bytes[`${p}/${v}`] = { flight: stats(fl), gzip: stats(gz), raw: stats(raw), status: st };
}
// stored payloads
for (const v of [...variants, ...ccVariants]) for (const p of ['static-table', 'static', 'ppr']) {
  try { const f = `${B}/${v}/.next/server/app/${p}.rsc`; const s = readFileSync(f, 'utf8'); out.stored[`${p}/${v}`] = { bytes: statSync(f).size, stubs: (s.match(/"\$J\d+:/g) || []).length }; } catch {}
}

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
// ---- refresh main-thread ms (refresh-cpu.mjs): 5 trials, two refreshes each ----
for (let trial = 0; trial < 5; trial++) for (const v of trial % 2 ? [...variants].reverse() : variants) {
  const p = await browser.newPage(); const cdp = await p.context().newCDPSession(p);
  await p.goto(url(v, '/table'), { waitUntil: 'networkidle' }); await sleep(400);
  const res = [];
  for (let k = 0; k < 2; k++) {
    await cdp.send('Performance.enable');
    const m0 = (await cdp.send('Performance.getMetrics')).metrics;
    await p.evaluate(() => window.next.router.refresh());
    await sleep(2000);
    const m1 = (await cdp.send('Performance.getMetrics')).metrics;
    const g = (m, n) => m.find((x) => x.name === n).value;
    const sum = (m) => g(m, 'ScriptDuration') + g(m, 'LayoutDuration') + g(m, 'RecalcStyleDuration');
    res.push(Math.round((sum(m1) - sum(m0)) * 1000));
  }
  (out.refresh[v] ??= []).push(res);
  await p.close();
}
// ---- DOM nodes / heap after leaving /table (mem.mjs): 3 trials ----
for (let trial = 0; trial < 3; trial++) for (const v of trial % 2 ? [...variants].reverse() : variants) {
  const p = await browser.newPage(); const cdp = await p.context().newCDPSession(p);
  await cdp.send('Performance.enable');
  const snap = async () => { await cdp.send('HeapProfiler.collectGarbage'); await sleep(300); await cdp.send('HeapProfiler.collectGarbage'); const m = (await cdp.send('Performance.getMetrics')).metrics; const g = (n) => m.find((x) => x.name === n).value; return { nodes: g('Nodes'), heapMB: +(g('JSHeapUsedSize') / 1e6).toFixed(2) }; };
  await p.goto(url(v, '/table'), { waitUntil: 'networkidle' }); await sleep(500);
  const onTable = await snap();
  await p.evaluate(() => window.next.router.push('/modal')); await p.waitForURL((u) => u.pathname === '/modal'); await p.locator('#open').waitFor(); await sleep(800);
  const away = await snap();
  (out.mem[v] ??= []).push({ onTable, away });
  await p.close();
}
// ---- cc pages in Chromium (cc-check.mjs): DOM vs baseline, client nav and back ----
const norm = (s) => s.replace(/19\.3\.0-(experimental|canary)-[0-9a-f]{8}-\d{8}/g, 'VER').replace(/<p id="now">[^<]*<\/p>/g, '<p id="now">T</p>');
const dom = async (p) => norm(await p.evaluate(() => { const c = document.body.cloneNode(true); c.querySelectorAll('script').forEach((s) => s.remove()); return c.innerHTML; }));
const ccDom = {};
for (const v of ccVariants) {
  const p = await browser.newPage(); const logs = [];
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(m.text().slice(0, 150)); });
  p.on('pageerror', (e) => logs.push('pageerror ' + String(e).slice(0, 150)));
  const r = { logs };
  try {
    for (const path of ['/static', '/ppr']) { await p.goto(url(v, path), { waitUntil: 'networkidle' }); await sleep(500); const d = await dom(p); if (v === ccVariants[0]) ccDom[path] = d; else r['domMatches' + path] = d === ccDom[path]; }
    await p.evaluate(() => window.next.router.push('/static')); await p.waitForURL((u) => u.pathname === '/static'); await p.locator('tbody tr').nth(499).waitFor({ timeout: 15000 });
    r.navRows = await p.locator('tbody tr').count();
    await p.goBack(); await p.waitForURL((u) => u.pathname === '/ppr'); await p.locator('#now').waitFor(); await p.locator('tbody tr').nth(499).waitFor({ timeout: 15000 });
    r.backRows = await p.locator('tbody tr').count();
  } catch (e) { r.error = e.message.slice(0, 200); }
  out.cc[v] = r;
  await p.close();
}
await browser.close();
cleanup();
out.summary = {
  refresh: Object.fromEntries(variants.map((v) => [v, [median(out.refresh[v].map((r) => r[0])), median(out.refresh[v].map((r) => r[1]))]])),
  mem: Object.fromEntries(variants.map((v) => [v, { onTableNodes: median(out.mem[v].map((x) => x.onTable.nodes)), onTableHeapMB: median(out.mem[v].map((x) => x.onTable.heapMB)), awayNodes: median(out.mem[v].map((x) => x.away.nodes)), awayHeapMB: median(out.mem[v].map((x) => x.away.heapMB)) }])),
};
writeFileSync(`${H}/results/${process.env.OUT || 'extra'}.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ bytes: Object.fromEntries(Object.entries(out.bytes).map(([k, x]) => [k, { flight: x.flight.median, gzip: x.gzip.median, status: x.status[0] }])), stored: out.stored, summary: out.summary, cc: out.cc }, null, 1));
