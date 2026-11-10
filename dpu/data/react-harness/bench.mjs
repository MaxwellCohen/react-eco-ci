// Usage: node bench.mjs <chromium|firefox|webkit> [runs=5]   (env BASE, OUT)
// Port of preact-eco-ci/scripts/bench.mjs against the local React fixture server.
import { chromium, firefox, webkit } from '/Users/maxcohen/code/preactjs/preact-eco-ci/node_modules/playwright/index.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const [bn, runsArg] = process.argv.slice(2);
const bt = { chromium, firefox, webkit }[bn];
const RUNS = Number(runsArg || 5);
const BASE = process.env.BASE || 'http://localhost:3010', OUT = process.env.OUT;
const NOPATCH = ['--disable-blink-features=DocumentPatching'];
// variant -> [query, launch-args key]
const V = {
	baseline: ['mode=script', 'std'],
	...(bn === 'chromium' ? { 'decl-native': ['mode=decl', 'std'], 'decl-native-b0': ['mode=decl&batchMs=0', 'std'] } : {}),
	'decl-$RP': ['mode=decl', bn === 'chromium' ? 'off' : 'std'],
	'decl-$RP-b0': ['mode=decl&batchMs=0', bn === 'chromium' ? 'off' : 'std'],
	'decl+polyfill': ['mode=decl&polyfill=1', bn === 'chromium' ? 'off' : 'std'],
	'decl+polyfill-b0': ['mode=decl&polyfill=1&batchMs=0', bn === 'chromium' ? 'off' : 'std'],
};
const variants = Object.keys(V);
const host = () => BASE;

const POPCORN = [420, 1680, 780, 2100, 1100, 540, 1900, 1320, 2260, 860, 1480, 640, 1980, 980, 1200, 1540];
const MANY = Array.from({ length: 60 }, (_, i) => 200 + ((i * 37) % 23) * 60);
const GRID = Array.from({ length: 100 }, (_, i) => (i % 7) * 100);

// Injected before any page script. Records when each [data-cell] becomes laid out (visible) + paint/stall data.
const INIT = `(() => {
const m = window.__m = { vis: {}, fcp: null, lcp: null, longTask: 0, maxGap: 0, btnVis: null, btnLive: null };
const scan = () => {
  const now = performance.now();
  for (const el of document.querySelectorAll('[data-cell]')) {
    const host = el.closest('[data-testid]'); const k = (host ? host.dataset.testid : '') + ':' + el.dataset.cell;
    if (!(k in m.vis) && el.getClientRects().length) m.vis[k] = now;
  }
  const b = document.querySelector('[data-testid=patched-btn]');
  if (b && m.btnVis === null && b.getClientRects().length) m.btnVis = now;
};
new MutationObserver(scan).observe(document, { childList: true, subtree: true });
setInterval(scan, 16);
try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') m.fcp = e.startTime; }).observe({ type: 'paint', buffered: true }); } catch {}
try { new PerformanceObserver(l => { for (const e of l.getEntries()) m.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}
try { new PerformanceObserver(l => { for (const e of l.getEntries()) m.longTask += e.duration; }).observe({ type: 'longtask', buffered: true }); } catch {}
let last = performance.now(); setInterval(() => { const n = performance.now(); m.maxGap = Math.max(m.maxGap, n - last - 50); last = n; }, 50);
// patch -> interactive: click the patched counter every 10ms until a click registers
setInterval(() => {
  const b = document.querySelector('[data-testid=patched-btn]');
  if (b && m.btnLive === null && b.getClientRects().length) {
    b.click();
    const c = document.querySelector('[data-testid=patched-count]');
    if (c && Number(c.textContent) > 0) m.btnLive = performance.now();
  }
}, 10);
})();`;

const stats = a => {
	const s = [...a].sort((x, y) => x - y);
	return s.length ? { median: s[Math.floor(s.length / 2)], p95: s[Math.min(s.length - 1, Math.ceil(s.length * 0.95) - 1)], max: s[s.length - 1], min: s[0] } : null;
};

