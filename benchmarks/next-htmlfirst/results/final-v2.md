# HTML-first Flight, Next.js 16.4.6: off vs prev vs new (2026-11-23)

Same method as `final-tee.md`. "prev" = React `189973d2` build (release dir `html-first-tee-release/`), "new" = React `19.3.0-canary-d5dd0f51-20261123` (release dir `html-first-tee-release-v2/`).

## Inputs

All v2 files passed `shasum -a 256 -c SHA256SUMS`. The bench apps install them by path; lockfile sha512 integrity matches each file (`final-v2-artifacts.txt`).

| File (html-first-tee-release-v2/) | sha256 |
|---|---|
| `next-16.4.6-html-first-flight-tee.tgz` | `ef4bf08d7840f087c2e410033f53fcf61632de6010a0ad9fadb6200dc0d6dab8` |
| `react-html-first-flight.tgz` | `9926b6dc398ad02ac737ef6bb2f44a715dd28706c4ab2e4e1a286c7b106168bd` |
| `react-dom-html-first-flight.tgz` | `f99a49f713b1dc87338c9a771765ddf57a6313901c7a9fc89552bdf81494968a` |
| `scheduler-html-first-flight.tgz` | `e5208137acf172d613916d7bcc3967fc3a020f980294b5c5a893440e18c2f9c6` |
| `react-is-html-first-flight.tgz` | `1b5fa1da48ef023fc580aaf16d6d579c8128501b8b20c6587a00b9137dbbb213` |
| `react-server-dom-turbopack-html-first-flight.tgz` | `f9c7513096bc55257f533a203db49e00f5367cd66bb8655e8abefa0f1674f7e5` |
| `react-server-dom-webpack-html-first-flight.tgz` | `164886038a414a6f15cd6dc06cdaadd0b293e51680f52338f2a5e39c3d8b784e` |
| `waku-1.0.0-rc.4-html-first-flight-tee.tgz` | `74298ec7f48a30c103d5f4a3369852bc8674942fa7455ed5bcb2e03306772ea7` |
| `waku-1.0.0-rc.4-stock.tgz` | `f8a5730a80fcde8c0a264d799490d1af632e2d6bbb459b6667f53e355537780d` |

