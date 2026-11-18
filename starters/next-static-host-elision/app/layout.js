import Link from 'next/link';
export const metadata = { title: 'Static host elision on Next.js' };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui', padding: 24 }}>
        <nav>
          <Link href="/">home</Link> &middot; <Link href="/table">table</Link> &middot; <Link href="/static-table">static table</Link> &middot;{' '}
          <Link href="/client-rows">client rows</Link> &middot; <Link href="/modal">modal</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
