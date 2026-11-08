// Usage: node scripts/build-stream.mjs <variant>   (variants in versions.json)
// Clones the pinned React repo/ref read-only, forces the listed feature flags on, builds
// react/react-dom/scheduler (experimental, NODE_PROD), packs them and builds the streaming Worker.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const name = process.argv[2];
const versions = JSON.parse(readFileSync('versions.json', 'utf8'));
const v = versions[name];
if (!v) throw new Error(`unknown variant "${name}". Known: ${Object.keys(versions).join(', ')}`);

const root = resolve('.');
const src = join(root, '.cache', name), out = join(root, '.build', `streaming-${name}`), tgz = join(root, '.cache', `${name}-tgz`);
const run = (cmd, args, cwd, env = {}) => execFileSync(cmd, args, { cwd, stdio: 'inherit', env: { ...process.env, ...env } });
for (const d of [src, out, tgz]) { rmSync(d, { recursive: true, force: true }); mkdirSync(d, { recursive: true }); }

run('git', ['clone', '--depth', '1', '--branch', v.ref, `https://github.com/${v.repo}.git`, src]);
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: src }).toString().trim();

const flagFile = join(src, 'packages/shared/ReactFeatureFlags.js');
let flags = readFileSync(flagFile, 'utf8');
for (const f of v.flags) {
  const re = new RegExp(`export const ${f}(: boolean)? = \\w+;`);
  if (!re.test(flags)) throw new Error(`flag ${f} not found in ${v.repo}@${v.ref}`);
  flags = flags.replace(re, `export const ${f}$1 = true;`);
}
writeFileSync(flagFile, flags);

run('yarn', ['install', '--frozen-lockfile'], src);
run('yarn', ['build', 'react/index,react-dom/index,react-dom/client,react-dom/src/server/react-dom-server.node,react-dom/src/server/react-dom-server.browser,react-dom/src/server/react-dom-server.edge,react-dom/src/server/ReactDOMLegacyServerNode,react-dom/src/server/ReactDOMLegacyServerBrowser,scheduler', '--type=NODE_PROD'], src, { RELEASE_CHANNEL: 'experimental' });

const files = {};
for (const p of ['react', 'react-dom', 'scheduler']) {
  const dir = join(src, 'build/oss-experimental', p);
  const file = execFileSync('npm', ['pack', '--ignore-scripts', '--silent', '--pack-destination', tgz], { cwd: dir }).toString().trim().split('\n').pop();
  files[p] = join(tgz, file);
}

cpSync(join(root, 'demos/streaming'), out, { recursive: true });
const pkgPath = join(out, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
for (const p of ['react', 'react-dom', 'scheduler']) pkg.dependencies[p] = `file:${files[p]}`;
pkg.overrides = Object.fromEntries(['react', 'react-dom', 'scheduler'].map(p => [p, `file:${files[p]}`]));
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
writeFileSync(join(out, 'src/version.json'), JSON.stringify({ variant: name, repo: v.repo, ref: v.ref, sha, flags: v.flags }, null, 2));
const wr = join(out, 'wrangler.jsonc');
writeFileSync(wr, readFileSync(wr, 'utf8').replace('__NAME__', `react-eco-stream-${name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')));

run('npm', ['install', '--no-audit', '--no-fund'], out);
run('npm', ['run', 'build'], out);
console.log(`built streaming/${name} -> ${out}`);
