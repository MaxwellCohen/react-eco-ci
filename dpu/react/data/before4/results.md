## Correctness (28 checks = 26 Preact-port + 2 React-only extras x-*; foreignObject isolated)

### chromium

| check | baseline<br>h=off | decl-native<br>h=off | decl-$RP (native off)<br>h=off | decl+polyfill (native off)<br>h=off | baseline<br>h=late | decl-native<br>h=late | decl-$RP (native off)<br>h=late | decl+polyfill (native off)<br>h=late |
|---|---|---|---|---|---|---|---|---|
| html-baseline | ok | ok | ok | ok | ok | ok | ok | ok |
| popcorning | ok | ok | ok | ok | ok | ok | ok | ok |
| nested | ok | ok | ok | ok | ok | ok | ok | ok |
| out-of-order | ok | ok | ok | ok | ok | ok | ok | ok |
| table-rows | ok | ok | ok | ok | ok | ok | ok | ok |
| select-options | ok | ok | ok | ok | ok | ok | ok | ok |
| list-items | ok | ok | ok | ok | ok | ok | ok | ok |
| svg-namespace | ok | ok | ok | ok | ok | ok | ok | ok |
| mathml-namespace | ok | ok | ok | ok | ok | ok | ok | ok |
| style-hoist | ok | ok | ok | ok | ok | ok | ok | ok |
| inline-script | ok | ok | ok | ok | ok | ok | ok | ok |
| empty | ok | ok | ok | ok | ok | ok | ok | ok |
| multi-root | ok | ok | ok | ok | ok | ok | ok | ok |
| text-only | ok | ok | ok | ok | ok | ok | ok | ok |
| nested-template | ok | ok | ok | ok | **FAIL** | **FAIL** | **FAIL** | **FAIL** |
| link-stylesheet | ok | ok | ok | ok | ok | ok | ok | ok |
| iframe-srcdoc | ok | ok | ok | ok | ok | ok | ok | ok |
| big-boundary | ok | ok | ok | ok | ok | ok | ok | ok |
| patch-interactive | ok | ok | ok | ok | ok | ok | ok | ok |
| client-wins | ok | ok | ok | ok | ok | ok | ok | ok |
| adjacent-boundaries | ok | ok | ok | ok | ok | ok | ok | ok |
| nested-inner-first | ok | ok | ok | ok | ok | ok | ok | ok |
| many-boundaries | ok | ok | ok | ok | ok | ok | ok | ok |
| zero-delay | ok | ok | ok | ok | ok | ok | ok | ok |
| deep-nesting | ok | ok | ok | ok | ok | ok | ok | ok |
| reverse-order | ok | ok | ok | ok | ok | ok | ok | ok |
| x-css-precedence | ok | ok | ok | ok | ok | ok | ok | ok |
| x-style-precedence | ok | ok | ok | ok | ok | ok | ok | ok |
| foreignObject (isolated) | ok | ok | ok | ok | ok | ok | ok | ok |
| passed | 28/28 | 28/28 | 28/28 | 28/28 | 27/28 | 27/28 | 27/28 | 27/28 |
| $RP calls / ids that still had template | 0/0 | 8/0 | 8/113 | 8/33 | 0/0 | 8/0 | 8/113 | 8/33 |
| leftover template[for] / fallbacks | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 |
| page errors / recoverable | 0/0 | 0/0 | 0/0 | 0/0 | 0/1 | 0/1 | 0/1 | 0/1 |

### firefox

