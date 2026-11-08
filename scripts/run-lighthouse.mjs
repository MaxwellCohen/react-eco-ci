// Usage: node scripts/run-lighthouse.mjs <out dir> <runs> <label=url> [<label=url> ...]
// Runs Lighthouse (mobile + desktop) `runs` times per URL, POSTs each device's median-performance run to
// the web-perf-report site (https://web-perf-report.vercel.app), and writes results.json, report.md, index.html.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [out, runsArg, ...targets] = process.argv.slice(2);
const runs = +runsArg;
const API = process.env.WEB_PERF_REPORT_API || 'https://web-perf-report.vercel.app';
mkdirSync(join(out, 'raw'), { recursive: true });
const med = a => [...a].sort((x, y) => x - y)[a.length >> 1];
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

let results = [];
if (process.env.RENDER_ONLY) results = JSON.parse(readFileSync(join(out, 'results.json'), 'utf8')).results;
for (const t of process.env.RENDER_ONLY ? [] : targets) {
  const i = t.indexOf('=');
  const label = t.slice(0, i), url = t.slice(i + 1);
  for (const device of ['mobile', 'desktop']) {
    const samples = [];
    for (let r = 1; r <= runs; r++) {
      const file = join(out, 'raw', `${label}-${device}-${r}.json`);
      const args = ['--yes', 'lighthouse', url, '--output=json', `--output-path=${file}`, '--only-categories=performance,accessibility,best-practices,seo',
        '--disable-full-page-screenshot', '--skip-audits=screenshot-thumbnails,final-screenshot', '--chrome-flags=--headless=new --no-sandbox', '--quiet'];
      if (device === 'desktop') args.push('--preset=desktop');
      execFileSync('npx', args, { stdio: 'inherit' });
      const j = JSON.parse(readFileSync(file, 'utf8')), a = j.audits;
      samples.push({
        file, score: Math.round(j.categories.performance.score * 100),
        fcp: a['first-contentful-paint'].numericValue, lcp: a['largest-contentful-paint'].numericValue, tbt: a['total-blocking-time'].numericValue,
        cls: a['cumulative-layout-shift'].numericValue, si: a['speed-index'].numericValue, tti: a.interactive?.numericValue,
        bytes: a['total-byte-weight']?.numericValue, doc: a['network-requests']?.details?.items?.find(x => x.resourceType === 'Document')?.transferSize,
        js: a['network-requests']?.details?.items?.filter(x => x.resourceType === 'Script').reduce((n, x) => n + x.transferSize, 0),
      });
    }
    const sorted = [...samples].sort((x, y) => x.score - y.score), mid = sorted[samples.length >> 1];
    let reportUrl = '';
    try {
      const md = execFileSync('curl', ['-s', '-X', 'POST', `${API}/api/agent/report?format=md`, '-H', 'content-type: application/json', '--data-binary', `@${mid.file}`], { maxBuffer: 1 << 26 }).toString();
      writeFileSync(join(out, `${label}-${device}.md`), md);
      reportUrl = `${label}-${device}.md`;
    } catch (e) { console.error('report POST failed', e.message); }
    const m = k => med(samples.map(s => s[k]).filter(v => v != null));
    results.push({ label, url, device, runs, scores: samples.map(s => s.score), score: m('score'), fcp: m('fcp'), lcp: m('lcp'), tbt: m('tbt'), cls: m('cls'), si: m('si'), tti: m('tti'), bytes: m('bytes'), doc: m('doc'), js: m('js'), report: reportUrl });
  }
}
if (!process.env.RENDER_ONLY) writeFileSync(join(out, 'results.json'), JSON.stringify({ generated: new Date().toISOString(), runs, results }, null, 2));
const ms = v => (v == null ? '' : `${Math.round(v).toLocaleString()} ms`), kb = v => (v == null ? '' : `${(v / 1024).toFixed(0)} KB`);
const head = ['page', 'device', 'perf score (runs)', 'FCP', 'LCP', 'TBT', 'CLS', 'Speed Index', 'TTI', 'document', 'JS', 'total', 'site report'];
const row = r => [`[${r.label}](${r.url})`, r.device, `${r.score} (${r.scores.join('/')})`, ms(r.fcp), ms(r.lcp), ms(r.tbt), r.cls.toFixed(3), ms(r.si), ms(r.tti), kb(r.doc), kb(r.js), kb(r.bytes), r.report ? `[md](${r.report})` : ''];
const md = `# Lighthouse (median of ${runs})\n\n| ${head.join(' | ')} |\n|${head.map(() => '---').join('|')}|\n${results.map(r => `| ${row(r).join(' | ')} |`).join('\n')}\n`;
writeFileSync(join(out, 'report.md'), md);
writeFileSync(join(out, 'index.html'), `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Lighthouse comparison</title><style>body{font:15px/1.5 system-ui;max-width:1200px;margin:24px auto;padding:0 16px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #8884;padding:4px 8px;text-align:right}td:nth-child(-n+2),th:nth-child(-n+2){text-align:left}</style>
<h1>Lighthouse comparison</h1><p>Median of ${runs} runs, generated ${new Date().toISOString().slice(0, 16)}Z. Each device's median run was analyzed by <a href="${esc(API)}">web-perf-report</a>. Raw: <a href="results.json">results.json</a>.</p>
<table><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${results.map(r => `<tr>${row(r).map((c, i) => `<td>${i === 0 ? `<a href="${esc(r.url)}">${esc(r.label)}</a>` : i === 12 && r.report ? `<a href="${r.report}">report</a>` : esc(c)}</td>`).join('')}</tr>`).join('')}</table>
<ul>${[...new Set(results.map(r => r.label + '=' + r.url))].map(x => `<li>${esc(x)}</li>`).join('')}</ul>`);
console.log(md);
