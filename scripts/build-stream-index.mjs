// Builds .build/streaming-index (static landing page listing every deployed streaming variant).
import {readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync} from 'node:fs';

const LABEL = {
  baseline: ['baseline ($RC)', 'Upstream facebook/react main. Classic Fizz completion scripts.'],
  dpu: ['template-for (PR #25)', 'MaxwellCohen/react fizz/template-for-streaming with enableFizzDeclarativePatching. No server hold; $RP fallback.'],
};
const esc = x => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const host = v => `https://react-eco-stream-${v}.to-email-max.workers.dev`;
const order = ['baseline', 'dpu'];
const vs = readdirSync('.build')
  .filter(d => d.startsWith('streaming-') && d !== 'streaming-index' && existsSync(`.build/${d}/src/version.json`))
  .map(d => d.replace(/^streaming-/, ''));
vs.sort((a, b) => (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b)));

const rows = vs.map(v => {
  const j = JSON.parse(readFileSync(`.build/streaming-${v}/src/version.json`, 'utf8'));
  const [name, desc] = LABEL[v] ?? [v, ''];
  const link = (p, t) => `<a href="${host(v)}${p}">${t}</a>`;
  return `<tr><td><b>${esc(name)}</b><br><code>${v}</code></td><td>${esc(desc)}<br><small>${esc(j.repo)}@<code>${esc(j.ref)}</code> · <code>${esc(String(j.sha).slice(0, 7))}</code>${j.flags?.length ? ` · flags ${j.flags.map(f => `<code>${esc(f)}</code>`).join(' ')}` : ''}</small></td>
<td>${link('/dpu', 'diagnostics')} · ${link('/dpu?csp=strict', 'strict CSP')} · ${link('/', 'all scenarios')} · ${link('/s/popcorning', 'popcorning')} · ${link('/?mode=script', 'force $RC')} · ${link('/index.json', 'json')}</td></tr>`;
}).join('\n');

mkdirSync('.build/streaming-index/public', {recursive: true});
mkdirSync('.build/streaming-index/public/data', {recursive: true});

const caseNote = existsSync('dpu/index.html')
  ? `<p>Adoption case (numbers + proposal): see the <a href="https://maxwellcohen.github.io/react-eco-ci/dpu/">dpu case page</a> (PR against gh-pages).</p>`
  : `<p>Adoption case: <a href="https://github.com/MaxwellCohen/react-eco-ci/pull/1">react-eco-ci#1</a> · React PR <a href="https://github.com/MaxwellCohen/react/pull/25">#25</a>.</p>`;

writeFileSync('.build/streaming-index/public/index.html', `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>react-eco-ci — Fizz streaming / DPU variants</title>
<style>body{font:15px/1.45 system-ui,sans-serif;max-width:1000px;margin:24px auto;padding:0 16px;color:#18181b}table{border-collapse:collapse;width:100%}td{border-top:1px solid #e4e4e7;padding:10px 8px;vertical-align:top}small{color:#52525b}code{background:#f4f4f5;padding:0 4px;border-radius:4px}h2{margin-top:28px}</style>
<h1>React Fizz streaming / DPU test bed</h1>
<p>Same demo app (${META_COUNT()} scenarios) served by each React build. Source: <a href="https://github.com/MaxwellCohen/react-eco-ci">MaxwellCohen/react-eco-ci</a>.
Start with <b>diagnostics</b> for each variant. Mirror of the <a href="https://preact-eco-index.to-email-max.workers.dev/">Preact eco index</a>.</p>
${caseNote}
<h2>Variants</h2><table>${rows || '<tr><td colspan=3><i>No streaming-* builds found under .build/. Run <code>node scripts/build-stream.mjs &lt;variant&gt;</code> first.</i></td></tr>'}</table>
<p><small>Made with LLMs, directed by the repo owner. Expectations are proposals to review, not ground truth.</small></p>`);

writeFileSync('.build/streaming-index/wrangler.jsonc', JSON.stringify({
  name: 'react-eco-stream-index',
  compatibility_date: '2026-01-01',
  assets: {directory: 'public'},
}, null, 2));
console.log(vs.length ? vs.join(', ') : '(no variants)');

function META_COUNT() {
  try {
    const t = readFileSync('demos/streaming/src/scenarios.js', 'utf8');
    const m = t.match(/id: '/g);
    return m ? m.length : '30';
  } catch {
    return '30';
  }
}
