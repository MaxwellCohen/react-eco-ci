# react-eco-ci

Standalone: build React at any commit (any repo), publish it to pkg.pr.new, and build/host Vite, Next.js and Waku demos on it. Nothing needs to be added to the React repo.

**CI** — install the [pkg-pr-new GitHub App](https://github.com/apps/pkg-pr-new) on this repo, then run the `react-build` workflow with `repo` (default `facebook/react`), `ref` (commit SHA) and `channel`.
It builds React, publishes `react`, `react-dom`, `scheduler`, `react-is`, `react-server-dom-*` to `https://pkg.pr.new/<you>/react-eco-ci/<pkg>@<this-repo-sha>`, then builds each demo against those URLs and deploys it as Cloudflare Worker `react-eco-<template>-<react-sha>`.
Needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` secrets; otherwise deploy is skipped.
The package URLs are in the `react-urls` artifact. Note: pkg.pr.new keys by this repo's commit, so re-running for a different React commit on the same repo commit replaces the previous packages (the deployed demos keep working only until their next install).

**Local** — `cd <react> && yarn install && yarn --cwd compiler install`, then `yarn build -r=experimental`, then write `react-urls.json` mapping package → `file:/abs/path/to/build/oss-experimental/<pkg>` and run
`node scripts/build-variant.mjs <vite|next|waku> <label>` → `.build/<template>-<label>`.
The compiler install is required: `yarn build` compiles `eslint-plugin-react-hooks` against compiler sources, which fails without its `@types`.

## Try HTML-first Flight

HTML-first Flight ([React PR #24](https://github.com/MaxwellCohen/react/pull/24), flag `enableFlightHTMLFirst`) leaves static Server Component output out of the Flight payload the browser receives, and the browser adopts that content from the HTML instead. Results and design: [summary](https://html-first-react.pages.dev/summary/).

You need Node 22 and npm. Both starters install prebuilt packages from the [`html-first-flight-231161c` release](https://github.com/MaxwellCohen/react-eco-ci/releases/tag/html-first-flight-231161c), so nothing is cloned or built. The release has React `231161c38d` built with the flag on, a patched Next.js 16.4.6 and a patched Waku 1.0.0-rc.4. Each starter has an `.npmrc` with `allow-remote=all`, because npm 12 refuses tarball URLs by default. The starters have been tested with `npm run build` and `npm start`, not `npm run dev`. These are experimental builds, not for production.

**Next.js.** The patched Next.js ([`html-first/16.4`](https://github.com/MaxwellCohen/next.js/compare/54b876b6b1...html-first/16.4)) turns the feature on with `experimental.htmlFirstFlight: true` in `next.config.mjs`. Without it, Next.js behaves like stock.

```sh
npx degit MaxwellCohen/react-eco-ci/starters/next-html-first-flight next-html-first
cd next-html-first
npm install
npm run build
npm start            # http://localhost:3000
```

In a second terminal, `npm run measure` prints the size of `/table`, `/static-table` and `/client-rows` next to stock Next.js 16.4.6 with the same React build and the flag off. `/modal` shows static server children that mount after a click, with no extra request. To use it in your own app, install the `next`, `react` and `react-dom` tarballs from the release, override `react`, `react-dom` and `scheduler` with them as the starter's `package.json` does, and set `experimental.htmlFirstFlight: true`. The app must work on Next.js 16.4.

**Waku.** The patched Waku ([`rsc-html-first-optin`](https://github.com/MaxwellCohen/wakujs/compare/b0d0a798...rsc-html-first-optin)) passes `htmlFirst: true` on the HTML render and refetches the initial payload when React calls `onMissingHTML`.

```sh
npx degit MaxwellCohen/react-eco-ci/starters/waku-html-first-flight waku-html-first
cd waku-html-first
npm install
npm run build
npm start            # http://localhost:8080
```

In a second terminal, `npm run measure` prints the size of the two table pages next to stock React and stock Waku. The pages:

- `/table-host`: a 1000-row table rendered by Server Components, plus inline CSS and JSON-LD. View the source: the inlined `__FLIGHT_DATA` is small and contains `$J` stubs.
- `/table-client`: the same rows as Client Components, which are never stubbed, so the saving is smaller.
- `/late-modal`: static content that mounts only after a click. Click "open".

To use it in your own Waku app, install the packages and override the ones React depends on:

```sh
R=https://github.com/MaxwellCohen/react-eco-ci/releases/download/html-first-flight-231161c
npm install $R/react-html-first-flight.tgz $R/react-dom-html-first-flight.tgz \
  $R/react-server-dom-webpack-html-first-flight.tgz $R/waku-1.0.0-rc.4-html-first-flight.tgz
```

```json
"overrides": {
  "react": "https://github.com/MaxwellCohen/react-eco-ci/releases/download/html-first-flight-231161c/react-html-first-flight.tgz",
  "react-dom": "https://github.com/MaxwellCohen/react-eco-ci/releases/download/html-first-flight-231161c/react-dom-html-first-flight.tgz",
  "scheduler": "https://github.com/MaxwellCohen/react-eco-ci/releases/download/html-first-flight-231161c/scheduler-html-first-flight.tgz",
  "react-is": "https://github.com/MaxwellCohen/react-eco-ci/releases/download/html-first-flight-231161c/react-is-html-first-flight.tgz",
  "react-server-dom-webpack": "https://github.com/MaxwellCohen/react-eco-ci/releases/download/html-first-flight-231161c/react-server-dom-webpack-html-first-flight.tgz"
}
```

The app must work on Waku 1.0.0-rc.4.

**Build the packages yourself.** The same packages can be built in CI or locally.

*In CI.* Install the [pkg-pr-new GitHub App](https://github.com/apps/pkg-pr-new) on this repo, then run the [`react-build`](https://github.com/MaxwellCohen/react-eco-ci/actions/workflows/react-build.yml) workflow with:

| input | value |
|---|---|
| `repo` | `MaxwellCohen/react` |
| `ref` | `rsc/html-first-one-flag` (or a commit from it) |
| `flags` | `enableFlightHTMLFirst` |
| `suffix` | `html-first-flight` |
| `templates` | `["waku"]` |
| `waku_repo` | `MaxwellCohen/wakujs` |
| `waku_ref` | `rsc-html-first-optin` |

It builds React with the flag forced on, builds the Waku fork, publishes both to pkg.pr.new in one command (pkg.pr.new allows one publish per workflow run), and deploys the `waku` template as a Cloudflare Worker (this needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets; without them the deploy is skipped). `flight-versions.json` has the same two variants (`off`, `on`) for the `flight` and `framework` workflows.

*Locally.* You need Node 22, yarn and pnpm, and this repo, the [React fork](https://github.com/MaxwellCohen/react/tree/rsc/html-first-one-flag) and the [Waku fork](https://github.com/MaxwellCohen/wakujs/tree/rsc-html-first-optin) checked out side by side.

```sh
cd react && yarn install --frozen-lockfile
node ../react-eco-ci/scripts/force-flags.mjs . enableFlightHTMLFirst
RELEASE_CHANNEL=experimental node ./scripts/rollup/build.js \
  react/index,react/jsx,react.react-server,react/src/jsx/ReactJSXServer.js,react-dom/index,react-dom/client,react-dom/server,react-dom.react-server,react-dom-server,scheduler,react-is,react-server-dom-webpack/ \
  --type=NODE_DEV,NODE_PROD                                  # output: build/node_modules
cd ../react-eco-ci
node scripts/pack-local.mjs ../react/build/node_modules ../wakujs   # writes .tgz/ and react-urls.json
node scripts/build-variant.mjs waku html-first-flight               # builds .build/waku-html-first-flight
cd .build/waku-html-first-flight && npx wrangler dev --config dist/server/wrangler.json --port 8787
```

The framework side of this is two small changes, both in the Waku patch: the HTML render passes `htmlFirst: true`, and the root passes `onMissingHTML` for the initial payload and refetches it in full when React asks.

Each demo shows `React.version` (and `/version.json`).
**Next.js caveat:** App Router uses Next's vendored React, so the override doesn't change it; the demo prints server and client versions so you can tell.

**Next with vendored React:** use your Next fork's flow — `pnpm sync-react-csb <react-sha>` there, push, let `publish-preview.yml` publish `next` to pkg.pr.new, then pass that URL as `next_url` (or add `"next": "<url>"` to `react-urls.json`). The Next demo installs it instead of stock `next`, so the App Router runs your vendored React.
