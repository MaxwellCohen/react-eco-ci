# HTML-first Flight demo (Next.js)

A small Next.js app on a patched Next.js 16.4.6 that vendors a React build with `enableFlightHTMLFirst` on. `next.config.mjs` turns the feature on with `experimental.htmlFirstFlight: true`. See the [react-eco-ci README](https://github.com/MaxwellCohen/react-eco-ci#try-html-first-flight) for what this is and where the packages come from.

```sh
npm install
npm run build
npm start          # http://localhost:3000
npm run measure    # in a second terminal
```

Pages: `/table`, `/static-table`, `/client-rows`, `/modal`, `/tabs`.

## Check tabs and Back/Forward

`/tabs` has client tabs that unmount the panels they hide. Overview is in the HTML and Specs is not. `npm run check` opens the page in Chromium against the running server and fails if any step is wrong:

- Switching away from Overview and back rebuilds it without a request.
- Specs opens without a request, because React sends its rows at the end of the stream.
- After a client navigation, Back and Forward show the right panel with no console errors.

```sh
npx playwright install chromium   # once
npm run check                     # with `npm start` running
```

