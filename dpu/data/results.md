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
| baseline | 2 | 16 | 145 | 265 | 265 | 2306 | 9 | 0 | 0 |
| decl-native | 2 | 16 | 146 | 321 | 321 | 2303 | 10 | 0 | 0 |
| decl-native-b0 | 2 | 16 | 2 | 5 | 5 | 2263 | 9 | 0 | 0 |
| decl-$RP | 2 | 12 | 146 | 322 | 322 | 2303 | 11 | 0 | 0 |
| decl-$RP-b0 | 2 | 16 | 2 | 2 | 2 | 2264 | 9 | 0 | 0 |
| decl+polyfill | 2 | 16 | 145 | 321 | 321 | 2303 | 12 | 0 | 0 |
| decl+polyfill-b0 | 2 | 16 | 2 | 4 | 4 | 2264 | 9 | 0 | 0 |

### firefox 157.0 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 27 | 130 | 251 | 251 | 2301 | 9 | 0 | 0 |
| decl-$RP | 2 | 26 | 146 | 321 | 321 | 2303 | 6 | 0 | 0 |
| decl-$RP-b0 | 1 | 25 | 3 | 5 | 5 | 2265 | 5 | 0 | 0 |
| decl+polyfill | 2 | 29 | 146 | 322 | 322 | 2303 | 8 | 0 | 0 |
| decl+polyfill-b0 | 2 | 29 | 2 | 3 | 3 | 2265 | 6 | 0 | 0 |

### webkit 27.2 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 4 | 2274 | 124 | 244 | 244 | 2301 | 5 | 0 | 0 |
| decl-$RP | 6 | 2324 | 148 | 321 | 321 | 2309 | 5 | 0 | 0 |
| decl-$RP-b0 | 3 | 2283 | 2 | 5 | 5 | 2268 | 5 | 0 | 0 |
| decl+polyfill | 2 | 2330 | 147 | 322 | 322 | 2304 | 6 | 0 | 0 |
| decl+polyfill-b0 | 4 | 2280 | 2 | 6 | 6 | 2267 | 6 | 0 | 0 |

## Timing: many-boundaries (60) — median of runs (ms)

### chromium 156.0.8078.4 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 16 | 125 | 296 | 305 | 1543 | 9 | 0 | 0 |
| decl-native | 2 | 12 | 178 | 302 | 303 | 1824 | 9 | 0 | 0 |
| decl-native-b0 | 2 | 12 | 2 | 2 | 2 | 1523 | 9 | 0 | 0 |
| decl-$RP | 2 | 16 | 178 | 302 | 302 | 1824 | 9 | 0 | 0 |
| decl-$RP-b0 | 2 | 16 | 2 | 3 | 3 | 1523 | 9 | 0 | 0 |
| decl+polyfill | 2 | 16 | 178 | 303 | 304 | 1821 | 9 | 0 | 0 |
| decl+polyfill-b0 | 2 | 16 | 1 | 2 | 3 | 1524 | 9 | 0 | 0 |

### firefox 157.0 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 24 | 168 | 303 | 307 | 1546 | 13 | 0 | 0 |
| decl-$RP | 2 | 21 | 124 | 301 | 303 | 1528 | 5 | 0 | 0 |
| decl-$RP-b0 | 2 | 25 | 2 | 3 | 3 | 1524 | 5 | 0 | 0 |
| decl+polyfill | 4 | 69 | 125 | 303 | 303 | 1824 | 10 | 0 | 0 |
| decl+polyfill-b0 | 3 | 35 | 2 | 4 | 7 | 1525 | 6 | 0 | 0 |

### webkit 27.2 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 1536 | 123 | 297 | 301 | 1820 | 5 | 0 | 0 |
| decl-$RP | 4 | 1541 | 123 | 302 | 303 | 1531 | 5 | 0 | 0 |
| decl-$RP-b0 | 3 | 1537 | 1 | 2 | 2 | 1525 | 5 | 0 | 0 |
| decl+polyfill | 3 | 1543 | 124 | 303 | 304 | 1534 | 5 | 0 | 0 |
| decl+polyfill-b0 | 4 | 1542 | 2 | 3 | 11 | 1526 | 5 | 0 | 0 |

## Timing: grid-100 (100) — median of runs (ms)

