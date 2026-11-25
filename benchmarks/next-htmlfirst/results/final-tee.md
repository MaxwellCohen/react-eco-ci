# HTML-first Flight over the Flight tee: final release-candidate run, Next.js 16.4.6 (2026-11-19)

All tests and benchmarks below install the release-candidate files by path from `/Users/maxcohen/code/react-ecosystem/html-first-tee-release/`. Every bench app's `package-lock.json` sha512 integrity matches the file it was installed from (see `final-tee-artifacts.txt`).

## Inputs

- React: MaxwellCohen/react `rsc/html-first-on-tee` at `189973d24a8ee07de41d7f41d76faa8bd5a7989f` (PR #28). In this commit `enableFlightTee = true` in every channel. Only `enableFlightHTMLFirst` was forced on (`react-eco-ci/scripts/force-flags.mjs`). Both channels were built (all bundle types for react, react-dom, scheduler, react-is, react-server-dom-webpack, react-server-dom-turbopack).
  - Canary `19.3.0-canary-189973d2-20261119`; experimental `0.0.0-experimental-189973d2-20261119`.
  - The canary client bundles export `createTee`/`createFromTee` with no "createTee is not supported" path (prod error code 616 absent). The canary server bundle contains the `$J` stub code.
- Next.js: MaxwellCohen/next.js `html-first/16.4-tee` at `9f9de6041d` (unchanged, nothing committed). React was re-vendored as before: canary build in Next's stable slots, experimental build in its experimental slots. The vendored React is not committed. Its tarballs are recorded below and kept in `html-first-tee-release/vendored-into-next/`.
  - The packed Next has `19.3.0-canary-189973d2-20261119` in all vendored canary packages and `0.0.0-experimental-189973d2-20261119` in the experimental ones. The 3 leftover `019019be` strings are in prebuilt `next-devtools` / `bundle-analyzer` bundles, the same as stock.
  - Packed with `htmlFirstFlight: false` (default). Turn it on with `experimental.htmlFirstFlight: true`.

## Artifacts (sha256)

| File | sha256 |
|---|---|
| `next-16.4.6-html-first-flight-tee.tgz` | `5d1d2bf7f13cb6e157b82dad8cd1476946f12ecb6f13cebdefb4a630a0f684db` |
| `react-html-first-flight.tgz` (canary) | `21935c062e782e5bdfb08329eea8ce821b4f32f6271c4d7a03552005374fc1a0` |
| `react-dom-html-first-flight.tgz` (canary) | `26686def582df9a03869765594d9dd66faead1c5daeb4bf1cdb0584aa05e8e92` |
| `scheduler-html-first-flight.tgz` (canary) | `a3696a92a0dc6f974df593422179d36b37620a1af5b55f96ebf194ec8b52a8d8` |
| `react-is-html-first-flight.tgz` (canary) | `e42c0435b0041b5be3f61dc871a148320f7d3fdfcf0458f5e3085a7a3cac574a` |
| `react-server-dom-webpack-html-first-flight.tgz` (canary) | `dd00965312f7753101e591aed0f5b2895344c2fee86900ba5caf8c534daec539` |
| `waku-1.0.0-rc.4-html-first-flight-tee.tgz` | `f37407f94ce28aba3e0945eb5c1d108835755230f4c6ee1055d88e02631c3fc1` |

Vendored into Next (`vendored-into-next/SHA256SUMS`; the canary react, react-dom, scheduler, react-is and react-server-dom-webpack are the same files as the release tarballs above):

| File | sha256 |
|---|---|
| `experimental/react-dom.tgz` | `b50a07e8d705ae67f40984da50d810dea2cb84fc0065e6d4acce8039a1446669` |
| `experimental/react-is.tgz` | `cf621b4dab87be755dde95eb9aa4ae7b699aa90bdae0b07cd7dda505afe50ef2` |
| `experimental/react-server-dom-turbopack.tgz` | `b56405d601ac49415977c97f45346ed458da08e9c38e4918e17bddd9e5dfabbe` |
| `experimental/react-server-dom-webpack.tgz` | `dc75c8fd933666cd88398a138e43926ffc72307aba6e663891047cc84a97d3d7` |
| `experimental/react.tgz` | `e001e95f9aa1986fa06179e2407b141a18be42cb6f81590fe1035b8dd5155165` |
| `experimental/scheduler.tgz` | `bc3ee6cd3609fe598a07a11e4c9ff2ea6edb905e7f1b1415e42095893f2dd1cb` |
| `stable/react-dom.tgz` | `26686def582df9a03869765594d9dd66faead1c5daeb4bf1cdb0584aa05e8e92` |
| `stable/react-is.tgz` | `e42c0435b0041b5be3f61dc871a148320f7d3fdfcf0458f5e3085a7a3cac574a` |
| `stable/react-server-dom-turbopack.tgz` | `abd96d2416854909a9e823bce0be9aa1da229fbda398460ddffe303fc5a3bd35` |
| `stable/react-server-dom-webpack.tgz` | `dd00965312f7753101e591aed0f5b2895344c2fee86900ba5caf8c534daec539` |
| `stable/react.tgz` | `21935c062e782e5bdfb08329eea8ce821b4f32f6271c4d7a03552005374fc1a0` |
| `stable/scheduler.tgz` | `a3696a92a0dc6f974df593422179d36b37620a1af5b55f96ebf194ec8b52a8d8` |

## Variants

- off: stock Next.js 16.4.6 (`off-stock`, unchanged from the earlier rounds), `htmlFirstFlight: false`.
- registry: release `html-first-flight-231161c` Next tarball and its canary React (Next sha256 `3babf683bfc889fd92bb16056be175d7d13ac8bdd5cdcc278b3c78c2c2f34206`; the react-dom tarball was checked against the GitHub release asset).
- tee: `next-16.4.6-html-first-flight-tee.tgz` + the release canary React above.
- `t-tee` and `t-cc-tee` were rebuilt from the release files (`tee-round/make-variant-release.sh`). `t-off`, `t-reg`, `t-cc-off`, `t-cc-reg` are the earlier builds (lockfiles re-verified).

## E2E (production mode, Turbopack)

Same 52 suites as before (`tee-round/e2e-suites-52.txt`), run with `tee-round/e2e.sh`'s method.

- Option on (default flipped to true, the only diff from the release build): 779 passed, 92 failed, 251 skipped (1,122 total). 47 suites passed, 3 failed, 2 skipped.
  - Failed: `app-static` (1,175 s), `app-action` (670 s), `app/index` (4,327 s). Those durations are 10–60× normal. Of the 192 failure messages, 178 are `Exceeded timeout of 120000 ms` (mostly `beforeAll` building the test app), 2 are "next instance not destroyed", and 12 are other assertion failures, all in `app-static` (HTTP 500, empty or stale data).
  - The machine was overloaded during this run: load average 18–40 (thermally throttled, kernel_task about 125% CPU, other sessions' jest run until about 17:20).
  - Rerun 3× with the option on and load average about 3.7: **all three suites passed 3 of 3** (302 passed, 13 skipped each time; `app-static` 94–96 s, `app-action` 81–83 s, `app/index` 72–75 s).
  - Registry build (same 52 suites, session 5561229a `final52.log`): `app-static` and `app/index` passed. `app-action` had one different, flaky failure there.
  - So no failures remain that are attributable to the tee build.
- Option off: `rsc-basic`, `app-action`, `navigation` pass (172 passed, 4 skipped).
  - The first off run was cut off by a task time limit after `app-action` passed; it was rerun in full.
  - The e2e harness installs its own `pnpm pack` of `packages/next`. After the off run, that `packed.tgz` was diffed against the release tarball. The file contents match, apart from `package.json` key order (pnpm vs npm pack) and one extra stale `dist/bundle-analyzer/_next/static/<buildId>/` directory left over from an earlier build of the worktree.
- With the option on, the e2e build is necessarily a separate build: same commit, same vendored React files, `htmlFirstFlight` default `true`.
- Raw: `final-tee-e2e.json`. Logs in the session scratchpad (`e2e-on.log`, `e2e-off2.log`, `rerun-on-{1,2,3}.log`).

## Results

Throughput: `measure.mjs`, 16 connections, 10 s after a 10 s warm-up, 5 rounds, variant order rotated and alternated per round. Ratios are per round against off: median (min–max). No request errors, timeouts or non-200s.

Load average: about 2.7 when the runner started (it waited for no jest and a 1-min load average < 3 before each phase). It was 3.6–5.2 during the throughput rounds; the benchmark's own servers and autocannon raise it. See "Load average" below.

| Metric | off | registry | tee | Previous tee run (679a7e83, load 7–12) |
|---|---|---|---|---|
| Requests/s, dynamic table (× off) | 1.00 (59.2 req/s) | 3.49× (3.35–3.56) | 3.41× (2.55–3.54) | 3.15× (reg 3.07×) |
| TTFB, dynamic table (× off) | 1.00 (17.2 ms) | 0.35× (0.30–0.40) | 0.37× (0.30–0.75) | 0.41× |
| Requests/s, client-rows page (× off) | 1.00 (129.6 req/s) | 1.06× (0.99–1.48) | 1.29× (1.22–1.70) | 1.27× (reg 1.06×) |
| TTFB, client-rows page (× off) | 1.00 (8.9 ms) | 0.90× (0.83–0.94) | 0.73× (0.70–0.83) | 0.87× |
| Inlined Flight, dynamic table | 765,387 B | 23,355 B | 23,364 B | 23,351 B |
| Gzip HTML, dynamic table | 108,928 B | 55,209 B | 55,217 B | 55,212 B |
| Inlined Flight, prerendered table | 765,516 B | 29,089 B | 29,089 B | 29,089 B |
| Gzip HTML, prerendered table | 108,963 B | 57,669 B | 57,672 B | 57,678 B |
| Stored payload, prerendered table | 680,767 B | 680,761 B, 0 stubs | 680,761 B, 0 stubs | same |
| Stored payload, Cache Components static | 105,830 B | 105,831 B, 0 stubs | 105,831 B, 0 stubs | same |
| Inlined Flight, Cache Components PPR page | 125,424 B | 4,265 B | 4,267 B | 4,218 B |
| Inlined Flight, Cache Components static page | 125,258 B | 11,609 B | 11,609 B | 11,609 B |
| Main thread per `router.refresh()`, 1st / 2nd (median of 10, `refresh.mjs`) | 16 / 13 ms | 20 / 11 ms | 19 / 11.5 ms | 18.5 / 11 ms |
| DOM nodes after leaving /table (median of 3) | 256 | 75 | 75 | 75 |
| JS heap after leaving /table | 4.36 MB | 4.21 MB | 4.22 MB | 4.17 MB |

- Tee against registry, same round: table 0.73–1.01× (median 0.99), client-rows 1.15–1.31× (median 1.20). The 0.73 is round 2, where tee's TTFB was 2.4× registry's in that round only; the other four rounds are 0.96–1.01×. On the stubbed table page the two are tied. On the client-rows page tee is about 20% faster, as in the previous run.
- The tee build's /table inlined Flight is 9 B larger than the registry's (23,364 vs 23,355 B), from the longer React version string and build-specific chunk names.
- `refresh.mjs` ranges overlap for all three variants (off 14–23 / 12–20, registry 16–26 / 9–14, tee 15–26 / 9–24 ms). The 5-trial refresh in `-extra.json` gives off 20/14, registry 21/13, tee 19/12.

Browser checks (Chromium headless shell; `check.mjs` and `measure-extra.mjs`):

- `check.mjs`: on /table, /client-rows and /modal, registry and tee have `domMatchesStock: true`. 1000 rows, counters respond, client navigation and Back work with the same RSC requests as off, the modal shows 20 clauses, 0 console messages.
  - Harness fix: `check.mjs` now normalizes canary and `0.0.0-experimental` version strings (it used to normalize only `19.3.0-experimental`, which gave the false `domMatchesStock: false` noted last time).
- `measure-extra.mjs`: Cache Components /static and /ppr DOM match off for both registry and tee. Navigation to /static and Back render 1000 rows, no console logs.
- `measure.mjs`'s own browser phase has the known `/client rows` URL-wait bug (times out on /table for all three variants including off) and the old version normalization. `check.mjs` is the browser result of record.

## Load average

| Phase | Start (1/5/15 min) | End |
|---|---|---|
| E2E on (52 suites), 16:5x–19:18 | samples 28.7, 6.4, 17.9, 39.8, 19.6, 11.9 | – |
| E2E off + 3 reruns, 19:21–19:37 | 3.1–3.8 | – |
| measure.mjs, 19:49–19:57 | 2.68 3.85 5.42 | 5.73 4.81 5.17 (rounds 3.9, 3.6, 3.7, 4.6, 5.2) |
| measure-extra.mjs, 20:00–20:02 | 2.86 3.95 4.74 | 7.59 4.91 4.99 |
| refresh.mjs, 20:05–20:08 | 2.90 4.15 4.67 | 13.55 6.56 5.45 |
| check.mjs, 20:24–20:25 | 2.85 3.87 4.42 | 3.70 4.02 4.46 |

The jest run in the React worktree had finished before the benchmarks started. No other CPU work of this session ran during them.

## Raw data

`final-tee-loadavg.log` (load average at each phase boundary), `final-tee-main.json` (bytes, throughput rounds), `final-tee-extra.json`, `final-tee-refresh.json`, `final-tee-check.json`, `final-tee-e2e.json`, `final-tee-artifacts.txt` (sha256 of every release file and every bench-app install, with lockfile integrity checks).

Scripts: `../measure.mjs`, `../check.mjs` (version-normalization fix), `../tee-round/measure-extra.mjs`, `../tee-round/refresh.mjs` (now honours `OUT`), `../tee-round/make-variant-release.sh` (new: installs from a release dir by path), `../tee-round/e2e.sh`.
