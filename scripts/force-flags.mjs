// Usage: node scripts/force-flags.mjs <react checkout> <comma-separated flags>
// Sets `export const <flag>[: boolean] = <x>;` to true in packages/shared/ReactFeatureFlags.js.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const [dir, list] = process.argv.slice(2);
const file = join(dir, 'packages/shared/ReactFeatureFlags.js');
let s = readFileSync(file, 'utf8');
for (const f of list.split(',').map(x => x.trim()).filter(Boolean)) {
  const re = new RegExp(`export const ${f}(: boolean)? = \\w+;`);
  if (!re.test(s)) throw new Error(`flag not found: ${f}`);
  s = s.replace(re, `export const ${f}$1 = true;`);
}
writeFileSync(file, s);
