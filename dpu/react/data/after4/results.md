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
| $RP calls / ids that still had template | 0/0 | 50/0 | 48/113 | 48/33 | 0/0 | 50/0 | 49/113 | 48/33 |
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
| $RP calls / ids that still had template | 0/0 | 48/113 | 48/33 | 0/0 | 48/113 | 49/33 |
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
| $RP calls / ids that still had template | 0/0 | 51/113 | 48/33 | 0/0 | 52/113 | 50/33 |
| leftover template[for] / fallbacks | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 | 0/0 |
| page errors / recoverable | 0/0 | 0/0 | 0/0 | 0/1 | 0/1 | 0/1 |

## Timing: popcorning (16) — median of runs (ms)

### chromium 156.0.8078.4 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 12 | 145 | 265 | 265 | 2304 | 9 | 0 | 0 |
| decl-native | 1 | 12 | 3 | 4 | 4 | 2264 | 9 | 0 | 0 |
| decl-native-b0 | 1 | 12 | 3 | 4 | 4 | 2264 | 9 | 0 | 0 |
| decl-$RP | 1 | 12 | 3 | 4 | 4 | 2264 | 10 | 0 | 0 |
| decl-$RP-b0 | 1 | 12 | 3 | 7 | 7 | 2264 | 9 | 0 | 0 |
| decl+polyfill | 2 | 16 | 3 | 4 | 4 | 2265 | 10 | 0 | 0 |
| decl+polyfill-b0 | 2 | 16 | 2 | 4 | 4 | 2264 | 10 | 0 | 0 |

### firefox 157.0 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 24 | 134 | 254 | 254 | 2302 | 6 | 0 | 0 |
| decl-$RP | 1 | 25 | 3 | 5 | 5 | 2264 | 6 | 0 | 0 |
| decl-$RP-b0 | 1 | 23 | 3 | 5 | 5 | 2265 | 6 | 0 | 0 |
| decl+polyfill | 1 | 28 | 4 | 5 | 5 | 2265 | 6 | 0 | 0 |
| decl+polyfill-b0 | 1 | 26 | 4 | 6 | 6 | 2264 | 6 | 0 | 0 |

### webkit 27.2 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 1 | 2276 | 127 | 247 | 247 | 2300 | 6 | 0 | 0 |
| decl-$RP | 2 | 2281 | 3 | 5 | 5 | 2264 | 6 | 0 | 0 |
| decl-$RP-b0 | 1 | 2284 | 4 | 6 | 6 | 2264 | 6 | 0 | 0 |
| decl+polyfill | 1 | 2278 | 3 | 6 | 6 | 2264 | 6 | 0 | 0 |
| decl+polyfill-b0 | 2 | 2280 | 3 | 5 | 5 | 2265 | 6 | 0 | 0 |

## Timing: many-boundaries (60) — median of runs (ms)

### chromium 156.0.8078.4 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 12 | 124 | 296 | 304 | 1552 | 9 | 0 | 0 |
| decl-native | 2 | 12 | 2 | 3 | 4 | 1524 | 10 | 0 | 0 |
| decl-native-b0 | 2 | 12 | 2 | 3 | 4 | 1524 | 10 | 0 | 0 |
| decl-$RP | 2 | 12 | 3 | 4 | 4 | 1525 | 10 | 0 | 0 |
| decl-$RP-b0 | 2 | 12 | 3 | 4 | 4 | 1524 | 10 | 0 | 0 |
| decl+polyfill | 2 | 16 | 3 | 4 | 4 | 1524 | 9 | 0 | 0 |
| decl+polyfill-b0 | 2 | 16 | 3 | 4 | 4 | 1525 | 9 | 0 | 0 |

### firefox 157.0 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 24 | 170 | 297 | 299 | 1821 | 6 | 0 | 0 |
| decl-$RP | 2 | 26 | 3 | 4 | 10 | 1523 | 7 | 0 | 0 |
| decl-$RP-b0 | 2 | 19 | 2 | 3 | 5 | 1524 | 6 | 0 | 0 |
| decl+polyfill | 2 | 29 | 3 | 4 | 8 | 1526 | 5 | 0 | 0 |
| decl+polyfill-b0 | 1 | 24 | 3 | 5 | 6 | 1525 | 6 | 0 | 0 |

### webkit 27.2 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 1544 | 175 | 302 | 302 | 1822 | 6 | 0 | 0 |
| decl-$RP | 2 | 1537 | 2 | 5 | 5 | 1524 | 6 | 0 | 0 |
| decl-$RP-b0 | 2 | 1544 | 2 | 3 | 4 | 1525 | 6 | 0 | 0 |
| decl+polyfill | 2 | 1536 | 3 | 4 | 6 | 1525 | 6 | 0 | 0 |
| decl+polyfill-b0 | 2 | 1542 | 3 | 4 | 5 | 1525 | 6 | 0 | 0 |

