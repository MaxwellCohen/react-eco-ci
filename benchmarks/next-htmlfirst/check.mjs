// usage: node measure.mjs [--rounds 5] [--duration 10] [--warmup 10] [--samples 5]
// All variants run side by side; per round the variant order is rotated and only same-round ratios vs stock are compared.
// Needs playwright (from wakujs repo) and autocannon (npm i --prefix .tools autocannon).
import { spawn, execFile } from 'node:child_process';
import { gzipSync, brotliCompressSync, constants as Z } from 'node:zlib';
import { createRequire } from 'node:module';
import { request } from 'node:http';
import { promisify } from 'node:util';
import { loadavg } from 'node:os';
import { mkdirSync, writeFileSync } from 'node:fs';
const run = promisify(execFile);
const require = createRequire('/Users/maxcohen/code/react-ecosystem/wakujs/package.json');
const { chromium } = require('@playwright/test');
const H = '/Users/maxcohen/code/react-ecosystem/next-htmlfirst-bench';
const B = `${H}/.build`;
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? Number(process.argv[i + 1]) : d; };
const ROUNDS = arg('rounds', 5), DURATION = arg('duration', 10), WARMUP = arg('warmup', 10), SAMPLES = arg('samples', 5), SEQ = 30;
const variants = (process.env.VARIANTS || 'off-stock,on-stock,on-A,on-B').split(','); // first is the baseline
const STOCK = variants[0];
const pages = ['table', 'client-rows'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const stats = (a) => ({ median: median(a), min: Math.min(...a), max: Math.max(...a), n: a.length, samples: a });

const ports = {};
const servers = [];
variants.forEach((v, i) => {
  ports[v] = 8101 + i;
  servers.push(spawn(`${B}/${v}/node_modules/.bin/next`, ['start', '--port', String(ports[v])], { cwd: `${B}/${v}`, stdio: 'ignore', detached: true, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } }));
});
const cleanup = () => servers.forEach((s) => { try { process.kill(-s.pid); } catch {} });
process.on('exit', cleanup);
await sleep(5000);

// one request: returns status, body, ttfb and total (ms)
const timed = (url) => new Promise((resolve, reject) => {
  const t0 = performance.now();
  let ttfb;
  const req = request(url, (res) => {
    const chunks = [];
    res.on('data', (c) => { ttfb ??= performance.now() - t0; chunks.push(c); });
    res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks), ttfb: ttfb ?? performance.now() - t0, total: performance.now() - t0 }));
  });
  req.on('error', reject);
  req.end();
});
const urlOf = (v, pg) => `http://localhost:${ports[v]}/${pg}`;

await sleep(3000);
// ---- browser: DOM vs stock after hydration, interaction, client navigation, modal recovery ----
const browserResults = [];
const browser = await chromium.launch();
const bodyHtml = async (page) => (await page.evaluate(() => { const c = document.body.cloneNode(true); c.querySelectorAll('script').forEach((s) => s.remove()); return c.innerHTML; })).replace(/(19\.3\.0|0\.0\.0)-(experimental|canary)-[0-9a-f]{8}-\d{8}/g, 'VER');
const stockDom = {};
const navTo = { table: 'client rows', 'client-rows': 'table' };
const pathOf = { 'client rows': 'client-rows', table: 'table' };
for (const v of variants) for (const pg of [...pages, 'modal']) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const logs = [];
  const rsc = [];
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => logs.push('pageerror: ' + String(e).slice(0, 200)));
  page.on('request', (r) => { if (r.headers()['rsc'] === '1') rsc.push(new URL(r.url()).pathname); });
  await page.goto(urlOf(v, pg), { waitUntil: 'networkidle' });
  await sleep(500);
  const res = { v, pg };
  const dom = await bodyHtml(page);
  if (v === STOCK) stockDom[pg] = dom; else res.domMatchesStock = dom === stockDom[pg];
  if (pg === 'modal') {
    try {
      await page.locator('#open').click();
      await page.locator('#terms li').nth(19).waitFor({ timeout: 15000 });
      res.modal = { clauses: await page.locator('#terms li').count(), rscRequests: [...rsc] };
    } catch (e) { res.modal = 'ERR ' + e.message.slice(0, 120); }
  } else {
    res.rows = await page.locator('tbody tr').count();
    try {
      const c = page.locator('button.counter');
      await c.nth(0).click(); await c.nth(5).click(); await c.nth(5).click();
      res.interactive = [await c.nth(0).textContent(), await c.nth(5).textContent(), await c.count()];
    } catch (e) { res.interactive = 'ERR ' + e.message.slice(0, 100); }
    try {
      await page.getByRole('link', { name: navTo[pg], exact: true }).click();
      await page.waitForURL((u) => u.pathname === '/' + pathOf[navTo[pg]], { timeout: 30000 });
      await page.locator('tbody tr').nth(999).waitFor({ timeout: 15000 });
      const c2 = page.locator('button.counter');
      await c2.nth(0).click();
      const forward = { rows: await page.locator('tbody tr').count(), counter: await c2.nth(0).textContent() };
      await page.goBack();
      await page.waitForURL((u) => u.pathname === '/' + pg, { timeout: 15000 });
      await page.locator('tbody tr').nth(999).waitFor({ timeout: 15000 });
      await page.locator('button.counter').nth(1).click();
      res.nav = { forward, backRows: await page.locator('tbody tr').count(), backCounter: await page.locator('button.counter').nth(1).textContent(), rscRequests: [...rsc] };
    } catch (e) { res.nav = 'ERR ' + e.message.slice(0, 120); }
  }
  res.logs = logs.slice(0, 5); res.nlogs = logs.length;
  browserResults.push(res);
  await ctx.close();
}
await browser.close();
cleanup();

mkdirSync(`${H}/results`, { recursive: true });
const out = { variants, browser: browserResults };
writeFileSync(`${H}/results/${process.env.OUT || 'results'}.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(browserResults, null, 1));
