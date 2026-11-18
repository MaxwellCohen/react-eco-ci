// Prints the size of the demo pages from a running `npm start` (default http://localhost:3000),
// next to what the same pages measure on stock Next.js 16.4.6 with the same React build and the flag off.
import { gzipSync } from 'node:zlib';

const base = process.argv[2] || 'http://localhost:3000';
const stock = {
  table: { raw: 1273678, gzip: 108921, flight: 765386 },
  'static-table': { raw: 1273663, gzip: 108904, flight: 765415 },
  'client-rows': { raw: 456856, gzip: 34753, flight: 257010 },
};
const n = (x) => x.toLocaleString('en-US');
const pct = (a, b) => {
  const d = ((a - b) / b) * 100;
  return `${d > 0 ? '+' : '-'}${Math.abs(d).toFixed(1)}%`;
};

for (const page of Object.keys(stock)) {
  const html = await (await fetch(`${base}/${page}`)).text();
  const raw = Buffer.byteLength(html);
  const gzip = gzipSync(html, { level: 6 }).length;
  const flight = [...html.matchAll(/<script[^>]*>self\.__next_f\.push\([\s\S]*?<\/script>/g)].reduce((s, m) => s + Buffer.byteLength(m[0]), 0);
  const s = stock[page];
  console.log(`/${page}`);
  console.log(`  raw HTML        ${n(raw).padStart(10)} B   stock ${n(s.raw).padStart(10)} B   ${pct(raw, s.raw)}`);
  console.log(`  gzip            ${n(gzip).padStart(10)} B   stock ${n(s.gzip).padStart(10)} B   ${pct(gzip, s.gzip)}`);
  console.log(`  inlined Flight  ${n(flight).padStart(10)} B   stock ${n(s.flight).padStart(10)} B   ${pct(flight, s.flight)}`);
  console.log(`  stubs           ${html.match(/\$J/g)?.length ?? 0}`);
}
