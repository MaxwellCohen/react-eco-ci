import * as React from 'react';
import { RowCounter } from '../components/row-counter';

const ROWS = 1000;

// A big server-rendered table: the Flight payload and HTML are what the Flight flags change.
export default async function TablePage() {
  const rows = Array.from({ length: ROWS }, (_, i) => ({
    id: i,
    name: `Product ${i}`,
    category: ['Hardware', 'Software', 'Services'][i % 3],
    price: ((i * 7.31) % 500).toFixed(2),
    description: 'A reasonably long description repeated across rows so payload deduplication has something to find.',
  }));
  return (
    <main>
      <title>Waku Flight table</title>
      <h1>Waku + Flight: {ROWS} rows</h1>
      <p>Server React <code>{React.version}</code>. View source to compare the inlined Flight payload.</p>
      <table>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.name}</td>
              <td>{r.category}</td>
              <td>${r.price}</td>
              <td>{r.description}</td>
              <td>{r.id % 100 === 99 ? <RowCounter id={r.id} /> : null}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export const getConfig = async () => ({ render: 'dynamic' }) as const;
