// RSC environment (bundled with the `react-server` condition). Exposes the page and the Flight render.
import { renderToReadableStream, registerClientReference, registerServerReference, decodeAction, decodeFormState, decodeReply, unstable_pruneForBrowser } from 'react-server-dom-webpack/server.edge';
import { Suspense } from 'react';
import { generateProducts, makeCss, makeJsonLd } from './data.js';

// Server action for the counter. Being a real server reference is what lets <form action> + useActionState work without JS:
// Fizz emits $ACTION_REF_* fields, the browser POSTs them, and handleAction() below runs it and returns the form state.
async function counterAction(count, formData) {
  await new Promise(r => setTimeout(r, 150));
  const op = formData.get('op');
  const step = Number(formData.get('step') || 1);
  if (op === 'reset') return 0;
  return op === 'dec' ? count - step : count + step;
}
// Per-button variant for <button formAction>: `op` is a bound argument, so no-JS submits can tell the buttons apart
// (a function formAction drops the button's own name/value).
async function counterOp(op, count, formData) {
  formData.set('op', op);
  return counterAction(count, formData);
}
registerServerReference(counterAction, 'counter', 'counterAction');
registerServerReference(counterOp, 'counter', 'counterOp');
export const serverModules = { counter: { counterAction, counterOp } };
globalThis.__webpack_chunk_load__ = () => Promise.resolve();
const serverManifest = { counter: { id: 'counter', chunks: [], name: '*' } };
// No-JS postback: run the submitted action, return the state for Fizz/hydrateRoot `formState`.
export async function handleAction(formData) {
  const action = await decodeAction(formData, serverManifest);
  if (!action) return null;
  const fs = await decodeFormState(await action(), formData, serverManifest);
  // A formAction button posts counterOp; Fizz only reuses the state if it matches useActionState's own action signature.
  if (fs && fs[2] === 'counter#counterOp') { fs[2] = 'counter#counterAction'; fs[3] = 0; }
  return fs;
}
// With-JS call (callServer): decode the encoded args, run the action, return a Flight stream of the result.
export async function callAction(id, body) {
  const args = await decodeReply(body, serverManifest);
  const [mod, name] = id.split('#');
  return renderToReadableStream(await serverModules[mod][name](...args), serverManifest);
}

const clientRef = id => registerClientReference(() => { throw new Error(`${id} is a client component`); }, id, 'default');
const Counter = clientRef('Counter');
const Row = clientRef('Row');
const FormCounter = clientRef('FormCounter');
export const clientManifest = {
  Counter: { id: 'Counter', chunks: [], name: '*' },
  Row: { id: 'Row', chunks: [], name: '*' },
  FormCounter: { id: 'FormCounter', chunks: [], name: '*' },
};
// A slow server component: with streaming, the shell is sent first and this arrives `ms` later.
async function Reviews({ ms, prune }) {
  await new Promise(r => setTimeout(r, ms));
  // Stateless client rows inside a late boundary: with early hydration the client may render these (as pruned stubs when
  // the framework opts in) before or after the server DOM for the boundary has streamed in.
  const more = generateProducts(300).map(p => { const row = <Row key={`r${p.id}`} {...p} id={undefined} />; return prune ? prune(row, 'tr') : row; });
  return (
    <section id="reviews">
      <h2>Reviews</h2>
      <p>Loaded after {ms} ms on the server.</p>
      <table className="reviews-table"><tbody>{more}</tbody></table>
    </section>
  );
}
const css = makeCss(), jsonLd = makeJsonLd();

// The same page for both frameworks. `prune` is the author's assertion that stateless rows do nothing in the
// browser (only used by the opted-in framework; the other passes null so every row ships as ordinary Flight).
function makePage(prune) {
  return function Page({ itemCount, delayMs }) {
    const products = generateProducts(itemCount);
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <title>Product catalog</title>
          <style dangerouslySetInnerHTML={{ __html: css }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
        </head>
        <body>
          <header className="site-header"><h1>Product catalog</h1><nav><a href="/">Home</a></nav></header>
          <Counter label="Top counter" />
          <Suspense fallback={null}>
            <table className="product-table">
              <tbody>
                {products.map((p, i) => {
                  const row = <Row key={p.id} {...p} />;
                  if (i % 100 === 99) return <tr key={p.id} className="table-row"><td colSpan={7}><Counter label={`Row ${i}`} /></td></tr>;
                  return prune ? prune(row, 'tr') : row;
                })}
              </tbody>
            </table>
          </Suspense>
          {delayMs > 0 && (
            <Suspense fallback={<p id="reviews-fallback">Loading reviews…</p>}>
              <Reviews ms={delayMs} prune={prune} />
            </Suspense>
          )}
        </body>
      </html>
    );
  };
}
const PagePlain = makePage(null);
const PageOptIn = makePage(unstable_pruneForBrowser);

export function render(optIn, itemCount, delayMs, options) {
  const Page = optIn ? PageOptIn : PagePlain;
  return renderToReadableStream(<Page itemCount={itemCount} delayMs={delayMs} />, clientManifest, options);
}

// /form-counter: a form-action counter (useActionState + <form action> + formAction props) on a page that also has content
// the opt-in features can act on: inline CSS and JSON-LD (elided), stateless client rows (pruned) and, with ?delay=, a
// late Suspense boundary. The counter is interactive, so it must NOT be pruned and has to hydrate normally.
function makeCounterPage(prune) {
  return function PageCounter({ delayMs }) {
    const rows = generateProducts(200).map(p => { const row = <Row key={p.id} {...p} />; return prune ? prune(row, 'tr') : row; });
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <title>Form action counter</title>
          <style dangerouslySetInnerHTML={{ __html: css }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
        </head>
        <body>
          <h1>Form action counter</h1>
          <p><a href="/">home</a></p>
          <FormCounter action={counterAction} opAction={counterOp} />
          <Suspense fallback={null}>
            <table className="product-table"><tbody>{rows}</tbody></table>
          </Suspense>
          {delayMs > 0 && (
            <Suspense fallback={<p id="reviews-fallback">Loading reviews…</p>}>
              <Reviews ms={delayMs} prune={prune} />
            </Suspense>
          )}
        </body>
      </html>
    );
  };
}
const PageCounterPlain = makeCounterPage(null);
const PageCounterOptIn = makeCounterPage(unstable_pruneForBrowser);
export function renderCounter(optIn, delayMs, options) {
  const Page = optIn ? PageCounterOptIn : PageCounterPlain;
  return renderToReadableStream(<Page delayMs={delayMs} />, clientManifest, options);
}
