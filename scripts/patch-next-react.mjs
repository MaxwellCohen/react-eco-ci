// Usage: node scripts/patch-next-react.mjs <next checkout> <react-urls.json>
// Points a Next.js checkout's vendored React (the *-builtin dev deps and pnpm overrides) at our React
// package URLs, enables exotic URL sources for pnpm, and adds the published @next/swc-* optional deps.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [dir, urlsFile] = process.argv.slice(2);
const urls = JSON.parse(readFileSync(urlsFile, 'utf8'));
const pj = join(dir, 'package.json');
const pkg = JSON.parse(readFileSync(pj, 'utf8'));
const need = n => { if (!urls[n]) throw new Error(`no URL for ${n} in ${urlsFile}`); return urls[n]; };
const map = {
  'react-builtin': 'react', 'react-experimental-builtin': 'react',
  'react-dom-builtin': 'react-dom', 'react-dom-experimental-builtin': 'react-dom',
  'react-is-builtin': 'react-is',
  'react-server-dom-turbopack': 'react-server-dom-turbopack', 'react-server-dom-turbopack-experimental': 'react-server-dom-turbopack',
  'react-server-dom-webpack': 'react-server-dom-webpack', 'react-server-dom-webpack-experimental': 'react-server-dom-webpack',
  'scheduler-builtin': 'scheduler', 'scheduler-experimental-builtin': 'scheduler',
};
for (const [dep, p] of Object.entries(map)) {
  if (pkg.devDependencies?.[dep]) pkg.devDependencies[dep] = need(p);
  else if (pkg.dependencies?.[dep]) pkg.dependencies[dep] = need(p);
  else console.warn(`warning: ${dep} not in root package.json`);
}
pkg.pnpm ??= {}; pkg.pnpm.overrides ??= {};
for (const p of ['react', 'react-dom', 'react-is', 'scheduler']) pkg.pnpm.overrides[p] = need(p);
writeFileSync(pj, JSON.stringify(pkg, null, 2) + '\n');

const ws = join(dir, 'pnpm-workspace.yaml');
let y = readFileSync(ws, 'utf8');
if (/^blockExoticSubdeps:/m.test(y)) y = y.replace(/^blockExoticSubdeps:.*$/m, 'blockExoticSubdeps: false');
else y = y.trimEnd() + '\nblockExoticSubdeps: false\n';
writeFileSync(ws, y);

const np = join(dir, 'packages/next/package.json');
const next = JSON.parse(readFileSync(np, 'utf8'));
next.optionalDependencies ??= {};
for (const pl of ['darwin-arm64', 'darwin-x64', 'linux-arm64-gnu', 'linux-arm64-musl', 'linux-x64-gnu', 'linux-x64-musl', 'win32-arm64-msvc', 'win32-x64-msvc']) next.optionalDependencies[`@next/swc-${pl}`] = next.version;
writeFileSync(np, JSON.stringify(next, null, 2) + '\n');
console.log('patched next', next.version);
