// Usage: node scripts/build-framework.mjs <variant>   (variants in flight-versions.json)
// Builds React (Flight prod build, flags forced per variant), packs react/react-dom/scheduler/react-server-dom-webpack
// and builds demos/framework (a tiny Flight+Fizz framework Worker with /plain and /optin pages).
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const name = process.argv[2];
const v = JSON.parse(readFileSync('flight-versions.json', 'utf8'))[name];
if (!v) throw new Error(`unknown variant "${name}"`);
const root = resolve('.');
const src = join(root, '.cache', `fw-${name}`), out = join(root, '.build', `framework-${name}`), tgz = join(root, '.cache', `fw-${name}-tgz`);
for (const d of [src, out, tgz]) { rmSync(d, { recursive: true, force: true }); mkdirSync(d, { recursive: true }); }
const run = (cmd, args, cwd, env = {}) => execFileSync(cmd, args, { cwd, stdio: 'inherit', env: { ...process.env, ...env } });

run('git', ['clone', '--depth', '1', '--branch', v.ref, `https://github.com/${v.repo}.git`, src]);
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: src }).toString().trim();
if (v.flags.length) run('node', [join(root, 'scripts/force-flags.mjs'), src, v.flags.join(',')]);
run('yarn', ['install', '--frozen-lockfile'], src);
run('yarn', ['build-for-flight-prod'], src);

const files = {};
const pkgs = ['react', 'react-dom', 'scheduler', 'react-server-dom-webpack'];
for (const p of pkgs) {
  const file = execFileSync('npm', ['pack', '--ignore-scripts', '--silent', '--pack-destination', tgz], { cwd: join(src, 'build/oss-experimental', p) }).toString().trim().split('\n').pop();
  files[p] = join(tgz, file);
}
cpSync(join(root, 'demos/framework'), out, { recursive: true });
const pj = join(out, 'package.json');
const pkg = JSON.parse(readFileSync(pj, 'utf8'));
for (const p of pkgs) pkg.dependencies[p] = `file:${files[p]}`;
pkg.overrides = Object.fromEntries(pkgs.map(p => [p, `file:${files[p]}`]));
writeFileSync(pj, JSON.stringify(pkg, null, 2));
writeFileSync(join(out, 'src/version.json'), JSON.stringify({ variant: name, repo: v.repo, ref: v.ref, sha, flags: v.flags }, null, 2));
const wr = join(out, 'wrangler.jsonc');
writeFileSync(wr, readFileSync(wr, 'utf8').replace('__NAME__', `react-eco-fw-${name}`));
run('npm', ['install', '--no-audit', '--no-fund', '--legacy-peer-deps'], out);
run('npm', ['run', 'build'], out);
console.log(`built framework/${name} -> ${out}`);
