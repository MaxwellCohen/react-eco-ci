// Prints the size of /table-host and /table-client from a running `npm start` (default http://localhost:8080),
// next to what the same pages measure on stock React and stock Waku (flag off), taken from the project's bench.
import { gzipSync } from 'node:zlib';

const base = process.argv[2] || 'http://localhost:8080';
const stock = {
  'table-host': { raw: 1525921, gzip: 130459, flight: 823655 },
  'table-client': { raw: 1361462, gzip: 130006, flight: 660223 },
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
  const flight = [...html.matchAll(/<script[^>]*>\(self\.__FLIGHT_DATA[^<]*<\/script>/g)].reduce((s, m) => s + Buffer.byteLength(m[0]), 0);
  const s = stock[page];
  console.log(`/${page}`);
  console.log(`  raw HTML        ${n(raw).padStart(10)} B   stock ${n(s.raw).padStart(10)} B   ${pct(raw, s.raw)}`);
  console.log(`  gzip            ${n(gzip).padStart(10)} B   stock ${n(s.gzip).padStart(10)} B   ${pct(gzip, s.gzip)}`);
  console.log(`  inlined Flight  ${n(flight).padStart(10)} B   stock ${n(s.flight).padStart(10)} B   ${pct(flight, s.flight)}`);
  console.log(`  elided stubs    ${html.match(/\$J/g)?.length ?? 0}`);
}
