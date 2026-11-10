## Timing (median of 5 runs per cell, deployed Workers, ms)

Patch lag = time a boundary became visible − (responseStart + its server delay). Lower is better; it isolates the cost of getting a resolved boundary onto the screen. Scenario `popcorning` = 16 boundaries, `many-boundaries` = 60, `grid-100` = 100.

### popcorning (16)

| browser | variant | TTFB | FCP | LCP | patch lag median | patch lag p95 | patch lag max | last visible | longest stall | long-task total | boundaries never shown |
|---|---|---|---|---|---|---|---|---|---|---|---|
| chromium | baseline | 136 | 160 | 160 | -2 | 14 | 14 | 2378 | 9 | 0 | 0 |
| chromium | dpu-support | 141 | 172 | 172 | -2 | 45 | 45 | 2398 | 9 | 0 | 0 |
| chromium | dpu-support-react-style | 134 | 156 | 156 | -0 | 19 | 19 | 2394 | 9 | 0 | 0 |
| firefox | baseline | 112 | 146 | 146 | 25 | 37 | 37 | 2380 | 58 | n/a | 0 |
| firefox | dpu-support | 110 | 145 | 145 | 11 | 20 | 20 | 2370 | 124 | n/a | 0 |
| firefox | dpu-support-react-style | 99 | 141 | 141 | -2 | 11 | 11 | 2355 | 12 | n/a | 0 |
| webkit | baseline | 106 | 123 | 136 | -4 | 3 | 3 | 2367 | 3 | n/a | 0 |
| webkit | dpu-support | 118 | 145 | 155 | -3 | 30 | 30 | 2381 | 4 | n/a | 0 |
| webkit | dpu-support-react-style | 94 | 115 | 123 | 1 | 30 | 30 | 2355 | 3 | n/a | 0 |

### many-boundaries (60)

| browser | variant | TTFB | FCP | LCP | patch lag median | patch lag p95 | patch lag max | last visible | longest stall | long-task total | boundaries never shown |
|---|---|---|---|---|---|---|---|---|---|---|---|
| chromium | baseline | 100 | 128 | 128 | -1 | 17 | 21 | 1635 | 9 | 0 | 0 |
| chromium | dpu-support | 111 | 136 | 136 | 0 | 7 | 14 | 1629 | 9 | 0 | 0 |
| chromium | dpu-support-react-style | 125 | 152 | 152 | 1 | 10 | 16 | 1645 | 9 | 0 | 0 |
| firefox | baseline | 117 | 143 | 143 | 22 | 32 | 47 | 1645 | 10 | n/a | 0 |
| firefox | dpu-support | 121 | 163 | 163 | 12 | 21 | 27 | 1639 | 12 | n/a | 0 |
| firefox | dpu-support-react-style | 98 | 135 | 135 | 1 | 9 | 15 | 1624 | 4 | n/a | 0 |
| webkit | baseline | 96 | 133 | 148 | 4 | 17 | 27 | 1621 | 8 | n/a | 0 |
| webkit | dpu-support | 129 | 146 | 156 | -3 | 7 | 28 | 1646 | 7 | n/a | 0 |
| webkit | dpu-support-react-style | 136 | 154 | 163 | 1 | 10 | 13 | 1650 | 9 | n/a | 0 |

### grid-100 (100)

| browser | variant | TTFB | FCP | LCP | patch lag median | patch lag p95 | patch lag max | last visible | longest stall | long-task total | boundaries never shown |
|---|---|---|---|---|---|---|---|---|---|---|---|
| chromium | baseline | 129 | 156 | 156 | 7 | 13 | 22 | 739 | 9 | 0 | 0 |
| chromium | dpu-support | 133 | 160 | 160 | 0 | 10 | 10 | 739 | 9 | 0 | 0 |
| chromium | dpu-support-react-style | 105 | 132 | 132 | 5 | 15 | 17 | 710 | 9 | 0 | 0 |
| firefox | baseline | 106 | 160 | 160 | 28 | 34 | 36 | 743 | 5 | n/a | 0 |
| firefox | dpu-support | 97 | 134 | 134 | 17 | 30 | 34 | 707 | 5 | n/a | 0 |
| firefox | dpu-support-react-style | 114 | 143 | 143 | 6 | 18 | 21 | 730 | 4 | n/a | 0 |
| webkit | baseline | 123 | 144 | 152 | 10 | 30 | 33 | 752 | 12 | n/a | 0 |
| webkit | dpu-support | 122 | 143 | 152 | 6 | 10 | 10 | 727 | 4 | n/a | 0 |
| webkit | dpu-support-react-style | 115 | 139 | 148 | 11 | 26 | 32 | 733 | 14 | n/a | 0 |

## Patched content → interactive (`/s/patch-interactive`)

Gap between the patched counter becoming visible and the first click registering (ms). Includes hydration start mode: `late` = client script runs after the stream ends, `early` = async script mid-stream.

