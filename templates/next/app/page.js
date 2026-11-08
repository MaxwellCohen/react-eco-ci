import * as React from 'react';
import Client from './client';
export const dynamic = 'force-static';
export default function Page() {
  return (
    <main>
      <h1>Next.js + React</h1>
      <p>Server React <code>{React.version}</code></p>
      <Client />
      <p><a href="/version.json">/version.json</a></p>
    </main>
  );
}