| check | baseline<br>h=off | decl-$RP<br>h=off | decl+polyfill<br>h=off | baseline<br>h=late | decl-$RP<br>h=late | decl+polyfill<br>h=late |
|---|---|---|---|---|---|---|
| html-baseline | ok | ok | ok | ok | ok | ok |
| popcorning | ok | ok | ok | ok | ok | ok |
| nested | ok | ok | ok | ok | ok | ok |
| out-of-order | ok | ok | ok | ok | ok | ok |
| table-rows | ok | ok | ok | ok | ok | ok |
| select-options | ok | ok | ok | ok | ok | ok |
| list-items | ok | ok | ok | ok | ok | ok |
| svg-namespace | ok | ok | ok | ok | ok | ok |
| mathml-namespace | ok | ok | ok | ok | ok | ok |
| style-hoist | ok | ok | ok | ok | ok | ok |
| inline-script | ok | ok | ok | ok | ok | ok |
| empty | ok | ok | ok | ok | ok | ok |
| multi-root | ok | ok | ok | ok | ok | ok |
| text-only | ok | ok | ok | ok | ok | ok |
| nested-template | ok | ok | ok | **FAIL** | **FAIL** | **FAIL** |
| link-stylesheet | ok | ok | ok | ok | ok | ok |
| iframe-srcdoc | ok | ok | ok | ok | ok | ok |
| big-boundary | ok | ok | ok | ok | ok | ok |
| patch-interactive | ok | ok | ok | ok | ok | ok |
| client-wins | ok | ok | ok | ok | ok | ok |
| adjacent-boundaries | ok | ok | ok | ok | ok | ok |
| nested-inner-first | ok | ok | ok | ok | ok | ok |
| many-boundaries | ok | ok | ok | ok | ok | ok |
| zero-delay | ok | ok | ok | ok | ok | ok |
| deep-nesting | ok | ok | ok | ok | ok | ok |
| reverse-order | ok | ok | ok | ok | ok | ok |
| x-css-precedence | ok | ok | ok | ok | ok | ok |
| x-style-precedence | ok | ok | ok | ok | ok | ok |
| foreignObject (isolated) | ok | ok | ok | ok | ok | ok |
| passed | 28/28 | 28/28 | 28/28 | 27/28 | 27/28 | 27/28 |
| $RP calls / ids that still had template | 0/0 | 8/113 | 8/33 | 0/0 | 8/113 | 8/33 |
| leftover template[for] / fallbacks | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 |
| page errors / recoverable | 0/0 | 0/0 | 0/0 | 0/1 | 0/1 | 0/1 |

### webkit

| check | baseline<br>h=off | decl-$RP<br>h=off | decl+polyfill<br>h=off | baseline<br>h=late | decl-$RP<br>h=late | decl+polyfill<br>h=late |
|---|---|---|---|---|---|---|
| html-baseline | ok | ok | ok | ok | ok | ok |
| popcorning | ok | ok | ok | ok | ok | ok |
| nested | ok | ok | ok | ok | ok | ok |
| out-of-order | ok | ok | ok | ok | ok | ok |
| table-rows | ok | ok | ok | ok | ok | ok |
| select-options | ok | ok | ok | ok | ok | ok |
| list-items | ok | ok | ok | ok | ok | ok |
| svg-namespace | ok | ok | ok | ok | ok | ok |
| mathml-namespace | ok | ok | ok | ok | ok | ok |
| style-hoist | ok | ok | ok | ok | ok | ok |
| inline-script | ok | ok | ok | ok | ok | ok |
| empty | ok | ok | ok | ok | ok | ok |
| multi-root | ok | ok | ok | ok | ok | ok |
| text-only | ok | ok | ok | ok | ok | ok |
| nested-template | ok | ok | ok | **FAIL** | **FAIL** | **FAIL** |
| link-stylesheet | ok | ok | ok | ok | ok | ok |
| iframe-srcdoc | ok | ok | ok | ok | ok | ok |
| big-boundary | ok | ok | ok | ok | ok | ok |
| patch-interactive | ok | ok | ok | ok | ok | ok |
| client-wins | ok | ok | ok | ok | ok | ok |
| adjacent-boundaries | ok | ok | ok | ok | ok | ok |
| nested-inner-first | ok | ok | ok | ok | ok | ok |
| many-boundaries | ok | ok | ok | ok | ok | ok |
| zero-delay | ok | ok | ok | ok | ok | ok |
| deep-nesting | ok | ok | ok | ok | ok | ok |
| reverse-order | ok | ok | ok | ok | ok | ok |
| x-css-precedence | ok | ok | ok | ok | ok | ok |
| x-style-precedence | ok | ok | ok | ok | ok | ok |
| foreignObject (isolated) | ok | ok | ok | ok | ok | ok |
| passed | 28/28 | 28/28 | 28/28 | 27/28 | 27/28 | 27/28 |
| $RP calls / ids that still had template | 0/0 | 8/113 | 8/33 | 0/0 | 8/113 | 8/33 |
| leftover template[for] / fallbacks | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 |
| page errors / recoverable | 0/0 | 0/0 | 0/0 | 0/1 | 0/1 | 0/1 |

## Timing: popcorning (16) — median of runs (ms)