async function load(browser, url, settleMs) {
	const ctx = await browser.newContext();
	const page = await ctx.newPage();
	await page.addInitScript(INIT);
	const errors = [];
	page.on('pageerror', e => errors.push(e.message.slice(0, 120)));
	await page.goto(url, { waitUntil: 'commit' });
	await page.waitForTimeout(settleMs);
	const r = await Promise.race([
		page.evaluate(() => {
			const nav = performance.getEntriesByType('navigation')[0];
			return { m: window.__m, ttfb: nav.responseStart, dcl: nav.domContentLoadedEventEnd, load: nav.loadEventEnd,
				hydrated: window.__hydrated ?? null, leftoverTpl: document.querySelectorAll('template[for]').length,
				leftoverFb: document.querySelectorAll('[data-testid=fallback]').length };
		}),
		new Promise(r => setTimeout(() => r(null), 8000)),
	]);
	await ctx.close().catch(() => {});
	return r && { ...r, errors };
}

function patchLag(r, prefix, delays) {
	const lags = [];
	for (let i = 0; i < delays.length; i++) {
		const v = r.m.vis[`${prefix}:${i}`];
		if (v != null) lags.push(v - (r.ttfb + delays[i]));
	}
	return { lags, missing: delays.length - lags.length, lastVisible: Math.max(...Object.entries(r.m.vis).filter(([k]) => k.startsWith(prefix + ':')).map(([, v]) => v), 0) };
}

const out = { browser: bn, runs: RUNS, variants: {} };
const browsers = { std: await bt.launch() };
if (bn === 'chromium') browsers.off = await bt.launch({ args: NOPATCH });
out.version = browsers.std.version();
for (const v of variants) out.variants[v] = { popcorn: [], many: [], grid: [], interactive: { late: [], early: [] } };
const shuffle = a => a.map(x => [Math.random(), x]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
for (let i = 0; i < RUNS; i++) {
	for (const v of shuffle(variants)) {
		const o = out.variants[v]; const [q, bk] = V[v]; const browser = browsers[bk];
		for (const [key, path, prefix, delays] of [['popcorn', '/s/popcorning', 'popcorn', POPCORN], ['many', '/s/many-boundaries', 'many-grid', MANY], ['grid', '/s/grid-100', 'grid-100', GRID]]) {
			const r = await load(browser, `${BASE}${path}?${q}&hydrate=late`, Math.max(...delays) + 1800);
			if (!r) { o[key].push({ hung: true }); continue; }
			const p = patchLag(r, prefix, delays);
			o[key].push({ ttfb: r.ttfb, fcp: r.m.fcp, lcp: r.m.lcp, longTask: r.m.longTask, maxGap: r.m.maxGap, hydrated: r.hydrated,
				lagMedian: stats(p.lags)?.median, lagP95: stats(p.lags)?.p95, lagMax: stats(p.lags)?.max, missing: p.missing, lastVisible: p.lastVisible,
				leftoverTpl: r.leftoverTpl, leftoverFb: r.leftoverFb, errors: r.errors.length });
		}
		for (const mode of ['late', 'early']) {
			const r = await load(browser, `${BASE}/s/patch-interactive?${q}&hydrate=${mode}`, 3500);
			o.interactive[mode].push(r && r.m.btnVis != null ? { visible: r.m.btnVis, live: r.m.btnLive, gap: r.m.btnLive == null ? null : r.m.btnLive - r.m.btnVis, hydrated: r.hydrated } : { hung: !r });
		}
	}
	console.error(`${bn} iteration ${i + 1}/${RUNS}`);
}
for (const b of Object.values(browsers)) await b.close();
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/bench-${bn}.json`, JSON.stringify(out, null, 2));
console.error(`wrote ${OUT}/bench-${bn}.json`);
