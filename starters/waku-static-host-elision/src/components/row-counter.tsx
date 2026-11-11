'use client';
import * as React from 'react';

export const RowCounter = ({ id }: { id: number }) => {
  const [n, setN] = React.useState(0);
  return <button className="counter" onClick={() => setN(n + 1)}>Row {id}: {n}</button>;
};
