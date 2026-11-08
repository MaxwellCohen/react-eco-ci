// Usage: node scripts/run-flight.mjs <variant>   (variants in flight-versions.json)
// Clones the React repo/ref, forces the listed flags on, builds React for Flight, then runs the
// flight-ssr-bench fixture: the real-Chromium hydration e2e and the in-process render bench.
// Writes results/<variant>/{e2e.jsonl,e2e.log,inproc.txt,meta.json}. Never fails on a red e2e (the report does).
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const name = process.argv[2];
const v = JSON.parse(readFileSync('flight-versions.json', 'utf8'))[name];
if (!v) throw new Error(`unknown variant "${name}"`);
const root = resolve('.');
const src = join(root, '.cache', `flight-${name}`), res = join(root, 'results', name);
for (const d of [src, res]) { rmSync(d, { recursive: true, force: true }); mkdirSync(d, { recursive: true }); }
const run = (cmd, args, cwd, env = {}) => execFileSync(cmd, args, { cwd, stdio: 'inherit', env: { ...process.env, ...env } });

run('git', ['clone', '--depth', '1', '--branch', v.ref, `https://github.com/${v.repo}.git`, src]);
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: src }).toString().trim();
const flagFile = join(src, 'packages/shared/ReactFeatureFlags.js');
let flags = readFileSync(flagFile, 'utf8');
for (const f of v.flags) {
  const re = new RegExp(`export const ${f}: boolean = \\w+;`);
  if (!re.test(flags)) throw new Error(`flag ${f} not found`);
  flags = flags.replace(re, `export const ${f}: boolean = true;`);
}
writeFileSync(flagFile, flags);

run('yarn', ['install', '--frozen-lockfile'], src);
run('yarn', ['build-for-flight-prod'], src);
const fx = join(src, 'fixtures/flight-ssr-bench');
run('yarn', ['install', '--frozen-lockfile'], fx);
run('yarn', ['copy-modules'], fx);
run('npm', ['install', '--no-save', '--no-audit', '--no-fund', 'playwright'], fx);
run('npx', ['playwright', 'install', '--with-deps', 'chromium'], fx);

const env = { ...process.env, NODE_ENV: 'production' };
const e2e = spawnSync('node', ['e2e/run.js', '--rows=1000'], { cwd: fx, env, encoding: 'utf8', maxBuffer: 1 << 26 });
writeFileSync(join(res, 'e2e.log'), (e2e.stdout || '') + (e2e.stderr || ''));
writeFileSync(join(res, 'e2e.jsonl'), (e2e.stdout || '').split('\n').filter(l => l.startsWith('{')).join('\n'));
const bench = spawnSync('node', ['bench-inproc.js', '--rows=1000', '--n=60'], { cwd: fx, env, encoding: 'utf8', maxBuffer: 1 << 26 });
writeFileSync(join(res, 'inproc.txt'), (bench.stdout || '') + (bench.stderr || ''));
writeFileSync(join(res, 'meta.json'), JSON.stringify({ variant: name, repo: v.repo, ref: v.ref, sha, flags: v.flags, e2eExit: e2e.status, inprocExit: bench.status }, null, 2));
console.log(`e2e exit ${e2e.status}, inproc exit ${bench.status}`);
