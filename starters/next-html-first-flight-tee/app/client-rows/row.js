'use client';
import * as React from 'react';
export default function Row({ r }) {
  const [n, setN] = React.useState(0);
  return (
    <tr>
      <td>{r.id}</td><td>{r.name}</td><td>{r.category}</td><td>${r.price}</td><td>{r.description}</td>
      <td>{r.id % 100 === 99 ? <button className="counter" onClick={() => setN(n + 1)}>Row {r.id}: {n}</button> : null}</td>
    </tr>
  );
}