| browser | variant | hydrate | visible at | interactive at | gap (median) | runs never interactive |
|---|---|---|---|---|---|---|
| chromium | baseline | late | 525 | 634 | 103 | 0/5 |
| chromium | baseline | early | 230 | 241 | 13 | 0/5 |
| chromium | dpu-support | late | 530 | 613 | 90 | 0/5 |
| chromium | dpu-support | early | 198 | 210 | 11 | 0/5 |
| chromium | dpu-support-react-style | late | 528 | 631 | 106 | 0/5 |
| chromium | dpu-support-react-style | early | 221 | 234 | 17 | 0/5 |
| firefox | baseline | late | 527 | 624 | 102 | 0/5 |
| firefox | baseline | early | 206 | 216 | 12 | 0/5 |
| firefox | dpu-support | late | 532 | 611 | 81 | 0/5 |
| firefox | dpu-support | early | 205 | 219 | 15 | 0/5 |
| firefox | dpu-support-react-style | late | 516 | 640 | 121 | 0/5 |
| firefox | dpu-support-react-style | early | 201 | 217 | 13 | 0/5 |
| webkit | baseline | late | 497 | 605 | 106 | 0/5 |
| webkit | baseline | early | 243 | 256 | 14 | 0/5 |
| webkit | dpu-support | late | 490 | 606 | 114 | 0/5 |
| webkit | dpu-support | early | 204 | 222 | 15 | 0/5 |
| webkit | dpu-support-react-style | late | 514 | 630 | 104 | 0/5 |
| webkit | dpu-support-react-style | early | 208 | 221 | 14 | 0/5 |

## Strict CSP (`script-src 'self' 'nonce-…'`, stream's inline scripts have no nonce)

| browser | variant | template[for] left unapplied | fallbacks left on screen |
|---|---|---|---|
| chromium | baseline | 0 | 16 |
| chromium | dpu-support | 0 | 0 |
| chromium | dpu-support-react-style | 0 | 0 |
| firefox | baseline | 0 | 16 |
| firefox | dpu-support | 112 | 10 |
| firefox | dpu-support-react-style | 112 | 10 |
| webkit | baseline | 0 | 16 |
| webkit | dpu-support | 112 | 10 |
| webkit | dpu-support-react-style | 112 | 10 |

## Payload (bytes; gzip/brotli are estimated by compressing the decoded stream locally, not measured on the wire)

| page | boundaries | variant | raw | gzip | brotli | inline script bytes |
|---|---|---|---|---|---|---|
| zero | 0 | baseline | 17472 | 5273 | 4415 | 775 |
| zero | 0 | dpu-support | 17516 | 5298 | 4433 | 798 |
| zero | 0 | dpu-support-react-style | 17576 | 5306 | 4449 | 822 |
| one | 1 | baseline | 18791 | 5864 | 4950 | 1946 |
| one | 1 | dpu-support | 18706 | 5892 | 4991 | 1857 |
| one | 1 | dpu-support-react-style | 18459 | 5774 | 4893 | 1574 |
| popcorn | 16 | baseline | 21172 | 6141 | 5151 | 1943 |
| popcorn | 16 | dpu-support | 21105 | 6222 | 5221 | 1854 |
| popcorn | 16 | dpu-support-react-style | 21293 | 6164 | 5144 | 2006 |
| many | 60 | baseline | 26486 | 6839 | 5471 | 1948 |
| many | 60 | dpu-support | 26507 | 7062 | 5508 | 1859 |
| many | 60 | dpu-support-react-style | 27971 | 7154 | 5479 | 3287 |
| grid | 100 | baseline | 30142 | 7367 | 5632 | 1941 |
| grid | 100 | dpu-support | 30214 | 7680 | 5797 | 1852 |
| grid | 100 | dpu-support-react-style | 32410 | 7851 | 5836 | 4012 |
| big | 1 | baseline | 34736 | 9306 | 5998 | 1945 |
| big | 1 | dpu-support | 34651 | 9333 | 6036 | 1856 |
| big | 1 | dpu-support-react-style | 34405 | 9212 | 5963 | 1574 |

### Projection: end stamp as a single newline instead of `<!--$p:id-->` (variants that emit stamps only; string substitution on the real output, NOT a working implementation, no behavior/timing measured)

| page | boundaries | variant | stamps | raw | raw if newline | gzip | gzip if newline | brotli | brotli if newline |
|---|---|---|---|---|---|---|---|---|---|

### Overhead model (raw bytes)

Fixed = bytes added once a page has ≥1 boundary (init script/CE) = `one − zero` minus that boundary's own content. Per-boundary = slope between 16, 60 and 100 boundaries.

| variant | one boundary − zero | per boundary (16→100) | per boundary gzip (16→100) |
|---|---|---|---|
| baseline | 1319 | 106.8 | 14.6 |
| dpu-support | 1190 | 108.4 | 17.4 |
| dpu-support-react-style | 883 | 132.3 | 20.1 |

## Correctness, hydrate=off (stream + polyfill/native only, no client JS) — `/dpu`, 26 checks + isolated foreignObject page

| variant | chromium | firefox | webkit | foreignObject page (C/F/W) |
|---|---|---|---|---|
| baseline | 23/26 | 23/26 | 23/26 | ok / ok / ok |
| dpu-support | 26/26 | 26/26 | 26/26 | ok / ok / ok |
| dpu-support-react-style | 26/26 | 26/26 | 26/26 | ok / ok / ok |

Failing checks: **table-rows** (baseline/chromium, baseline/firefox, baseline/webkit); **svg-namespace** (baseline/chromium, baseline/firefox, baseline/webkit); **mathml-namespace** (baseline/chromium, baseline/firefox, baseline/webkit)

## Correctness, hydrate=late (after client hydration; hydration can mask a failed patch) — `/dpu`, 26 checks + isolated foreignObject page

| variant | chromium | firefox | webkit | foreignObject page (C/F/W) |
|---|---|---|---|---|
| baseline | 24/26 | 24/26 | 24/26 | ok / ok / ok |
| dpu-support | 26/26 | 26/26 | 26/26 | ok / ok / ok |
| dpu-support-react-style | 26/26 | 26/26 | 26/26 | ok / ok / ok |

Failing checks: **svg-namespace** (baseline/chromium, baseline/firefox, baseline/webkit); **mathml-namespace** (baseline/chromium, baseline/firefox, baseline/webkit)