Vendored-into-Next React tarballs: see `SHA256SUMS` in the release dir (stable/* equal the top-level canary files).

## Variants

| Name | Build |
|---|---|
| off (`t-off`, `t-cc-off`) | stock Next 16.4.6, `htmlFirstFlight: false`. Reused unchanged from the earlier rounds. |
| prev (`t-tee`, `t-cc-tee`) | `html-first-tee-release/` Next tgz + canary React 189973d2, `htmlFirstFlight: true`. Reused; lockfile integrity re-verified, rebuilt nothing. |
| new (`v2-tee`, `v2-cc-tee`) | built tonight with `tee-round/make-variant-release.sh` from the v2 release dir (template app / cc-app, `htmlFirstFlight: true`). |

Off's original install tarballs (an old session scratchpad) no longer exist on disk, so off's lockfile integrity could not be re-hashed against the files. The installed `node_modules`, lockfile and `.next` build are untouched, and both off apps built-start and serve.

## Method

`measure.mjs` (autocannon, 16 connections, 10 s after a 10 s warm-up, 5 interleaved rounds, order rotated and alternated, 30 sequential TTFB requests per round, Turbopack builds, `next start`). Ratios are per round against off: median (min-max). 0 request errors, timeouts and non-200s in every run.

Throughput was run twice (second run is the required rerun, see below). Machine: Node v26.13.0, MacBook Air arm64, nothing else running; no build or test ran during any timing run.

## Results

Run A (`final-v2-main.json`, round load 4.3, 4.0, 4.6, 4.9, 3.5). Absolute numbers are medians of 5 rounds with min-max.

| Metric | off | prev | new |
|---|---|---|---|
| Requests/s, table (× off) | 66.4 (59.1-67.1) = 1.00 | 225.6 (208.1-233.6) = 3.50× (3.36-3.52) | 192.0 (176.0-198.0) = 2.98× (2.81-3.00) |
| TTFB, table ms (× off) | 16.2 (15.5-18.6) | 5.6 (5.1-6.4) = 0.33× (0.30-0.39) | 5.9 (5.7-6.7) = 0.37× (0.36-0.39) |
| Requests/s, client-rows (× off) | 142.4 (135.6-142.5) | 179.2 (169.4-180.8) = 1.26× (1.20-1.33) | 169.6 (164.5-175.8) = 1.19× (1.17-1.30) |
| TTFB, client-rows ms (× off) | 8.0 (7.7-8.6) | 6.5 (5.9-7.0) = 0.80× (0.68-0.90) | 6.8 (6.8-9.7) = 0.88× (0.78-1.20) |

Run B, the rerun (`final-v2-main-rerun.json`, round load 4.5, 3.3, 3.3, 4.5, 4.6):

| Metric | off | prev | new |
|---|---|---|---|
| Requests/s, table (× off) | 63.8 (57.5-67.1) = 1.00 | 204.8 (169.7-211.2) = 3.21× (2.95-3.35) | 194.8 (164.8-201.6) = 3.05× (2.80-3.35) |
| TTFB, table ms (× off) | 17.1 (16.3-18.9) | 5.6 (4.7-7.9) = 0.34× (0.29-0.44) | 6.6 (6.0-8.2) = 0.40× (0.34-0.43) |
| Requests/s, client-rows (× off) | 140.1 (124.7-145.6) | 174.4 (156.8-177.6) = 1.24× (1.20-1.26) | 168.1 (158.2-170.8) = 1.18× (1.17-1.27) |
| TTFB, client-rows ms (× off) | 8.3 (7.6-10.3) | 7.5 (5.8-7.8) = 0.89× (0.75-0.91) | 7.1 (6.7-7.6) = 0.86× (0.65-0.89) |

New vs prev, same round (new / prev, median (min-max)):

| Page | Run A rps | Run A TTFB | Run B rps | Run B TTFB |
|---|---|---|---|---|
| table | 0.85 (0.83-0.86) | 1.10 (0.93-1.20) | 0.95 (0.90-1.00) | 1.07 (0.93-1.34) |
| client-rows | 0.97 (0.94-0.98) | 1.11 (0.98-1.50) | 0.97 (0.95-1.01) | 0.97 (0.87-1.17) |

Bytes and browser metrics (`final-v2-extra.json`, `final-v2-refresh.json`):

| Metric | off | prev | new |
|---|---|---|---|
| Inlined Flight, dynamic table | 765,387 B | 23,363 B | 24,844 B |
| Gzip HTML, dynamic table | 108,928 B | 55,217 B | 55,274 B |
| Inlined Flight, prerendered table (`/static-table`) | 765,516 B | 29,089 B | 32,596 B |
| Gzip HTML, prerendered table | 108,963 B | 57,672 B | 58,449 B |
| Stored payload, prerendered table | 680,767 B | 680,761 B, 0 stubs | 680,761 B, 0 stubs |
| Stored payload, Cache Components static | 105,830 B | 105,831 B, 0 stubs | 105,830 B, 0 stubs |
| Inlined Flight, CC PPR page | 125,424 B | 4,268 B | 4,302 B |
| Inlined Flight, CC static page | 125,258 B | 11,609 B | 11,725 B |
| Gzip HTML, CC PPR / static | 17,293 / 16,509 B | 7,188 / 9,090 B | 7,177 / 9,110 B |
| Inlined Flight, client-rows page | 257,010 B | 257,008 B | 257,053 B |
| Main thread per `router.refresh()`, 1st / 2nd (median of 10; `refresh.mjs`) | 17.5 / 12 ms (15-20 / 10-13) | 19 / 10 ms (18-21 / 9-11) | 19 / 10 ms (18-21 / 9-12) |
| Main thread per `router.refresh()`, 5-trial in `-extra.json` | 17 / 12 | 18 / 11 | 18 / 10 |
| DOM nodes on /table, then after leaving it (median of 3) | 14,344 / 256 | 14,163 / 75 | 14,163 / 75 |
| JS heap on /table, then after leaving (MB) | 4.55 / 4.35 | 4.97 / 4.22 | 3.43 / 4.08 |

## Checks (browser, Chromium headless shell)

- `check.mjs` (`final-v2-check.json`): /table, /client-rows, /modal: prev and new have `domMatchesStock: true`. 1000 rows, counters respond (`Row 99: 1`, `Row 599: 2`, 10 counters), client navigation and Back give 1000 rows, modal shows 20 clauses, 0 console messages for all three variants. RSC request sequence per page is the same for the three variants (9 requests).
- `measure-extra.mjs`: CC /static and /ppr DOM match off for prev and new; navigate to /static and Back give 1000 rows, no console messages.
- `measure.mjs`'s own browser phase still has the known `/client rows` URL-wait bug (table nav times out for all three variants including off); `check.mjs` is the result of record. In that phase `domMatchesStock` was false for table on prev and new but that phase's comparison is the old unnormalized one; `check.mjs`, which normalizes versions, says true.

## What differs from `final-tee.md`

- Off moved up against the previous run: table 66.4 / 63.8 req/s (was 59.2, +8 to +12%), client-rows 142.4 / 140.1 (was 129.6, +8 to +10%), TTFB 16.2 / 17.1 ms (was 17.2). Same stock build and same install. Per the rule (about 10%), the whole throughput comparison was rerun once (run B). Run B off is +8% / +8% over the previous run, so the shift is machine state (load 2.3-5.5 now vs 2.7-5.2 then), not the build.
- Prev moved too: table 225.6 / 204.8 req/s (earlier run 3.41× × 59.2 ≈ 202) and ×off 3.50× / 3.21× (earlier 3.41×), client-rows ×off 1.26× / 1.24× (earlier 1.29×). Within the +/-10% band on ratios; absolute table req/s of prev varies between 205 and 226 across the two runs.
- Prev lockfiles and prev variants were reused as they were; nothing was rebuilt.

## Load average

| Phase | Start (1/5/15 min) | End |
|---|---|---|
| main run A | 3.94 6.23 7.06 (the previous 15 min were still elevated from the two builds above; waited 60 s, started anyway) | 2.18 3.95 5.57 |
| main run B (rerun) | 2.67 4.00 5.57 | 3.01 4.29 5.07 |
| measure-extra | 2.93 4.23 5.04 | 2.36 3.62 4.69 |
| refresh | 2.25 3.58 4.67 | 3.63 3.88 4.61 |
| check | 3.63 3.88 4.61 | 3.99 3.92 4.61 |

Round loads are listed per run above. The two `next build`s (v2-tee, v2-cc-tee) finished before any timing run began. See `final-v2-loadavg.log`.

## Raw data

`final-v2-main.json`, `final-v2-main-rerun.json` (+ `.out`/`.err`), `final-v2-extra.json`, `final-v2-refresh.json`, `final-v2-check.json`, `final-v2-loadavg.log`, `final-v2-artifacts.txt`.
Scripts: `../measure.mjs`, `../check.mjs`, `../tee-round/measure-extra.mjs`, `../tee-round/refresh.mjs` (now takes `VARIANTS=`; default unchanged), `../tee-round/make-variant-release.sh`.

## Addendum: cause of the gap to prev (November 23, 2026)

Profiling both servers under the same load (`--cpu-prof`, autocannon at 16 connections for 15 s) showed the new build spending about 0.6 ms more CPU per request on `/table`: about 0.29 ms in GC and about 0.25 ms in the Flight server's classify-and-copy walk. Everything else matched.

One line edited in the installed `app-page-turbo.runtime.prod.js` of `v2-tee`, so that the copy walk still runs but SSR gets the server's own element (`t.e(i),r` in place of `t.e(i),t.m(...)`), took new from 0.84× to 0.97× of prev (225 and 226 req/s against 232 to 233), and GC back to 0.34 ms per request. The file was restored afterwards. Response timing for a single request is the same in both builds, so the thenable adds no wait.

So the copies that the new React hands to SSR cost about 13% of throughput on this page. The remaining 3% was not isolated.
