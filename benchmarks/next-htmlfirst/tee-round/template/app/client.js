'use client';
import * as React from 'react';
export default function Client() {
  const [n, setN] = React.useState(0);
  return <p>Client React <code>{React.version}</code> <button onClick={() => setN(n + 1)}>count {n}</button></p>;
}
