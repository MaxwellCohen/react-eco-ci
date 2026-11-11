# react-eco-ci

Standalone: build React at any commit (any repo), publish it to pkg.pr.new, and build/host Vite, Next.js and Waku demos on it. Nothing needs to be added to the React repo.

**CI** — install the [pkg-pr-new GitHub App](https://github.com/apps/pkg-pr-new) on this repo, then run the `react-build` workflow with `repo` (default `facebook/react`), `ref` (commit SHA) and `channel`.
It builds React, publishes `react`, `react-dom`, `scheduler`, `react-is`, `react-server-dom-*` to `https://pkg.pr.new/<you>/react-eco-ci/<pkg>@<this-repo-sha>`, then builds each demo against those URLs and deploys it as Cloudflare Worker `react-eco-<template>-<react-sha>`.
Needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` secrets; otherwise deploy is skipped.
The package URLs are in the `react-urls` artifact. Note: pkg.pr.new keys by this repo's commit, so re-running for a different React commit on the same repo commit replaces the previous packages (the deployed demos keep working only until their next install).

**Local** — `cd <react> && yarn install && yarn --cwd compiler install`, then `yarn build -r=experimental`, then write `react-urls.json` mapping package → `file:/abs/path/to/build/oss-experimental/<pkg>` and run
`node scripts/build-variant.mjs <vite|next|waku> <label>` → `.build/<template>-<label>`.
The compiler install is required: `yarn build` compiles `eslint-plugin-react-hooks` against compiler sources, which fails without its `@types`.

## Try static host elision

[`enableFlightStaticHostElision`](https://github.com/MaxwellCohen/react/pull/24) leaves static Server Component output out of the Flight payload the browser receives and adopts it from the HTML instead. Results and design: [summary](https://html-first-react.pages.dev/summary/).

**Run the demo.** Needs Node 22 and npm; nothing is cloned or built.

```sh
npx degit MaxwellCohen/react-eco-ci/starters/waku-static-host-elision elision-demo
cd elision-demo
npm install
npm run build
npm start            # http://localhost:8080
```

In a second terminal, `npm run measure` prints the size of the two table pages next to what stock React and stock Waku send for the same pages (about 98% less inlined Flight and 54% less gzipped HTML for `/table-host`). The pages:

- `/table-host`: a 1000-row table rendered by Server Components, plus inline CSS and JSON-LD. View the source: the inlined `__FLIGHT_DATA` is small and contains `$J` stubs.
- `/table-client`: the same rows as Client Components, which are never elided, so the saving is smaller.
- `/late-modal`: static content that only mounts after a click. It is not in the first payload, so the page refetches it. Click "open".

I have only run `npm run build` and `npm start`, not `npm run dev`.

**Use it in your own Waku app.** The packages are attached to the [`static-host-elision-df35615` release](https://github.com/MaxwellCohen/react-eco-ci/releases/tag/static-host-elision-df35615). They are React `df356153a6` built with the flag forced on, and a Waku based on upstream `b0d0a798` (1.0.0-rc.4) with [two small changes](https://github.com/MaxwellCohen/wakujs/compare/b0d0a798...62e75f5f). Install them and override the two packages React depends on:

```sh
R=https://github.com/MaxwellCohen/react-eco-ci/releases/download/static-host-elision-df35615
npm install $R/react-19.3.0-static-host-elision.tgz $R/react-dom-19.3.0-static-host-elision.tgz \
  $R/react-server-dom-webpack-19.3.0-static-host-elision.tgz $R/waku-1.0.0-rc.4-static-host-elision.tgz
```

```json
"overrides": {
  "react": "https://github.com/MaxwellCohen/react-eco-ci/releases/download/static-host-elision-df35615/react-19.3.0-static-host-elision.tgz",
  "react-dom": "https://github.com/MaxwellCohen/react-eco-ci/releases/download/static-host-elision-df35615/react-dom-19.3.0-static-host-elision.tgz",
  "scheduler": "https://github.com/MaxwellCohen/react-eco-ci/releases/download/static-host-elision-df35615/scheduler-0.28.0-static-host-elision.tgz",
  "react-is": "https://github.com/MaxwellCohen/react-eco-ci/releases/download/static-host-elision-df35615/react-is-19.3.0-static-host-elision.tgz",
  "react-server-dom-webpack": "https://github.com/MaxwellCohen/react-eco-ci/releases/download/static-host-elision-df35615/react-server-dom-webpack-19.3.0-static-host-elision.tgz"
}
```

The app has to work on Waku 1.0.0-rc.4. These are experimental builds for evaluation, not for production.

**Build the packages yourself.** The same packages can be built in CI or locally.

*In CI.* Install the [pkg-pr-new GitHub App](https://github.com/apps/pkg-pr-new) on this repo, then run the [`react-build`](https://github.com/MaxwellCohen/react-eco-ci/actions/workflows/react-build.yml) workflow with:

| input | value |
|---|---|
| `repo` | `MaxwellCohen/react` |
| `ref` | `rsc/html-first-one-flag` (or a commit from it) |
| `flags` | `enableFlightStaticHostElision` |
| `suffix` | `static-host-elision` |
| `templates` | `["waku"]` |
| `waku_repo` | `MaxwellCohen/wakujs` |
| `waku_ref` | `rsc-html-first-optin` |

It builds React with the flag forced on, builds the Waku fork, publishes both to pkg.pr.new in one command (pkg.pr.new allows one publish per workflow run), and deploys the `waku` template as a Cloudflare Worker (this needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets; without them the deploy is skipped). `flight-versions.json` has the same two variants (`off`, `on`) for the `flight` and `framework` workflows.

*Locally.* You need Node 22, yarn and pnpm, and this repo, the [React fork](https://github.com/MaxwellCohen/react/tree/rsc/html-first-one-flag) and the [Waku fork](https://github.com/MaxwellCohen/wakujs/tree/rsc-html-first-optin) checked out side by side.

```sh
cd react && yarn install --frozen-lockfile
node ../react-eco-ci/scripts/force-flags.mjs . enableFlightStaticHostElision
RELEASE_CHANNEL=experimental node ./scripts/rollup/build.js \
  react/index,react/jsx,react.react-server,react/src/jsx/ReactJSXServer.js,react-dom/index,react-dom/client,react-dom/server,react-dom.react-server,react-dom-server,scheduler,react-is,react-server-dom-webpack/ \
  --type=NODE_DEV,NODE_PROD                                  # output: build/node_modules
cd ../react-eco-ci
node scripts/pack-local.mjs ../react/build/node_modules ../wakujs   # writes .tgz/ and react-urls.json
node scripts/build-variant.mjs waku static-host-elision             # builds .build/waku-static-host-elision
cd .build/waku-static-host-elision && npx wrangler dev --config dist/server/wrangler.json --port 8787
```

The framework side of this is two small changes, both in the Waku patch: the HTML render passes `elideStaticHosts: true`, and the root passes `onElidedContentMissing` for the initial payload and refetches it in full when React asks.

Each demo shows `React.version` (and `/version.json`).
**Next.js caveat:** App Router uses Next's vendored React, so the override doesn't change it; the demo prints server and client versions so you can tell.

**Next with vendored React:** use your Next fork's flow — `pnpm sync-react-csb <react-sha>` there, push, let `publish-preview.yml` publish `next` to pkg.pr.new, then pass that URL as `next_url` (or add `"next": "<url>"` to `react-urls.json`). The Next demo installs it instead of stock `next`, so the App Router runs your vendored React.
