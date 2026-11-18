import Link from 'next/link';
export default function Page() {
  return (
    <main>
      <h1>HTML-first Flight on Next.js</h1>
      <ul>
        <li><Link href="/table">/table</Link>: 1000 rows rendered by Server Components on each request.</li>
        <li><Link href="/static-table">/static-table</Link>: the same page, prerendered at build time.</li>
        <li><Link href="/client-rows">/client-rows</Link>: the rows are Client Components, which are never stubbed.</li>
        <li><Link href="/modal">/modal</Link>: static server children that mount only after a click.</li>
      </ul>
    </main>
  );
}
