// Usage: node scripts/publish-react.mjs <path to react build/oss-<channel>>
// Publishes the React packages to pkg.pr.new and writes react-urls.json ({pkg: url}).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dir = resolve(process.argv[2]);
const wanted = ['react', 'react-dom', 'scheduler', 'react-is', 'react-server-dom-webpack', 'react-server-dom-turbopack', 'react-server-dom-parcel'];
const pkgs = wanted.filter((p) => existsSync(join(dir, p, 'package.json'))).map((p) => join(dir, p));
// --no-compact: compact URLs require the package on npm under a matching repo.
execFileSync('npx', ['--yes', 'pkg-pr-new@latest', 'publish', '--no-compact', '--no-template', '--comment=off', '--json', 'output.json', ...pkgs], { stdio: 'inherit' });
const out = JSON.parse(readFileSync('output.json', 'utf8'));
const urls = Object.fromEntries(out.packages.map((p) => [p.name, p.url]));
writeFileSync('react-urls.json', JSON.stringify(urls, null, 2));
console.log(urls);
