// What is in a page's HTML? Fetches the document uncompressed and splits its bytes into: inlined Flight/RSC payload,
// inline <style>, JSON-LD, other scripts (bootstrap, $RC/$RS, hydrate init), table-row markup, and everything else.
import { gzipSync } from 'node:zlib';

export const PARTS = [
  ['flight', 'inlined Flight/RSC payload', '#7c3aed'],
  ['css', 'inline CSS', '#0ea5e9'],
  ['ld', 'JSON-LD', '#f59e0b'],
  ['scripts', 'other scripts', '#ef4444'],
  ['rows', 'table-row HTML', '#16a34a'],
  ['other', 'other HTML', '#9ca3af'],
];
const sum = a => a.reduce((n, s) => n + Buffer.byteLength(s), 0);
const gz = s => gzipSync(Buffer.from(s)).length;

export async function breakdown(url) {
  const res = await fetch(url, { headers: { 'accept-encoding': 'identity' } });
  const html = await res.text();
  const scripts = html.match(/<script\b[^>]*>[\s\S]*?<\/script>/g) || [];
  const flightScripts = scripts.filter(s => /__FLIGHT_DATA|__next_f/.test(s));
  const ldScripts = scripts.filter(s => /type="application\/ld\+json"/.test(s));
  const otherScripts = scripts.filter(s => !flightScripts.includes(s) && !ldScripts.includes(s));
  const styles = html.match(/<style\b[\s\S]*?<\/style>/g) || [];
  let rest = html;
  for (const s of [...scripts, ...styles]) rest = rest.replace(s, '');
  const rows = rest.match(/<tr\b[\s\S]*?<\/tr>/g) || [];
  const b = {
    flight: sum(flightScripts), css: sum(styles), ld: sum(ldScripts), scripts: sum(otherScripts), rows: sum(rows),
  };
  const total = Buffer.byteLength(html);
  b.other = total - b.flight - b.css - b.ld - b.scripts - b.rows;
  return { total, gzip: gz(html), flightGzip: gz(flightScripts.join('')), rowCount: rows.length, status: res.status, ...b };
}

const kb = n => `${(n / 1024).toFixed(0)} KB`;
export function summaryMd(entries) {
  const head = ['page', 'HTML total', 'gzip', ...PARTS.map(p => p[1]), 'Flight gzip'];
  const line = ([label, url, b]) => [`[${label}](${url})`, kb(b.total), kb(b.gzip), ...PARTS.map(([k]) => `${kb(b[k])} (${Math.round((b[k] / b.total) * 100)}%)`), kb(b.flightGzip)];
  return `| ${head.join(' | ')} |\n|${head.map(() => '---').join('|')}|\n${entries.map(e => `| ${line(e).join(' | ')} |`).join('\n')}\n`;
}
export function summaryHtml(entries, esc) {
  const max = Math.max(...entries.map(e => e[2].total));
  const legend = PARTS.map(([, name, c]) => `<span class="lg"><i style="background:${c}"></i>${esc(name)}</span>`).join('');
  const rows = entries.map(([label, url, b]) => {
    const bar = PARTS.map(([k, name, c]) => `<i title="${esc(name)}: ${kb(b[k])}" style="width:${(b[k] / max) * 100}%;background:${c}"></i>`).join('');
    const cells = PARTS.map(([k]) => `<td>${kb(b[k])}<small> ${Math.round((b[k] / b.total) * 100)}%</small></td>`).join('');
    return `<tr><td><a href="${esc(url)}">${esc(label)}</a></td><td>${kb(b.total)}</td><td>${kb(b.gzip)}</td>${cells}<td>${kb(b.flightGzip)}</td></tr><tr class="barrow"><td colspan="${PARTS.length + 4}"><div class="bar">${bar}</div></td></tr>`;
  }).join('');
  return `<h2>What is in the HTML</h2><p class="lgs">${legend}</p><table class="sum"><tr><th>page</th><th>HTML total</th><th>gzip</th>${PARTS.map(p => `<th>${esc(p[1])}</th>`).join('')}<th>Flight gzip</th></tr>${rows}</table>`;
}
