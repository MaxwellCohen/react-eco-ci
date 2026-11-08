# Flight SSR: flags off vs on

- **off**: MaxwellCohen/react@rsc/5-html-first-flight (1930da7c), flags: none
- **on**: MaxwellCohen/react@rsc/5-html-first-flight (1930da7c), flags: enableFlightHostElision, enableFlightLazyClientParser, enableFlightPayloadDedupe, enableFlightHtmlFirst

| variant | page kind | HTML bytes | HTML gzip | inlined Flight | hydrated (ms, median) | rows adopted | style/ld adopted | recoverable errs | console problems | nav ok | hydration check |
|---|---|---|---|---|---|---|---|---|---|---|---|
| off | (no e2e output) |  |  |  |  |  |  |  |  |  | FAIL |
| on | (no e2e output) |  |  |  |  |  |  |  |  |  | FAIL |

## In-process render (off)

```
PageApp fizz (no RSC) floor          median 14.8 ms  p10 13.0  html 1068303
PageApp baseline flight              median 25.3 ms  p10 24.4  html 1695835
PageApp html-first                   median 25.5 ms  p10 24.7  html 1695835
PageApp html-first LIVE              median 25.2 ms  p10 24.2  html 1695835
fizz same markup (no RSC)            median 14.3 ms  p10 13.7  html 686871
lean rows                            median 21.5 ms  p10 20.7  html 901413
lean rows, elide                     median 21.7 ms  p10 20.9  html 901413
static rows (prune tr), elide        median 21.7 ms  p10 21.0  html 901413
static tbody (prune tbody), elide    median 21.7 ms  p10 21.1  html 901413
static rows LIVE                     median 21.7 ms  p10 21.0  html 901413
static tbody LIVE                    median 21.6 ms  p10 21.0  html 901413
```

## In-process render (on)

```
PageApp fizz (no RSC) floor          median 17.7 ms  p10 16.3  html 1068303
PageApp baseline flight              median 31.3 ms  p10 29.8  html 1695833
PageApp html-first                   median 26.5 ms  p10 25.5  html 1083536
PageApp html-first LIVE              median 21.7 ms  p10 20.9  html 1083325
fizz same markup (no RSC)            median 17.0 ms  p10 15.9  html 686871
lean rows                            median 26.5 ms  p10 25.5  html 901412
lean rows, elide                     median 27.0 ms  p10 25.6  html 900950
static rows (prune tr), elide        median 22.2 ms  p10 21.4  html 687385
static tbody (prune tbody), elide    median 22.2 ms  p10 21.6  html 687385
static rows LIVE                     median 19.5 ms  p10 18.2  html 687180
static tbody LIVE                    median 19.8 ms  p10 18.9  html 687180
```
