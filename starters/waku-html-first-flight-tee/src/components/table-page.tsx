import * as React from 'react';
import { Link } from 'waku';
import { RowCounter } from './row-counter';
import { Row } from './row';
import { makeCss, makeJsonLd } from '../blobs';

const css = makeCss();
const jsonLd = makeJsonLd(668);
const ROWS = 1000;

// mode: host = static <tr> host rows; client = stateless client <Row>
export function TablePage({ mode }: { mode: 'host' | 'client' }) {
  const rows = Array.from({ length: ROWS }, (_, i) => ({
    id: i,
    name: `Product ${i}`,
    category: ['Hardware', 'Software', 'Services'][i % 3]!,
    price: ((i * 7.31) % 500).toFixed(2),
    description: 'A reasonably long description repeated across rows so payload deduplication has something to find.',
  }));
  return (
    <main>
      <title>Waku Flight table ({mode})</title>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <h1>Waku + Flight: {ROWS} rows ({mode})</h1>
      <nav>
        <Link to="/table-host" id="nav-host">host</Link> <Link to="/table-client" id="nav-client">client</Link>
      </nav>
      <RowCounter id={-1} />
      <React.Suspense fallback={null}>
      <table>
        <tbody>
          {rows.map((r) => {
            if (r.id % 100 === 99) {
              return (
                <tr key={r.id}>
                  <td colSpan={6}><RowCounter id={r.id} /></td>
                </tr>
              );
            }
            if (mode === 'host') {
              return (
                <tr key={r.id}>
                  <td>{r.id}</td><td>{r.name}</td><td>{r.category}</td><td>${r.price}</td><td>{r.description}</td><td></td>
                </tr>
              );
            }
            return <Row key={r.id} {...r} />;
          })}
        </tbody>
      </table>
      </React.Suspense>
    </main>
  );
}
