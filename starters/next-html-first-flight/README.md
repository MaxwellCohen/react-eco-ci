# HTML-first Flight demo (Next.js)

A small Next.js app on a patched Next.js 16.4.6 that vendors a React build with `enableFlightHTMLFirst` on. `next.config.mjs` turns the feature on with `experimental.htmlFirstFlight: true`. See the [react-eco-ci README](https://github.com/MaxwellCohen/react-eco-ci#try-html-first-flight) for what this is and where the packages come from.

```sh
npm install
npm run build
npm start          # http://localhost:3000
npm run measure    # in a second terminal
```

Pages: `/table`, `/static-table`, `/client-rows`, `/modal`.
