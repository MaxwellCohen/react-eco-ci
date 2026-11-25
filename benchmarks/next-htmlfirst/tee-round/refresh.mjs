// refresh-cpu.mjs method, 10 interleaved trials: main-thread ms (script+layout+style) for two router.refresh() calls on /table.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/Users/maxcohen/code/react-ecosystem/wakujs/package.json');
const { chromium } = require('@playwright/test');
const H = '/Users/maxcohen/code/react-ecosystem/next-htmlfirst-bench';
const variants = (process.env.VARIANTS || 't-off,t-reg,t-tee').split(',');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const servers = variants.map((v, i) => spawn(`${H}/.build/${v}/node_modules/.bin/next`, ['start', '--port', String(8301 + i)], { cwd: `${H}/.build/${v}`, stdio: 'ignore', detached: true, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' } }));
process.on('exit', () => servers.forEach((s) => { try { process.kill(-s.pid); } catch {} }));
await sleep(5000);
const b = await chromium.launch();
const acc = {};
for (let t = 0; t < 10; t++) for (const i of (t % 2 ? [2, 1, 0] : [0, 1, 2]).map((k) => (k + t) % 3)) {
  const v = variants[i];
  const p = await b.newPage(); const cdp = await p.context().newCDPSession(p);
  await p.goto(`http://localhost:${8301 + i}/table`, { waitUntil: 'networkidle' }); await sleep(400);
  const res = [];
  for (let k = 0; k < 2; k++) {
    await cdp.send('Performance.enable');
    const m0 = (await cdp.send('Performance.getMetrics')).metrics;
    await p.evaluate(() => window.next.router.refresh()); await sleep(2000);
    const m1 = (await cdp.send('Performance.getMetrics')).metrics;
    const g = (m, n) => m.find((x) => x.name === n).value; const s = (m) => g(m, 'ScriptDuration') + g(m, 'LayoutDuration') + g(m, 'RecalcStyleDuration');
    res.push(Math.round((s(m1) - s(m0)) * 1000));
  }
  (acc[v] ??= []).push(res); await p.close();
}
await b.close();
const med = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const summary = Object.fromEntries(variants.map((v) => [v, [0, 1].map((k) => ({ median: med(acc[v].map((r) => r[k])), min: Math.min(...acc[v].map((r) => r[k])), max: Math.max(...acc[v].map((r) => r[k])) }))]));
writeFileSync(`${H}/results/${process.env.OUT || 'tee-2026-11-19-refresh'}.json`, JSON.stringify({ trials: acc, summary }, null, 1));
console.log(JSON.stringify(summary));
for (const v of variants) console.log(v, JSON.stringify(acc[v]));
process.exit(0);
