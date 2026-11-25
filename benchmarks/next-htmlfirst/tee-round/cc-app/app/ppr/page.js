import { Suspense } from 'react';
import { connection } from 'next/server';
import Rows from '../rows';
async function Now() {
  await connection();
  return <p id="now">{new Date().toISOString()}</p>;
}
export default function Page() {
  return <main><h1>ppr page</h1><Suspense fallback={<p>loading</p>}><Now /></Suspense><Rows /></main>;
}
