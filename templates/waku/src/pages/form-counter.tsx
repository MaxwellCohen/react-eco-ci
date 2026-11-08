import * as React from 'react';
import FormCounter from '../components/form-counter';

export default async function FormCounterPage() {
  return (
    <main>
      <title>Waku form action counter</title>
      <h1>Form action counter</h1>
      <p>Server React <code>{React.version}</code> &middot; <a href="/">home</a></p>
      <FormCounter />
    </main>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
