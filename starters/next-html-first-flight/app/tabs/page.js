import Link from 'next/link';
import Tabs from './tabs';

export const dynamic = 'force-dynamic';

export default function TabsPage() {
  return (
    <main>
      <h1>Tabs with server panels</h1>
      <p>
        Overview is in the HTML and Specs is not. React sends Specs at the end of the stream, so every tab opens without a request.{' '}
        <Link id="home" href="/">Home</Link>
      </p>
      <Tabs labels={['Overview', 'Specs']}>
        <section id="overview">
          <h2>Overview</h2>
          <ul>{Array.from({ length: 50 }, (_, i) => <li key={i}>Overview item {i + 1}</li>)}</ul>
        </section>
        <section id="specs">
          <h2>Specs</h2>
          <ul>{Array.from({ length: 50 }, (_, i) => <li key={i}>Spec {i + 1}</li>)}</ul>
        </section>
      </Tabs>
    </main>
  );
}