### chromium 156.0.8078.4 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 1 | 12 | 145 | 265 | 265 | 2306 | 9 | 0 | 0 |
| decl-native | 1 | 12 | 146 | 321 | 321 | 2303 | 10 | 0 | 0 |
| decl-native-b0 | 1 | 12 | 2 | 3 | 3 | 2263 | 10 | 0 | 0 |
| decl-$RP | 1 | 12 | 146 | 321 | 321 | 2303 | 10 | 0 | 0 |
| decl-$RP-b0 | 1 | 12 | 2 | 3 | 3 | 2263 | 9 | 0 | 0 |
| decl+polyfill | 1 | 16 | 146 | 321 | 321 | 2302 | 10 | 0 | 0 |
| decl+polyfill-b0 | 1 | 12 | 3 | 3 | 3 | 2264 | 9 | 0 | 0 |

### firefox 157.0 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 1 | 25 | 132 | 252 | 252 | 2301 | 6 | 0 | 0 |
| decl-$RP | 2 | 25 | 146 | 321 | 321 | 2303 | 5 | 0 | 0 |
| decl-$RP-b0 | 1 | 25 | 2 | 4 | 4 | 2264 | 6 | 0 | 0 |
| decl+polyfill | 1 | 31 | 148 | 322 | 322 | 2303 | 6 | 0 | 0 |
| decl+polyfill-b0 | 1 | 27 | 2 | 3 | 3 | 2263 | 5 | 0 | 0 |

### webkit 27.2 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 2273 | 128 | 248 | 248 | 2301 | 6 | 0 | 0 |
| decl-$RP | 2 | 2329 | 147 | 323 | 323 | 2305 | 6 | 0 | 0 |
| decl-$RP-b0 | 2 | 2279 | 2 | 5 | 5 | 2264 | 6 | 0 | 0 |
| decl+polyfill | 2 | 2329 | 147 | 322 | 322 | 2305 | 6 | 0 | 0 |
| decl+polyfill-b0 | 2 | 2274 | 2 | 4 | 4 | 2264 | 6 | 0 | 0 |

## Timing: many-boundaries (60) — median of runs (ms)

### chromium 156.0.8078.4 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 12 | 140 | 299 | 320 | 1541 | 9 | 0 | 0 |
| decl-native | 1 | 12 | 177 | 302 | 302 | 1824 | 9 | 0 | 0 |
| decl-native-b0 | 1 | 12 | 2 | 3 | 3 | 1523 | 9 | 0 | 0 |
| decl-$RP | 1 | 12 | 178 | 302 | 303 | 1825 | 9 | 0 | 0 |
| decl-$RP-b0 | 2 | 12 | 2 | 2 | 3 | 1523 | 9 | 0 | 0 |
| decl+polyfill | 2 | 16 | 123 | 302 | 303 | 1824 | 9 | 0 | 0 |
| decl+polyfill-b0 | 1 | 16 | 2 | 3 | 3 | 1524 | 9 | 0 | 0 |

### firefox 157.0 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 26 | 170 | 299 | 302 | 1819 | 5 | 0 | 0 |
| decl-$RP | 2 | 22 | 179 | 303 | 303 | 1824 | 5 | 0 | 0 |
| decl-$RP-b0 | 2 | 26 | 2 | 2 | 3 | 1522 | 5 | 0 | 0 |
| decl+polyfill | 2 | 23 | 180 | 302 | 303 | 1825 | 6 | 0 | 0 |
| decl+polyfill-b0 | 2 | 33 | 2 | 3 | 3 | 1524 | 6 | 0 | 0 |

### webkit 27.2 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 1532 | 172 | 294 | 299 | 1816 | 6 | 0 | 0 |
| decl-$RP | 2 | 1841 | 125 | 301 | 303 | 1825 | 6 | 0 | 0 |
| decl-$RP-b0 | 3 | 1541 | 2 | 3 | 4 | 1524 | 6 | 0 | 0 |
| decl+polyfill | 2 | 1549 | 127 | 303 | 303 | 1530 | 6 | 0 | 0 |
| decl+polyfill-b0 | 2 | 1536 | 3 | 3 | 4 | 1525 | 6 | 0 | 0 |

## Timing: grid-100 (100) — median of runs (ms)

