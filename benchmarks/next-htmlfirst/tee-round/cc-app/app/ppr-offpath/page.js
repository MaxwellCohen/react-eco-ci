import { Suspense } from 'react';
import { connection } from 'next/server';
import Rows from '../rows';
import Counter from './counter';
async function Now() {
  await connection();
  return <p id="now">{new Date().toISOString()}</p>;
}
export default function Page() {
  return (
    <main>
      <section><Counter /><Rows /></section>
      <Suspense fallback={<p>loading</p>}><Now /></Suspense>
    </main>
  );
}
