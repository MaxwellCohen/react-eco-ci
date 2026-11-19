// Checks /tabs in a browser against a running server: tab toggles, the first
// open of a panel that wasn't in the HTML, and Back/Forward.
// Usage: npm start, then `npm run check` (BASE overrides the URL).
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.BASE ?? 'http://localhost:8080';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('console', m => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', e => errors.push(String(e)));
// Flight requests: Next sends an `rsc: 1` header, Waku fetches /RSC/ paths.
let requests = 0;
page.on('request', r => {
  if (r.headers().rsc === '1' || new URL(r.url()).pathname.startsWith('/RSC/')) requests++;
});
const settle = () => page.waitForTimeout(1000);
const shown = async () => {
  for (const id of ['overview', 'specs', 'notes']) {
    if (await page.locator('#' + id).count()) return id;
  }
  return null;
};
async function step(name, action, want, wantRequests) {
  const before = requests;
  await action();
  await settle();
  const got = await shown();
  const made = requests - before;
  console.log(`${name.padEnd(36)} panel=${got}  flight requests=${made}`);
  assert.equal(got, want, name);
  if (wantRequests !== undefined) assert.equal(made, wantRequests, name + ': flight requests');
}

const html = await (await fetch(base + '/tabs')).text();
assert.ok(html.includes('id="overview"'), 'Overview is in the HTML');
assert.ok(!html.includes('id="specs"'), 'Specs is not in the HTML');

await step('load /tabs', () => page.goto(base + '/tabs'), 'overview');
const adopted = await page.locator('#overview').elementHandle();
await step('Notes (Overview unmounts)', () => page.click('#tab-2'), 'notes', 0);
await step('Overview (remount, no request)', () => page.click('#tab-0'), 'overview', 0);
assert.equal(await page.locator('#overview li').count(), 50);
assert.equal(await adopted.evaluate(n => n.isConnected), false, 'Overview was unmounted and rebuilt');
await step('Specs (not in HTML, no request)', () => page.click('#tab-1'), 'specs', 0);
await step('Overview', () => page.click('#tab-0'), 'overview', 0);
await step('Specs', () => page.click('#tab-1'), 'specs', 0);
await step('Notes', () => page.click('#tab-2'), 'notes', 0);
await step('Overview', () => page.click('#tab-0'), 'overview', 0);
await step('client navigation to /', () => page.click('#home'), null);
await step('Back to /tabs', () => page.goBack(), 'overview');
assert.equal(await page.locator('#overview li').count(), 50);
await step('Specs after Back', () => page.click('#tab-1'), 'specs');
await step('Forward to /', () => page.goForward(), null);
await step('Back to /tabs again', () => page.goBack(), 'overview');

assert.deepEqual(errors, [], 'console errors');
console.log('ok');
await browser.close();
