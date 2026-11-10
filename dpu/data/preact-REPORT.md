# Preact streaming: DPU design comparison

Evidence for choosing how `preact-render-to-string` should stream Suspense completions with
[Declarative Partial Updates](https://developer.chrome.com/blog/declarative-partial-updates) (DPU).
Everything here is reproducible from this repo (except the two `local-*` variants, which are built from unpushed local commits); full tables are in [`results/DATA.md`](./results/DATA.md).

> **Made with LLMs.** The test pages, scripts, measurements harness and this write-up were produced with
> Claude (Anthropic) via Claude Code, directed by the repo owner. Expectations encoded in the scenarios are
> proposals to review, not ground truth. Statements marked *hypothesis* are unverified.

## What was compared

| variant | `preact-render-to-string` | completion format |
|---|---|---|
| `baseline` (= `main`) | upstream `main` `dc7d06b` | `<preact-island>` custom element + inline client script |
| `pr474` | [PR #474](https://github.com/preactjs/preact-render-to-string/pull/474) head `6a02913` | `<template for>` + `<?start>/<?end>` markers, MutationObserver polyfill |
| `local-end-stamp` | local `dpu-end-stamp` `3fb6f11` (**unpushed**; rebased on current `main`, not stacked on the PR branch) | `<template for>` + `<!--$p:id-->` end stamp, hydration + SVG handling |
| `local-react-style` | local `dpu-support-react-style` `c1cdbac` (**unpushed**, differs from the pushed commit) | `<template for>` + `<script>$RC("id")</script>` per chunk, one `window.$RC` init script |

All use the same `preact` (`MaxwellCohen/preact` `main` `921df34`) and the same demo app, deployed as separate
Cloudflare Workers. A control (upstream `main` + the fork's `preact`) matched `baseline` on every correctness check,
so differences come from the `preact-render-to-string` change.

## main vs #474 vs #490 (`c1d0a66` / `44c96f0`)

Interleaved, 5 iterations/cell, deployed Workers. Correctness (26 checks × 3 browsers): main 23/26 (stream only) and 24/26 (after hydration); #474 and #490 26/26 in both, `foreignObject` ok everywhere.

| | main | #474 | #490 |
|---|---|---|---|
| Patch lag Chromium 16/60/100 bnd (ms) | -2 / 0 / 7 | -2 / 0 / 0 | 0 / 1 / 5 |
| Patch lag Firefox (ms) | 25 / 22 / 28 | 11 / 12 / 17 | -2 / 1 / 6 |
| Patch lag WebKit (ms) | -4 / 4 / 10 | -3 / -3 / 6 | 1 / 1 / 11 |
| Boundaries never shown | 0 | 0 | 0 |
| Patched→interactive, client script after stream (C/F/W, ms) | 103 / 102 / 106 | 90 / 81 / 114 | 106 / 121 / 104 |
| Same, mid-stream | 12 / 12 / 14 | 11 / 15 / 15 | 16 / 13 / 14 |
| Longest stall, any cell (ms) *(single outliers; noisy)* | 956 | 158 | 46 |
| Strict CSP templates unapplied (C/F/W) | 0 / 0 / 0 (fallbacks stay) | 0 / 112 / 112 | 0 / 112 / 112 |
| Fixed overhead, first boundary (raw B) | 1319 | 1190 | **883** |
| Per boundary raw / gzip / brotli (B, est.) | 106.8 / 14.6 / 5.7 | 108.4 / 17.4 / 6.9 | 132.3 / 20.1 / 8.2 |
| 60 / 100-boundary page gzip (B, est.) | 6839 / 7367 | 7062 / 7680 | 7154 / 7851 |

#490 costs ≈ +5.5 gzip B per boundary vs main but 436 B less raw once per page; #474 ≈ +2.8 B. Timing differences are small
and within noise except Firefox patch lag, where both DPU PRs are lower than main.

## `main` vs `dpu-support` (`c1d0a66`; PR #474 head `e1e62e6` has the same code)

Interleaved runs, 5 iterations per cell, deployed Workers. Lag = patch visible − (responseStart + server delay), medians for 16 / 60 / 100 boundaries.

| | main | dpu-support |
|---|---|---|
| Correct DOM, stream only (`hydrate=off`), 26 checks × 3 browsers | 23/26 (`table-rows`, `svg-namespace`, `mathml-namespace`) | **26/26** |
| Correct DOM after hydration (`hydrate=late`) | 24/26 (`svg-namespace`, `mathml-namespace`) | **26/26** |
| `<svg><foreignObject>` page / boundaries never shown | ok / 0 | ok / 0 |
| Patch lag, Chromium (ms) | −8 / −3 / 6 | −4 / −1 / 4 |
| Patch lag, Firefox (ms) | 31 / 30 / 23 | **10 / 15 / 15** |
| Patch lag, WebKit (ms) | −3 / 1 / 19 | −2 / −1 / 1 |
| Patched content → interactive, client script after stream (Chromium / Firefox / WebKit, ms) | 124 / 97 / 97 | 102 / 125 / 137 |
| Same, client script mid-stream | 11 / 15 / 13 | 10 / 15 / 15 |
| Longest main-thread stall in any timing cell | 68 ms | 35 ms |
| Fixed overhead, first boundary (raw) | 1319 B | **1190 B** |
| Per boundary raw / gzip / brotli (est.) | 106.8 / 14.6 / 5.7 B | 108.4 / 17.4 / 6.9 B |
| 60-boundary page, gzip (est.) | 6839 B | 7062 B (+3.3%) |
| Strict CSP (inline scripts without nonce) | fallbacks stay in all 3 browsers | works in Chromium; Firefox/WebKit leave 112 templates unapplied |

Reading it: `dpu-support` fixes the table-row and namespace failures of `main`, has no timing penalty (lower lag in
Firefox, equal elsewhere), costs ≈ +2.8 gzip bytes per boundary but ≈ 130 B less once per page. One watch item: in
Firefox and WebKit the patched counter becomes clickable 28–40 ms later than on `main` when the client script loads
after the stream (spread across the 5 runs was not analysed, so treat differences of this size with caution).
Wire table for the PR description (id=5, no nonce, content excluded): main 1273 B → 1142 B for one boundary,
2056 B → 1916 B for ten.

## All variants

### Headline results

| question | main | PR #474 | local end-stamp | local react-style |
|---|---|---|---|---|
| Correct final DOM, stream only (`hydrate=off`), 26 checks × 3 browsers | 23/26 | 26/26 | 26/26 | 26/26 |
| What `main` fails | `table-rows`, `svg-namespace`, `mathml-namespace` | – | – | – |
| `<svg><foreignObject>` boundary | ok | **hangs the main thread (all 3 browsers)** | ok | ok |
| Last-resolving boundary shown when hydration starts right after the stream (Firefox, WebKit) | ok | **lost in every run** (cell 8 of 16; cell 97 of 100) | ok | ok |
| Patch lag in Firefox (median over 16/60/100 boundaries) | 21–34 ms | 13–134 ms (includes the lost boundary) | 9–14 ms | −7…4 ms |
| Patch lag in Chromium / WebKit | ≈0–10 ms | ≈0–10 ms (WebKit: lost boundary) | ≈0–5 ms | ≈0–11 ms |
| Fixed overhead, first boundary (raw) | 1319 B | 1274 B | 1385 B | **880 B** |
| Per boundary, raw / gzip (est.) | 106.8 / 14.6 B | 107.6 / 17.3 B | 119.1 / 20.0 B | 131.5 / 19.7 B |
| Strict CSP, Chromium | fallbacks stay | works (native) | works (native) | works (native) |
| Strict CSP, Firefox / WebKit | fallbacks stay | 112 templates unapplied | 112 unapplied | 112 unapplied |
| Page errors / main-thread stalls >50 ms | none | none (except the hang above) | none | none |

### What the data supports

1. **Any DPU variant fixes real `main` problems.** Without client JS, `main` also fails `table-rows` (rows inserted
   into a `<tbody>`), and puts SVG/MathML boundaries in the HTML namespace. Hydration masks `table-rows` but not the
   namespace cases.
2. **PR #474 as opened has two defects the local end-stamp work resolves**, both reproducible on the live pages:
   (a) a boundary inside `<svg><foreignObject>` freezes the page in Chromium, Firefox and WebKit; (b) in Firefox and
   WebKit the last streamed boundary is missing when hydration runs right after the stream ends. It applies fine with
   `hydrate=off`, so this looks like a race between the final patch and hydration/observer teardown *(hypothesis; not
   root-caused)*.
3. **No timing penalty otherwise.** Patch lag for `local-end-stamp` and `local-react-style` is at or below `main` in
   every browser (interleaved runs, 5 per cell). Differences under ~16 ms are noise.
4. **Payload cost is small:** +3 to +6 B gzip per boundary vs `main`. `local-react-style` has the smallest fixed cost
   but the largest per-boundary raw cost (extra `<script>` per chunk).
5. **Strict CSP is unsolved by all of them** in browsers without native DPU (Firefox, WebKit here): inline scripts
   carry no nonce.

### Why `main` compresses better: the boundary id is written more times

Boundary ids are unique numbers (`-51`, `-55`, …), and gzip cannot predict them. Measured on the 60-boundary page with
ids normalised (gzip level 9, bytes per boundary):

| variant | id written N× per boundary | first occurrence | each repeat | other markup | total gzip |
|---|---|---|---|---|---|
| main | 3 (`$s:` open, `/$s:` close, `data-target`) | 3.0 | 2.9 | 27.5 | 36.2 |
| PR #474 | 4 (+ `<?start name="id">`) | 2.8 | 2.9 | 28.9 | 40.4 |
| local end-stamp | 5 (+ `name`, + `$p:id` stamp) | 2.9 | 2.9 | 30.9 | 45.4 |
| local react-style | 5 (+ `name`, + `$RC("id")`) | 2.9 | 2.8 | 26.3 | 40.4 |

Every extra copy of an id costs ≈2.9 gzip bytes (a back-reference token), so the id count explains most of the gap:
PR #474 = one extra id (+2.9) + 1.4 markup; end-stamp = two extra ids (+5.8) + 3.4 markup; react-style = two extra ids
(+5.5) − 1.2 markup. Brotli narrows the gap (5.7 vs 6.8 / 7.8 / 7.7 B per boundary).
The ids are repeated because the output carries two marker systems: the `<!--$s:id-->` comments (polyfill/hydration)
and `<?start name="id">` (the DPU range marker) — *hypothesis:* the PI is needed for native DPU, the comments for the
polyfill and hydration. If so, dropping the stamp id (newline stamp) takes an end-stamp page back to 4 id copies, and
removing either marker system would return it to `main`'s 3.

### The end stamp and "just use a newline"

Measured on the real `local-end-stamp` output (60 boundaries, gzip level 9): the current `<!--$p:-19321-->` stamp
costs 16 raw / 3.55 gzip bytes per boundary; a single `\n` costs 1 raw / 0.12 gzip; no stamp costs 0. The comment's
gzip cost is almost entirely the unique id (constant id ⇒ 0.32 B). So a newline would save ≈15 raw / ≈3.4 gzip bytes
per boundary (≈780 B raw, ≈200 B gzip on 60 boundaries; ≈1.1 KB raw, ≈300 B gzip on 85 stamps in the 100-cell page).
**Caveat:** the stamp's id is what ties it to a boundary. A bare newline carries no id, so the client would have to
infer the boundary by position. That has not been built or tested; this is a size projection only.

### Where the designs differ (from the emitted HTML, not benchmarks)

- **Trigger.** PR #474 / end-stamp: one `MutationObserver`; react-style: an explicit `$RC(id)` call per chunk, the
  script removes itself after running.
- **Per-chunk markup.** react-style adds a `<script>` per chunk; end-stamp adds a comment.
- **Global.** react-style defines `window.$RC` *(hypothesis: collides with React Fizz's global on mixed pages; untested)*.
- **Observability.** `$RC` lets the harness see per chunk whether the browser already consumed the template natively.

## Method

- Variants are pinned in [`versions.json`](./versions.json) (+ untracked `versions.local.json` for local checkouts) and
  built by `scripts/build-variant.mjs` (read-only clones, pack, build). Same demo app for every variant.
- **Correctness** (`scripts/compare.mjs`, `HYDRATE=off|late`): 26 checks on `/dpu` (14 s settle) plus an isolated
  `foreignObject` page, in Playwright Chromium, Firefox and WebKit. `hydrate=off` judges the stream/polyfill alone;
  `late` runs after client hydration and can hide a failed patch.
- **Timing** (`scripts/bench.mjs`): 5 iterations; each iteration visits every variant in a fresh random order
  (interleaved, fixes the order confound of the first report). *Patch lag* = visible − (responseStart + server delay),
  observed via MutationObserver plus a 16 ms layout scan. Scenarios: popcorning (16), many-boundaries (60), grid-100
  (100), and patched-counter interactivity with hydration `late`/`early`.
- **Payload** (`scripts/size.mjs`): raw bytes; gzip/brotli are **estimates** (decoded stream compressed locally).
- **CSP**: `?csp=strict` → `script-src 'self' 'nonce-…'`, nonces only on harness scripts.

## Limitations

- One machine/network/day. Timing resolution ≈16 ms. Chromium handled `<template for>` natively (native path);
  Firefox/WebKit exercised the polyfills.
- Not measured: low-end CPU/memory, throttled networks, real wire compression, >100 boundaries, bfcache, buffering
  proxies, intermediate visual states.
- `local-*` variants are unpushed commits; SHAs are recorded above and in each page's `/index.json`. To reproduce,
  push those commits (or point `versions.local.json` at your checkout).
- The cause of the PR #474 last-boundary loss and of the `foreignObject` hang were not investigated beyond isolating
  them to the stream format/polyfill; both are reproducible with `/s/popcorning` (Firefox/WebKit) and
  `/s/foreign-object`.

## Reproduce

```bash
npm install
node scripts/build-variant.mjs <variant> && (cd .build/<variant> && npx wrangler deploy)
HYDRATE=off node scripts/compare.mjs <variants…>   # also HYDRATE=late
node scripts/bench.mjs chromium 5                   # also firefox, webkit
node scripts/size.mjs <variants…> && node scripts/report.mjs
node scripts/build-index.mjs && (cd .build/index && npx wrangler deploy)   # landing page
```

Live pages per variant: `/` (54 scenarios + selection controls), `/dpu` (diagnostics), `/dpu?csp=strict`,
`/s/<id>`, `/index.json`. Landing page: https://preact-eco-index.to-email-max.workers.dev

## Decision guide (interpretation)

- Parity with the DPU spec and no hangs: `local-end-stamp` and `local-react-style` meet it equally; PR #474 as opened does not.
- Smallest per-boundary cost: end-stamp (comment, or a newline if id-less matching proves feasible).
- Smallest fixed cost, explicit control flow, per-chunk observability: react-style.
- Strict-CSP sites: none is sufficient in non-native browsers; a nonce hook or non-inline fallback is separate work.
