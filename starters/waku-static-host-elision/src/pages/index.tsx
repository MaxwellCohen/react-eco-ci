import { Link } from 'waku';

export default async function Home() {
  return (
    <main style={{ maxWidth: 720 }}>
      <h1>Static host elision demo</h1>
      <p>
        A Waku app on a React build with <code>enableFlightStaticHostElision</code> on and a Waku patch that opts in.
        Static Server Component markup is left out of the Flight payload the browser receives and adopted from the HTML.
      </p>
      <ul>
        <li>
          <Link to="/table-host">/table-host</Link>: a 1000-row table rendered by Server Components, plus inline CSS and
          JSON-LD. View the source and look at the inlined <code>__FLIGHT_DATA</code>.
        </li>
        <li>
          <Link to="/table-client">/table-client</Link>: the same rows as Client Components, which are never elided
          (a much smaller saving).
        </li>
        <li>
          <Link to="/late-modal">/late-modal</Link>: static content that only mounts after a click. It is not in the
          first payload, so the page refetches it.
        </li>
      </ul>
      <p>
        Run <code>npm run measure</code> in another terminal to print sizes for the two table pages.
      </p>
    </main>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
