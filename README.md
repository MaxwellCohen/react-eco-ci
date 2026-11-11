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

[`enableFlightStaticHostElision`](https://github.com/MaxwellCohen/react/pull/24) leaves static Server Component output out of the Flight payload the browser receives and adopts it from the HTML instead. Results and design: [summary](https://html-first-react.pages.dev/summary/). The demo is the `waku` template, built with the React branch `rsc/html-first-one-flag` (flag forced on) and the patched Waku branch `rsc-html-first-optin` ([the patch](https://github.com/MaxwellCohen/wakujs/compare/b0d0a798...rsc-html-first-optin)). It has two pages worth opening: `/table` (a 1000-row server-rendered table, where most of the savings are) and `/late-modal` (static content that only mounts after a click, which needs the recovery in the Waku patch).

**In CI.** Install the [pkg-pr-new GitHub App](https://github.com/apps/pkg-pr-new) on this repo, then run the [`react-build`](https://github.com/MaxwellCohen/react-eco-ci/actions/workflows/react-build.yml) workflow with:

| input | value |
|---|---|
| `repo` | `MaxwellCohen/react` |
| `ref` | `rsc/html-first-one-flag` (or a commit from it) |
| `flags` | `enableFlightStaticHostElision` |
| `suffix` | `static-host-elision` |
| `templates` | `["waku"]` |
| `waku_repo` | `MaxwellCohen/wakujs` |
| `waku_ref` | `rsc-html-first-optin` |

It builds React with the flag forced on, builds and publishes the patched Waku, and deploys the demo as a Cloudflare Worker (this needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets; without them the deploy is skipped and the build still runs). Run it once more without `flags`, `waku_repo` and `waku_ref` for the stock comparison. `flight-versions.json` has the same two variants (`off`, `on`) for the `flight` and `framework` workflows.

**Locally.** You need Node 22, yarn and pnpm.

```sh
# 1. React with the flag on
git clone --branch rsc/html-first-one-flag https://github.com/MaxwellCohen/react.git && cd react
yarn install --frozen-lockfile
node ../react-eco-ci/scripts/force-flags.mjs . enableFlightStaticHostElision
RELEASE_CHANNEL=experimental node ./scripts/rollup/build.js \
  react/index,react/jsx,react.react-server,react/src/jsx/ReactJSXServer.js,react-dom/index,react-dom/client,react-dom/server,react-dom.react-server,react-dom-server,scheduler,react-is,react-server-dom-webpack/ \
  --type=NODE_DEV,NODE_PROD                                  # output: build/node_modules
cd ..

# 2. The patched Waku
git clone --branch rsc-html-first-optin https://github.com/MaxwellCohen/wakujs.git

# 3. Pack both and build the demo
cd react-eco-ci
node scripts/pack-local.mjs ../react/build/node_modules ../wakujs   # writes .tgz/ and react-urls.json
node scripts/build-variant.mjs waku static-host-elision             # builds .build/waku-static-host-elision
cd .build/waku-static-host-elision
npx wrangler dev --config dist/server/wrangler.json --port 8787
```

Open `http://localhost:8787/table` and view the source: the inlined `__FLIGHT_DATA` is a fraction of the stock size and holds `$J` stubs. Open `/late-modal`, click "open", and the content appears (it was not in the first payload; Waku refetches it). For the stock comparison, repeat from step 3 with a React build made without the `force-flags.mjs` line and without passing the Waku checkout to `pack-local.mjs`.

The framework side of this is two small changes, both in the Waku patch: the HTML render passes `elideStaticHosts: true`, and the root passes `onElidedContentMissing` for the initial payload and refetches it in full when React asks.

Each demo shows `React.version` (and `/version.json`).
**Next.js caveat:** App Router uses Next's vendored React, so the override doesn't change it; the demo prints server and client versions so you can tell.

**Next with vendored React:** use your Next fork's flow — `pnpm sync-react-csb <react-sha>` there, push, let `publish-preview.yml` publish `next` to pkg.pr.new, then pass that URL as `next_url` (or add `"next": "<url>"` to `react-urls.json`). The Next demo installs it instead of stock `next`, so the App Router runs your vendored React.
