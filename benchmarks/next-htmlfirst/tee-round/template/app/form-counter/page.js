import * as React from 'react';
import FormCounter from './form-counter';
export const dynamic = 'force-static';
export default function Page() {
  return (
    <main>
      <h1>Form action counter</h1>
      <p>Server React <code>{React.version}</code> &middot; <a href="/">home</a></p>
      <FormCounter />
    </main>
  );
}
