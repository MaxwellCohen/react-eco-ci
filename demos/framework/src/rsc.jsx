// RSC environment (bundled with the `react-server` condition). Exposes the page and the Flight render.
import { renderToReadableStream, registerClientReference, unstable_pruneForBrowser } from 'react-server-dom-webpack/server.edge';
import { Suspense } from 'react';
import { generateProducts, makeCss, makeJsonLd } from './data.js';

const clientRef = id => registerClientReference(() => { throw new Error(`${id} is a client component`); }, id, 'default');
const Counter = clientRef('Counter');
const Row = clientRef('Row');
export const clientManifest = {
  Counter: { id: 'Counter', chunks: [], name: '*' },
  Row: { id: 'Row', chunks: [], name: '*' },
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
