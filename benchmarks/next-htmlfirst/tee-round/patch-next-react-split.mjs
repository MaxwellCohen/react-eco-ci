// Usage: node patch-next-react-split.mjs <next checkout> <stable tgz dir> <experimental tgz dir>
// Reconstructed 2026-11-23 from react-eco-ci/scripts/patch-next-react.mjs after the original
// (in a session temp dir) was deleted. Points a Next.js checkout's vendored React at local
// tarballs: the canary ("stable" channel) build in Next's stable slots and pnpm overrides, the
// experimental build in its -experimental slots. Each dir holds react.tgz, react-dom.tgz,
// react-is.tgz, scheduler.tgz, react-server-dom-webpack.tgz, react-server-dom-turbopack.tgz.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [dir, stableDir, experimentalDir] = process.argv.slice(2);
if (!dir || !stableDir || !experimentalDir) throw new Error('usage: <next checkout> <stable tgz dir> <experimental tgz dir>');
const tgz = (d, p) => {
  const f = join(resolve(d), p + '.tgz');
  if (!existsSync(f)) throw new Error('missing ' + f);
  return 'file:' + f;
};
const pj = join(dir, 'package.json');
const pkg = JSON.parse(readFileSync(pj, 'utf8'));
const map = {
  'react-builtin': 'react', 'react-experimental-builtin': 'react',
  'react-dom-builtin': 'react-dom', 'react-dom-experimental-builtin': 'react-dom',
  'react-is-builtin': 'react-is',
  'react-server-dom-turbopack': 'react-server-dom-turbopack', 'react-server-dom-turbopack-experimental': 'react-server-dom-turbopack',
  'react-server-dom-webpack': 'react-server-dom-webpack', 'react-server-dom-webpack-experimental': 'react-server-dom-webpack',
  'scheduler-builtin': 'scheduler', 'scheduler-experimental-builtin': 'scheduler',
};
for (const [dep, p] of Object.entries(map)) {
  const src = tgz(dep.includes('experimental') ? experimentalDir : stableDir, p);
  if (pkg.devDependencies?.[dep]) pkg.devDependencies[dep] = src;
  else if (pkg.dependencies?.[dep]) pkg.dependencies[dep] = src;
  else console.warn(`warning: ${dep} not in root package.json`);
}
pkg.pnpm ??= {}; pkg.pnpm.overrides ??= {};
for (const p of ['react', 'react-dom', 'react-is', 'scheduler']) pkg.pnpm.overrides[p] = tgz(stableDir, p);
writeFileSync(pj, JSON.stringify(pkg, null, 2) + '\n');

const ws = join(dir, 'pnpm-workspace.yaml');
let y = readFileSync(ws, 'utf8');
if (/^blockExoticSubdeps:/m.test(y)) y = y.replace(/^blockExoticSubdeps:.*$/m, 'blockExoticSubdeps: false');
else y = y.trimEnd() + '\nblockExoticSubdeps: false\n';
writeFileSync(ws, y);

// The published native compiler for this Next version, which the e2e harness needs at the root.
const np = join(dir, 'packages/next/package.json');
const next = JSON.parse(readFileSync(np, 'utf8'));
next.optionalDependencies ??= {};
for (const pl of ['darwin-arm64', 'darwin-x64', 'linux-arm64-gnu', 'linux-arm64-musl', 'linux-x64-gnu', 'linux-x64-musl', 'win32-arm64-msvc', 'win32-x64-msvc']) next.optionalDependencies[`@next/swc-${pl}`] = next.version;
writeFileSync(np, JSON.stringify(next, null, 2) + '\n');
console.log('patched (split channels)', next.version);