### chromium 156.0.8078.4 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 12 | 109 | 221 | 221 | 623 | 16 | 0 | 0 |
| decl-native | 2 | 12 | 118 | 218 | 218 | 620 | 10 | 0 | 0 |
| decl-native-b0 | 2 | 12 | 2 | 3 | 3 | 604 | 16 | 0 | 0 |
| decl-$RP | 2 | 12 | 119 | 219 | 219 | 622 | 9 | 0 | 0 |
| decl-$RP-b0 | 2 | 12 | 2 | 4 | 4 | 604 | 16 | 0 | 0 |
| decl+polyfill | 2 | 16 | 121 | 221 | 224 | 623 | 9 | 0 | 0 |
| decl+polyfill-b0 | 2 | 16 | 2 | 6 | 6 | 604 | 18 | 0 | 0 |

### firefox 157.0 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 20 | 119 | 220 | 220 | 621 | 5 | 0 | 0 |
| decl-$RP | 2 | 21 | 118 | 220 | 220 | 621 | 5 | 0 | 0 |
| decl-$RP-b0 | 2 | 21 | 2 | 6 | 6 | 603 | 5 | 0 | 0 |
| decl+polyfill | 2 | 29 | 121 | 221 | 224 | 623 | 5 | 0 | 0 |
| decl+polyfill-b0 | 2 | 32 | 2 | 9 | 9 | 604 | 5 | 0 | 0 |

### webkit 27.2 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 319 | 116 | 222 | 222 | 624 | 6 | 0 | 0 |
| decl-$RP | 2 | 322 | 120 | 222 | 222 | 624 | 6 | 0 | 0 |
| decl-$RP-b0 | 2 | 304 | 2 | 3 | 3 | 603 | 6 | 0 | 0 |
| decl+polyfill | 2 | 326 | 119 | 220 | 223 | 622 | 8 | 0 | 0 |
| decl+polyfill-b0 | 2 | 305 | 4 | 5 | 5 | 606 | 6 | 0 | 0 |

## patch-interactive: gap between patched counter visible and first click registering (median ms)

### chromium

| variant | hydrate | visible at | gap | never interactive |
|---|---|---|---|---|
| baseline | late | 405 | 21 | 0/5 |
| baseline | early | 405 | 13 | 0/5 |
| decl-native | late | 404 | 21 | 0/5 |
| decl-native | early | 404 | 12 | 0/5 |
| decl-native-b0 | late | 403 | 22 | 0/5 |
| decl-native-b0 | early | 404 | 14 | 0/5 |
| decl-$RP | late | 404 | 22 | 0/5 |
| decl-$RP | early | 404 | 12 | 0/5 |
| decl-$RP-b0 | late | 404 | 21 | 0/5 |
| decl-$RP-b0 | early | 404 | 12 | 0/5 |
| decl+polyfill | late | 404 | 20 | 0/5 |
| decl+polyfill | early | 404 | 12 | 0/5 |
| decl+polyfill-b0 | late | 404 | 21 | 0/5 |
| decl+polyfill-b0 | early | 405 | 12 | 0/5 |

### firefox

| variant | hydrate | visible at | gap | never interactive |
|---|---|---|---|---|
| baseline | late | 407 | 21 | 0/5 |
| baseline | early | 404 | 19 | 0/5 |
| decl-$RP | late | 404 | 20 | 0/5 |
| decl-$RP | early | 404 | 16 | 0/5 |
| decl-$RP-b0 | late | 404 | 20 | 0/5 |
| decl-$RP-b0 | early | 404 | 15 | 0/5 |
| decl+polyfill | late | 403 | 17 | 0/5 |
| decl+polyfill | early | 404 | 16 | 0/5 |
| decl+polyfill-b0 | late | 405 | 21 | 0/5 |
| decl+polyfill-b0 | early | 405 | 20 | 0/5 |

### webkit

| variant | hydrate | visible at | gap | never interactive |
|---|---|---|---|---|
| baseline | late | 416 | 13 | 0/5 |
| baseline | early | 406 | 23 | 0/5 |
| decl-$RP | late | 406 | 28 | 0/5 |
| decl-$RP | early | 408 | 31 | 0/5 |
| decl-$RP-b0 | late | 405 | 25 | 0/5 |
| decl-$RP-b0 | early | 405 | 26 | 0/5 |
| decl+polyfill | late | 405 | 22 | 0/5 |
| decl+polyfill | early | 406 | 24 | 0/5 |
| decl+polyfill-b0 | late | 405 | 30 | 0/5 |
| decl+polyfill-b0 | early | 406 | 23 | 0/5 |

