import * as React from 'react';
import { Counter } from '../components/counter';

export default async function HomePage() {
  return (
    <main>
      <title>React eco CI - Waku</title>
      <h1>Waku + React</h1>
      <p>Server React <code>{React.version}</code></p>
      <Counter />
      <p><a href="/table">1000-row Flight table</a></p>
      <p><a href="/form-counter">Form action counter (useActionState)</a></p>
    </main>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