### chromium 156.0.8078.4 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 3 | 16 | 115 | 223 | 223 | 626 | 17 | 0 | 0 |
| decl-native | 2 | 16 | 119 | 220 | 220 | 621 | 9 | 0 | 0 |
| decl-native-b0 | 2 | 12 | 2 | 3 | 3 | 604 | 18 | 0 | 0 |
| decl-$RP | 2 | 16 | 119 | 219 | 219 | 622 | 9 | 0 | 0 |
| decl-$RP-b0 | 2 | 16 | 2 | 5 | 5 | 605 | 18 | 0 | 0 |
| decl+polyfill | 3 | 20 | 120 | 221 | 223 | 624 | 9 | 0 | 0 |
| decl+polyfill-b0 | 2 | 20 | 2 | 7 | 7 | 605 | 17 | 0 | 0 |

### firefox 157.0 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 3 | 25 | 121 | 222 | 222 | 624 | 6 | 0 | 0 |
| decl-$RP | 3 | 24 | 118 | 219 | 219 | 622 | 5 | 0 | 0 |
| decl-$RP-b0 | 2 | 21 | 2 | 6 | 6 | 604 | 6 | 0 | 0 |
| decl+polyfill | 2 | 27 | 123 | 224 | 225 | 626 | 5 | 0 | 0 |
| decl+polyfill-b0 | 5 | 35 | 2 | 12 | 12 | 605 | 6 | 0 | 0 |

### webkit 27.2 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 4 | 320 | 115 | 216 | 216 | 622 | 6 | 0 | 0 |
| decl-$RP | 4 | 322 | 118 | 219 | 219 | 623 | 6 | 0 | 0 |
| decl-$RP-b0 | 5 | 309 | 3 | 5 | 5 | 608 | 5 | 0 | 0 |
| decl+polyfill | 2 | 328 | 120 | 222 | 225 | 622 | 5 | 0 | 0 |
| decl+polyfill-b0 | 5 | 309 | 2 | 9 | 9 | 610 | 5 | 0 | 0 |

## patch-interactive: gap between patched counter visible and first click registering (median ms)

### chromium

| variant | hydrate | visible at | gap | never interactive |
|---|---|---|---|---|
| baseline | late | 404 | 23 | 0/5 |
| baseline | early | 404 | 15 | 0/5 |
| decl-native | late | 404 | 26 | 0/5 |
| decl-native | early | 403 | 13 | 0/5 |
| decl-native-b0 | late | 403 | 23 | 0/5 |
| decl-native-b0 | early | 404 | 12 | 0/5 |
| decl-$RP | late | 404 | 24 | 0/5 |
| decl-$RP | early | 404 | 12 | 0/5 |
| decl-$RP-b0 | late | 404 | 22 | 0/5 |
| decl-$RP-b0 | early | 404 | 13 | 0/5 |
| decl+polyfill | late | 404 | 23 | 0/5 |
| decl+polyfill | early | 404 | 13 | 0/5 |
| decl+polyfill-b0 | late | 404 | 31 | 0/5 |
| decl+polyfill-b0 | early | 404 | 12 | 0/5 |

### firefox

| variant | hydrate | visible at | gap | never interactive |
|---|---|---|---|---|
| baseline | late | 408 | 20 | 0/5 |
| baseline | early | 406 | 22 | 0/5 |
| decl-$RP | late | 404 | 21 | 0/5 |
| decl-$RP | early | 405 | 20 | 0/5 |
| decl-$RP-b0 | late | 404 | 23 | 0/5 |
| decl-$RP-b0 | early | 404 | 21 | 0/5 |
| decl+polyfill | late | 405 | 24 | 0/5 |
| decl+polyfill | early | 404 | 20 | 0/5 |
| decl+polyfill-b0 | late | 404 | 25 | 0/5 |
| decl+polyfill-b0 | early | 405 | 18 | 0/5 |

### webkit

| variant | hydrate | visible at | gap | never interactive |
|---|---|---|---|---|
| baseline | late | 414 | 13 | 0/5 |
| baseline | early | 407 | 22 | 0/5 |
| decl-$RP | late | 407 | 23 | 0/5 |
| decl-$RP | early | 408 | 24 | 0/5 |
| decl-$RP-b0 | late | 405 | 27 | 0/5 |
| decl-$RP-b0 | early | 408 | 20 | 0/5 |
| decl+polyfill | late | 406 | 22 | 0/5 |
| decl+polyfill | early | 406 | 27 | 0/5 |
| decl+polyfill-b0 | late | 405 | 25 | 0/5 |
| decl+polyfill-b0 | early | 408 | 22 | 0/5 |

