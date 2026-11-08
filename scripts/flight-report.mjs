// Usage: node scripts/flight-report.mjs <results dir> <out dir>
// Builds report.md, index.html and results.json from results/<variant>/*. Exits 1 if any e2e check is red.
import { mkdirSync, readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [dir, out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const rd = (v, f) => (existsSync(join(dir, v, f)) ? readFileSync(join(dir, v, f), 'utf8') : '');
const okOf = r => r.hydratedMs >= 0 && r.consoleProblems.length === 0 && r.adopted.rowsSameNode === r.adopted.rowsTotal && r.adopted.styleSame && r.adopted.ldSame && r.adopted.recoverable.length === 0 && r.rowCounterText.endsWith(': 100') && r.afterNav.tr === 20;

const variants = readdirSync(dir).filter(v => existsSync(join(dir, v, 'meta.json')));
const all = variants.map(v => ({
  meta: JSON.parse(rd(v, 'meta.json')),
  e2e: rd(v, 'e2e.jsonl').split('\n').filter(Boolean).map(l => JSON.parse(l)),
  inproc: rd(v, 'inproc.txt'),
}));
let failed = false;
const n = x => (x == null ? '' : Number(x).toLocaleString());
const rows = [];
for (const { meta, e2e } of all) {
  if (!e2e.length) { failed = true; rows.push({ variant: meta.variant, kind: '(no e2e output)', ok: false }); }
  for (const r of e2e) {
    const ok = okOf(r); if (!ok) failed = true;
    rows.push({ variant: meta.variant, kind: r.kind, html: r.htmlBytes, gz: r.htmlGzip, flight: r.flightInlineBytes, hydratedAt: r.hydratedAt, rowsSame: `${r.adopted.rowsSameNode}/${r.adopted.rowsTotal}`, style: r.adopted.styleSame, ld: r.adopted.ldSame, recov: r.adopted.recoverable.length, warn: r.consoleProblems.length, nav: r.afterNav.tr === 20, ok });
  }
}
const head = ['variant', 'page kind', 'HTML bytes', 'HTML gzip', 'inlined Flight', 'hydrated (ms, median)', 'rows adopted', 'style/ld adopted', 'recoverable errs', 'console problems', 'nav ok', 'hydration check'];
const cells = r => [r.variant, r.kind, n(r.html), n(r.gz), n(r.flight), n(r.hydratedAt), r.rowsSame ?? '', r.rowsSame ? (r.style && r.ld ? 'yes' : 'NO') : '', r.recov ?? '', r.warn ?? '', r.rowsSame ? (r.nav ? 'yes' : 'NO') : '', r.ok ? 'PASS' : 'FAIL'];
const md = `# Flight SSR: flags off vs on\n\n${all.map(a => `- **${a.meta.variant}**: ${a.meta.repo}@${a.meta.ref} (${a.meta.sha.slice(0, 8)}), flags: ${a.meta.flags.join(', ') || 'none'}`).join('\n')}\n\n| ${head.join(' | ')} |\n|${head.map(() => '---').join('|')}|\n${rows.map(r => `| ${cells(r).join(' | ')} |`).join('\n')}\n\n${all.map(a => `## In-process render (${a.meta.variant})\n\n\`\`\`\n${a.inproc.trim()}\n\`\`\``).join('\n\n')}\n`;
writeFileSync(join(out, 'report.md'), md);
writeFileSync(join(out, 'results.json'), JSON.stringify({ generated: new Date().toISOString(), all }, null, 2));
writeFileSync(join(out, 'index.html'), `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Flight SSR results</title>
<style>body{font:15px/1.5 system-ui;max-width:1100px;margin:24px auto;padding:0 16px}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #8884;padding:4px 8px;text-align:right}td:nth-child(-n+2),th:nth-child(-n+2){text-align:left}.PASS{color:#1a9f55;font-weight:700}.FAIL{color:#d33;font-weight:700}pre{background:#8881;padding:10px;overflow:auto;font-size:12px}</style>
<h1>Flight SSR: flags off vs on</h1><p>Generated ${new Date().toISOString().slice(0, 16)}Z in CI, real Chromium. Raw: <a href="results.json">results.json</a>, <a href="report.md">report.md</a></p>
<ul>${all.map(a => `<li><b>${esc(a.meta.variant)}</b>: ${esc(a.meta.repo)}@${esc(a.meta.ref)} (<code>${esc(a.meta.sha.slice(0, 8))}</code>) &middot; flags: ${esc(a.meta.flags.join(', ') || 'none')}</li>`).join('')}</ul>
<table><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${cells(r).map((c, i, a) => `<td${i === a.length - 1 ? ` class="${c}"` : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>
${all.map(a => `<h2>In-process render (${esc(a.meta.variant)})</h2><pre>${esc(a.inproc.trim())}</pre>`).join('')}`);
console.log(md);
process.exit(failed ? 1 : 0);
