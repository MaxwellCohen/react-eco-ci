// usage: OFF=fin-cc-off ON=fin-cc-on OUT=final-2026-11-24-cc CHROME_PATH=... node final-cc.mjs
// Bytes (inlined Flight, gzip, raw HTML) for /ppr /ppr-offpath /static, and Chromium checks:
// hydration without console errors, counter, DOM equals off (comments ignored), client navigation + Back, extra RSC requests.
import { spawn } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
const require = createRequire('/Users/maxcohen/code/react-ecosystem/wakujs/package.json');
const { chromium } = require('@playwright/test');
const H = '/Users/maxcohen/code/react-ecosystem/next-htmlfirst-bench';
const B = `${H}/.build`;
const [OFF, ON] = [process.env.OFF || 'fin-cc-off', process.env.ON || 'fin-cc-on'];
const variants = [OFF, ON];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ports = { [OFF]: 8301, [ON]: 8302 };
const servers = variants.map((v) => spawn(`${B}/${v}/node_modules/.bin/next`, ['start', '--port', String(ports[v])], { cwd: `${B}/${v}`, stdio: 'ignore', detached: true, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } }));
const cleanup = () => servers.forEach((s) => { try { process.kill(-s.pid); } catch {} });
process.on('exit', cleanup);
await sleep(6000);
const url = (v, p) => `http://localhost:${ports[v]}${p}`;
const flightBytes = (html) => [...html.matchAll(/<script[^>]*>self\.__next_f\.push\([\s\S]*?<\/script>/g)].reduce((n, m) => n + Buffer.byteLength(m[0]), 0);
const paths = ['/ppr', '/ppr-offpath', '/static'];
const out = { config: { off: OFF, on: ON, node: process.version }, bytes: {}, stored: {}, browser: {} };
for (const v of variants) for (const p of paths) {
  const r = [];
  for (let i = 0; i < 5; i++) { const res = await fetch(url(v, p)); const html = await res.text(); r.push({ status: res.status, raw: Buffer.byteLength(html), gzip: gzipSync(html, { level: 6 }).length, flight: flightBytes(html), J: (html.match(/<!--J/g) || []).length, stubs: (html.match(/\$J\d+/g) || []).length }); }
  out.bytes[`${p}/${v}`] = r[0]; out.bytes[`${p}/${v}`].deterministic = r.every((x) => x.flight === r[0].flight && x.gzip === r[0].gzip);
}
for (const v of variants) for (const p of ['static', 'ppr', 'ppr-offpath']) {
  try { const f = `${B}/${v}/.next/server/app/${p}.rsc`; const s = readFileSync(f, 'utf8'); out.stored[`${p}/${v}`] = { bytes: statSync(f).size, stubs: (s.match(/"\$J\d+:/g) || []).length }; } catch (e) { out.stored[`${p}/${v}`] = 'none'; }
}
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const norm = (s) => s.replace(/19\.3\.0-(experimental|canary)-[0-9a-f]{8}-\d{8}/g, 'VER').replace(/<p id="now">[^<]*<\/p>/g, '<p id="now">T</p>').replace(/<!--[\s\S]*?-->/g, '');
const dom = async (p) => norm(await p.evaluate(() => { const c = document.body.cloneNode(true); c.querySelectorAll('script').forEach((s) => s.remove()); return c.innerHTML; }));
const base = {};
for (const v of variants) {
  const ctx = await browser.newContext(); const p = await ctx.newPage();
  const logs = []; const rsc = [];
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
  p.on('pageerror', (e) => logs.push('pageerror ' + String(e).slice(0, 200)));
  p.on('request', (r) => { if (r.headers()['rsc'] === '1') rsc.push(new URL(r.url()).pathname + (r.headers()['next-router-prefetch'] ? ' (prefetch)' : '')); });
  const r = {};
  try {
    for (const path of paths) {
      await p.goto(url(v, path), { waitUntil: 'networkidle' }); await sleep(600);
      if (path !== '/static') await p.locator('#now:visible').waitFor({ timeout: 10000 });
      const d = await dom(p); if (v === OFF) base[path] = d; else r['domMatchesOff' + path] = d === base[path];
      r['rows' + path] = await p.locator('tbody:visible tr').count();
      if (path === '/ppr-offpath') {
        const c = p.locator('#counter:visible'); await c.click(); await c.click();
        r.counter = await c.textContent();
      }
    }
    // client navigation ppr-offpath -> static -> ppr, then Back twice
    await p.goto(url(v, '/ppr-offpath'), { waitUntil: 'networkidle' }); await sleep(500);
    rsc.length = 0;
    await p.evaluate(() => window.next.router.push('/static')); await p.waitForURL((u) => u.pathname === '/static'); await p.locator('tbody:visible tr').nth(499).waitFor({ timeout: 15000 });
    r.navStaticRows = await p.locator('tbody:visible tr').count();
    await p.evaluate(() => window.next.router.push('/ppr')); await p.waitForURL((u) => u.pathname === '/ppr'); await p.locator('#now:visible').waitFor({ timeout: 15000 });
    r.navPprRows = await p.locator('tbody:visible tr').count();
    await p.goBack(); await p.waitForURL((u) => u.pathname === '/static'); await p.locator('tbody:visible tr').nth(499).waitFor({ timeout: 15000 });
    await p.goBack(); await p.waitForURL((u) => u.pathname === '/ppr-offpath'); await p.locator('#now:visible').waitFor({ timeout: 15000 }); await p.locator('tbody:visible tr').nth(499).waitFor({ timeout: 15000 });
    r.backRows = await p.locator('tbody:visible tr').count();
    await p.locator('#counter:visible').click(); r.counterAfterBack = await p.locator('#counter:visible').textContent();
    r.rscRequests = [...rsc];
  } catch (e) { r.error = e.message.slice(0, 300); }
  r.logs = logs.slice(0, 8); r.nlogs = logs.length;
  out.browser[v] = r; await ctx.close();
}
await browser.close(); cleanup();
writeFileSync(`${H}/results/${process.env.OUT || 'final-2026-11-24-cc'}.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
