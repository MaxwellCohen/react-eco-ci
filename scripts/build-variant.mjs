// Usage: node scripts/build-variant.mjs <template: vite|next|waku> <label>
// Copies templates/<template> to .build/<template>-<label> and points react & friends at the
// URLs in react-urls.json (written by publish-react.mjs; or hand-write {pkg: url/tarball}).
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [template, name] = process.argv.slice(2);
const urls = JSON.parse(readFileSync(process.env.REACT_URLS_FILE || 'react-urls.json', 'utf8'));
if (!existsSync(join('templates', template))) throw new Error(`unknown template "${template}"`);

const root = resolve('.');
const out = join(root, '.build', `${template}-${name}`);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(root, 'templates', template), out, { recursive: true });

// `next` (optional) = your Next fork preview, e.g. https://pkg.pr.new/MaxwellCohen/next.js/next@<sha>.
// That build already vendors its own React (see sync-react-csb + copy_vendor_react), so it is not overridden.
// `waku` (optional) = a Waku build to use instead of the template's npm version, e.g. a patched fork.
const { next: nextUrl, waku: wakuUrl, ...reactUrls } = urls;
const PKGS = Object.keys(reactUrls);

const pkgPath = join(out, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
for (const p of PKGS) if (pkg.dependencies?.[p]) pkg.dependencies[p] = reactUrls[p];
if (nextUrl && pkg.dependencies?.next) pkg.dependencies.next = nextUrl;
if (wakuUrl && pkg.dependencies?.waku) pkg.dependencies.waku = wakuUrl;
pkg.overrides = { ...pkg.overrides, ...reactUrls };
pkg.name = `react-eco-${template}-${name}`.replace(/[^a-z0-9-]/g, '-');
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

const info = { template, variant: name, packages: urls };
mkdirSync(join(out, 'public'), { recursive: true });
writeFileSync(join(out, 'public/version.json'), JSON.stringify(info, null, 2));
writeFileSync(join(out, 'react-variant.json'), JSON.stringify(info, null, 2));

const wr = join(out, 'wrangler.jsonc');
if (existsSync(wr)) writeFileSync(wr, readFileSync(wr, 'utf8').replace('__NAME__', `react-eco-${template}-${name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')));

const run = (cmd, args) => execFileSync(cmd, args, { cwd: out, stdio: 'inherit', env: { ...process.env, REACT_VARIANT: name, NEXT_PUBLIC_REACT_VARIANT: name } });
run('npm', ['install', '--no-audit', '--no-fund', '--legacy-peer-deps']);
run('npm', ['run', 'build']);
console.log(`\nbuilt ${template}/${name} -> ${out}`);
