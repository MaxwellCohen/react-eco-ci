# react-eco-ci

Standalone: build React at any commit (any repo), publish it to pkg.pr.new, and build/host Vite, Next.js and Waku demos on it. Nothing needs to be added to the React repo.

**CI** — install the [pkg-pr-new GitHub App](https://github.com/apps/pkg-pr-new) on this repo, then run the `react-build` workflow with `repo` (default `facebook/react`), `ref` (commit SHA) and `channel`.
It builds React, publishes `react`, `react-dom`, `scheduler`, `react-is`, `react-server-dom-*` to `https://pkg.pr.new/<you>/react-eco-ci/<pkg>@<this-repo-sha>`, then builds each demo against those URLs and deploys it as Cloudflare Worker `react-eco-<template>-<react-sha>`.
Needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` secrets; otherwise deploy is skipped.
The package URLs are in the `react-urls` artifact. Note: pkg.pr.new keys by this repo's commit, so re-running for a different React commit on the same repo commit replaces the previous packages (the deployed demos keep working only until their next install).

**Local** — `cd <react> && yarn build -r=experimental`, then write `react-urls.json` mapping package → `file:/abs/path/to/build/oss-experimental/<pkg>` and run
`node scripts/build-variant.mjs <vite|next|waku> <label>` → `.build/<template>-<label>`.

Each demo shows `React.version` (and `/version.json`).
**Next.js caveat:** App Router uses Next's vendored React, so the override doesn't change it; the demo prints server and client versions so you can tell.