## Timing: grid-100 (100) — median of runs (ms)

### chromium 156.0.8078.4 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 16 | 115 | 237 | 237 | 639 | 32 | 0 | 0 |
| decl-native | 2 | 12 | 2 | 4 | 4 | 604 | 30 | 0 | 0 |
| decl-native-b0 | 2 | 16 | 2 | 4 | 4 | 604 | 30 | 0 | 0 |
| decl-$RP | 2 | 12 | 3 | 4 | 4 | 605 | 36 | 0 | 0 |
| decl-$RP-b0 | 2 | 16 | 3 | 4 | 4 | 605 | 32 | 0 | 0 |
| decl+polyfill | 2 | 16 | 4 | 6 | 6 | 607 | 38 | 0 | 0 |
| decl+polyfill-b0 | 2 | 16 | 4 | 6 | 6 | 605 | 28 | 0 | 0 |

### firefox 157.0 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 21 | 110 | 217 | 217 | 619 | 5 | 0 | 0 |
| decl-$RP | 2 | 28 | 2 | 5 | 5 | 604 | 5 | 0 | 0 |
| decl-$RP-b0 | 2 | 26 | 2 | 5 | 5 | 605 | 5 | 0 | 0 |
| decl+polyfill | 2 | 28 | 4 | 11 | 11 | 605 | 5 | 0 | 0 |
| decl+polyfill-b0 | 2 | 29 | 3 | 8 | 8 | 605 | 5 | 0 | 0 |

### webkit 27.2 (n=5)

| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 2 | 321 | 118 | 225 | 225 | 628 | 6 | 0 | 0 |
| decl-$RP | 2 | 306 | 3 | 5 | 5 | 605 | 6 | 0 | 0 |
| decl-$RP-b0 | 2 | 306 | 2 | 5 | 5 | 605 | 8 | 0 | 0 |
| decl+polyfill | 2 | 306 | 3 | 6 | 18 | 605 | 6 | 0 | 0 |
| decl+polyfill-b0 | 2 | 305 | 4 | 6 | 7 | 605 | 6 | 0 | 0 |

## patch-interactive: gap between patched counter visible and first click registering (median ms)

### chromium

| variant | hydrate | visible at | gap | never interactive |
|---|---|---|---|---|
| baseline | late | 406 | 38 | 0/5 |
| baseline | early | 406 | 10 | 0/5 |
| decl-native | late | 404 | 33 | 0/5 |
| decl-native | early | 404 | 12 | 0/5 |
| decl-native-b0 | late | 404 | 41 | 0/5 |
| decl-native-b0 | early | 404 | 13 | 0/5 |
| decl-$RP | late | 406 | 39 | 0/5 |
| decl-$RP | early | 405 | 10 | 0/5 |
| decl-$RP-b0 | late | 406 | 40 | 0/5 |
| decl-$RP-b0 | early | 404 | 13 | 0/5 |
| decl+polyfill | late | 406 | 38 | 0/5 |
| decl+polyfill | early | 406 | 11 | 0/5 |
| decl+polyfill-b0 | late | 405 | 32 | 0/5 |
| decl+polyfill-b0 | early | 406 | 19 | 0/5 |

### firefox

| variant | hydrate | visible at | gap | never interactive |
|---|---|---|---|---|
| baseline | late | 412 | 24 | 0/5 |
| baseline | early | 405 | 24 | 0/5 |
| decl-$RP | late | 407 | 30 | 0/5 |
| decl-$RP | early | 405 | 20 | 0/5 |
| decl-$RP-b0 | late | 406 | 33 | 0/5 |
| decl-$RP-b0 | early | 405 | 21 | 0/5 |
| decl+polyfill | late | 407 | 30 | 0/5 |
| decl+polyfill | early | 407 | 22 | 0/5 |
| decl+polyfill-b0 | late | 407 | 26 | 0/5 |
| decl+polyfill-b0 | early | 406 | 24 | 0/5 |

### webkit

| variant | hydrate | visible at | gap | never interactive |
|---|---|---|---|---|
| baseline | late | 407 | 23 | 0/5 |
| baseline | early | 407 | 32 | 0/5 |
| decl-$RP | late | 407 | 30 | 0/5 |
| decl-$RP | early | 408 | 28 | 0/5 |
| decl-$RP-b0 | late | 407 | 29 | 0/5 |
| decl-$RP-b0 | early | 409 | 35 | 0/5 |
| decl+polyfill | late | 406 | 32 | 0/5 |
| decl+polyfill | early | 407 | 32 | 0/5 |
| decl+polyfill-b0 | late | 406 | 26 | 0/5 |
| decl+polyfill-b0 | early | 407 | 29 | 0/5 |

