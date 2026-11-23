# HTML-first Flight demo on the Flight tee (Waku)

A small Waku app on a React build with `enableFlightHTMLFirst` on, and a patched Waku that opts in and recovers. This is the Flight tee version: SSR reads the Flight render through a tee instead of a process-global registry (React [PR #28](https://github.com/MaxwellCohen/react/pull/28), Waku branch [`rsc-html-first-tee`](https://github.com/MaxwellCohen/wakujs/tree/rsc-html-first-tee)). It installs the exact tarballs from release [`html-first-flight-tee-d5dd0f5`](https://github.com/MaxwellCohen/react-eco-ci/releases/tag/html-first-flight-tee-d5dd0f5) that the benchmarks ran against; their sha256 sums are in the release. React is `19.3.0-canary-d5dd0f51-20261123`. The frameworks tell React when the HTML render is done, instead of React guessing with timers. See the [react-eco-ci README](https://github.com/MaxwellCohen/react-eco-ci#try-html-first-flight) for what this is.

```sh
npm install
npm run build
npm start          # http://localhost:8080
npm run measure    # in a second terminal
```

Pages: `/table-host`, `/table-client`, `/late-modal`, `/tabs`.

## Check tabs and Back/Forward

`/tabs` has client tabs that unmount the panels they hide. Overview is in the HTML and Specs is not. `npm run check` opens the page in Chromium against the running server and fails if any step is wrong:

- Switching away from Overview and back rebuilds it without a request.
- Specs opens without a request, because React sends its rows at the end of the stream.
- Specs is still left out of the HTML: the two panels reach `Tabs` as an array in `children`. An element that a Client Component receives as the whole of `children`, and elements under about 48 bytes, are never left out.
- After a client navigation, Back and Forward show the right panel with no console errors.

```sh
npx playwright install chromium   # once
npm run check                     # with `npm start` running
```

