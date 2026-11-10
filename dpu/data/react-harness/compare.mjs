// Usage: node compare.mjs   (env BASE=http://localhost:3010 OUT=<dir> SETTLE=ms)
// Port of preact-eco-ci/scripts/compare.mjs: 26 checks (+2 React-only extras, + isolated foreignObject) per browser x config x hydrate.
import { chromium, firefox, webkit } from '/Users/maxcohen/code/preactjs/preact-eco-ci/node_modules/playwright/index.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const BASE = process.env.BASE || 'http://localhost:3010', OUT = process.env.OUT;
const SETTLE = Number(process.env.SETTLE || 7000);
const NOPATCH = ['--disable-blink-features=DocumentPatching'];
const CONFIGS = {
	baseline: 'mode=script',
	decl: 'mode=decl', // native in chromium; $RP fallback (no polyfill) elsewhere / with native disabled
	'decl+polyfill': 'mode=decl&polyfill=1',
};
const PLAN = {
	chromium: [['baseline', 'baseline'], ['decl-native', 'decl'], ['decl-$RP (native off)', 'decl', NOPATCH], ['decl+polyfill (native off)', 'decl+polyfill', NOPATCH]],
	firefox: [['baseline', 'baseline'], ['decl-$RP', 'decl'], ['decl+polyfill', 'decl+polyfill']],
	webkit: [['baseline', 'baseline'], ['decl-$RP', 'decl'], ['decl+polyfill', 'decl+polyfill']],
};
const CHECKS = `(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const sc = id => '[data-scenario="' + id + '"] ';
const ns = el => el && el.namespaceURI.split('/').pop();
const noFallback = id => $$(sc(id) + '[data-testid=fallback]').length === 0;
return {
 'html-baseline': () => $('[data-testid=html-done]') && noFallback('html-baseline'),
 'popcorning': () => $$('[data-testid=popcorn] [data-cell]').length === 16,
 'nested': () => $('[data-testid=panel-Details]') && $('[data-testid=panel-Account]'),
 'out-of-order': () => $('[data-testid="panel-fast-second"]') && $('[data-testid="panel-slow-first"]'),
 'table-rows': () => $$(sc('table-rows') + 'tbody > tr').length === 3,
 'select-options': () => $$(sc('select-options') + 'option').length === 3 && $('[data-testid=sel]').value === '2',
 'list-items': () => $$(sc('list-items') + 'ul > li').length === 3,
 'svg-namespace': () => ns($(sc('svg-namespace') + 'circle')) === 'svg',
 'mathml-namespace': () => ns($(sc('mathml-namespace') + 'mi')) === 'MathML',
 'style-hoist': () => $('[data-testid=styled]') && getComputedStyle($('[data-testid=styled]')).color === 'rgb(255, 99, 71)',
 'inline-script': () => $('[data-testid=script-done]') && noFallback('inline-script'),
 'empty': () => noFallback('empty'),
 'multi-root': () => $('[data-testid=multi-host]').textContent === '123',
 'text-only': () => $('[data-testid=text-host]').textContent === 'resolved text',
 'nested-template': () => $('[data-testid=inner-tpl]') && $('[data-testid=ntpl-done]') && $('[data-testid=inner-tpl]').content.childNodes.length === 1,
 'link-stylesheet': () => $('[data-testid=lnk]') && getComputedStyle($('[data-testid=lnk]')).color === 'rgb(0, 128, 0)',
 'iframe-srcdoc': () => !!$('[data-testid=ifr]'),
 'big-boundary': () => $$('[data-testid=big] p').length === 600,
 'patch-interactive': () => !!$('[data-testid=patched-btn]') && noFallback('patch-interactive'),
 'client-wins': () => $$('[data-testid=client-wins-content]').length === 1,
 'adjacent-boundaries': () => $('[data-testid=adj-a]') && $('[data-testid=adj-b]'),
 'nested-inner-first': () => $$('[data-testid=nest-outer]').length === 1 && $$('[data-testid=nest-inner]').length === 1,
 'many-boundaries': () => new Set($$('[data-testid=many-grid] [data-cell]').map(e => e.dataset.cell)).size === 60,
 'zero-delay': () => !!$('[data-testid=zero-done]'),
 'deep-nesting': () => $$('[data-level]').length === 5,
 'reverse-order': () => $$('[data-testid=reverse] [data-cell]').map(e => e.dataset.cell).join('') === '01234',
 'x-css-precedence': () => $('[data-testid=css-styled]') && noFallback('css-precedence') && getComputedStyle($('[data-testid=css-styled]')).backgroundColor === 'rgb(0, 128, 0)',
 'x-style-precedence': () => $('[data-testid=sty-styled]') && noFallback('style-precedence') && getComputedStyle($('[data-testid=sty-styled]')).backgroundColor === 'rgb(0, 0, 255)',
};
})()`;
const hung = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r('HUNG'), ms))]);
async function runOne(bt, args, query, hydrate) {
	const b = await bt.launch({ args });
	const ctx = await b.newContext(); const page = await ctx.newPage();
	const errors = [];
	page.on('pageerror', e => errors.push(e.message.slice(0, 160)));
	await page.goto(`${BASE}/dpu?${query}&hydrate=${hydrate}`, { waitUntil: 'commit' });
	await page.waitForTimeout(SETTLE);
	const res = await hung(page.evaluate(`(() => { const c = ${CHECKS}; const r = {};
		for (const [k, f] of Object.entries(c)) { try { r[k] = !!f(); } catch (e) { r[k] = false; } }
		return { checks: r, rp: window.__rp, htmlFor: 'htmlFor' in HTMLTemplateElement.prototype,
			leftoverTemplates: document.querySelectorAll('template[for]').length,
			leftoverFallbacks: document.querySelectorAll('[data-testid=fallback]').length,
			recoverable: window.__recoverable || null, hydrated: window.__hydrated ?? null }; })()`), 8000);
	const out = res === 'HUNG' ? { hung: true } : res;
	out.errors = errors;
	const fo = await ctx.newPage();
	await fo.goto(`${BASE}/s/foreign-object?${query}`, { waitUntil: 'commit' });
	await fo.waitForTimeout(2500);
	const f = await hung(fo.evaluate(() => ({ ns: document.querySelector('[data-testid=fo]')?.namespaceURI.split('/').pop() ?? null, fb: document.querySelectorAll('[data-testid=fallback]').length })), 4000);
	out.foreignObject = f === 'HUNG' ? 'HUNG' : f.ns === 'xhtml' ? 'ok' : `wrong(${f.ns},fb=${f.fb})`;
	out.version = b.version();
	await b.close().catch(() => {});
	return out;
}
const out = {};
await Promise.all(Object.entries({ chromium, firefox, webkit }).map(async ([bn, bt]) => {
	out[bn] = {};
	for (const hydrate of ['off', 'late']) for (const [label, cfg, args] of PLAN[bn]) {
		out[bn][`${label} | hydrate=${hydrate}`] = await runOne(bt, args || [], CONFIGS[cfg], hydrate);
		console.error('done', bn, label, hydrate);
	}
}));
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/compare.json`, JSON.stringify(out, null, 2));
