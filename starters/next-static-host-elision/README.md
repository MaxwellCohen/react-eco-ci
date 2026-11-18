# Static host elision demo (Next.js)

A small Next.js app on a patched Next.js 16.4.6 that vendors a React build with `enableFlightStaticHostElision` on. See the [react-eco-ci README](https://github.com/MaxwellCohen/react-eco-ci#try-static-host-elision) for what this is and where the packages come from.

```sh
npm install
npm run build
npm start          # http://localhost:3000
npm run measure    # in a second terminal
```

Pages: `/table`, `/static-table`, `/client-rows`, `/modal`.
