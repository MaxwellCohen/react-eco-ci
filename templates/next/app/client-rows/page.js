import * as React from 'react';
import Row from './row';

export const dynamic = 'force-dynamic';
const ROWS = 1000;

// The same table, but every row is a Client Component: nothing in it can be elided.
export default function ClientRowsPage() {
  const rows = Array.from({ length: ROWS }, (_, i) => ({
    id: i,
    name: `Product ${i}`,
    category: ['Hardware', 'Software', 'Services'][i % 3],
    price: ((i * 7.31) % 500).toFixed(2),
    description: 'A reasonably long description repeated across rows so payload deduplication has something to find.',
  }));
  return (
    <main>
      <h1>Next + Flight: {ROWS} client rows</h1>
      <table>
        <tbody>
          {rows.map(r => <Row key={r.id} r={r} />)}
        </tbody>
      </table>
    </main>
  );
}
