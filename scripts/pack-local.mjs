// Usage: node scripts/pack-local.mjs <react build dir> [<waku checkout>]
// Packs the React packages in <react build dir> (build/node_modules or build/oss-experimental of a React
// checkout) into .tgz/ and writes react-urls.json with file: URLs. With a Waku checkout it also compiles and packs
// packages/waku and adds it as `waku`, so `node scripts/build-variant.mjs waku <label>` uses it.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [reactDir, wakuDir] = process.argv.slice(2).map((p) => p && resolve(p));
if (!reactDir) throw new Error('usage: node scripts/pack-local.mjs <react build dir> [<waku checkout>]');
const out = resolve('.tgz');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const pack = (dir) =>
  join(out, execFileSync('npm', ['pack', '--ignore-scripts', '--silent', '--pack-destination', out], { cwd: dir, encoding: 'utf8' }).trim().split('\n').pop());

const urls = {};
for (const p of ['react', 'react-dom', 'scheduler', 'react-is', 'react-server-dom-webpack']) {
  const dir = join(reactDir, p);
  if (existsSync(join(dir, 'package.json'))) urls[p] = 'file:' + pack(dir);
}
if (wakuDir) {
  execFileSync('pnpm', ['install', '--frozen-lockfile'], { cwd: wakuDir, stdio: 'inherit' });
  execFileSync('pnpm', ['--filter', 'waku', 'run', 'compile'], { cwd: wakuDir, stdio: 'inherit' });
  urls.waku = 'file:' + pack(join(wakuDir, 'packages/waku'));
}
writeFileSync('react-urls.json', JSON.stringify(urls, null, 2));
console.log(urls);
