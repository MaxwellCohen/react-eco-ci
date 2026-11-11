# Static host elision demo (Waku)

A small Waku app on a React build with `enableFlightStaticHostElision` on, and a Waku with two small changes that opt in and recover. See the [react-eco-ci README](https://github.com/MaxwellCohen/react-eco-ci#try-static-host-elision) for what this is and where the packages come from.

```sh
npm install
npm run build
npm start          # http://localhost:8080
npm run measure    # in a second terminal
```

Pages: `/table-host`, `/table-client`, `/late-modal`.
