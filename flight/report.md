# Flight SSR: flags off vs on

- **off**: MaxwellCohen/react@rsc/5-html-first-flight (1930da7c), flags: none
- **on**: MaxwellCohen/react@rsc/5-html-first-flight (1930da7c), flags: enableFlightHostElision, enableFlightLazyClientParser, enableFlightPayloadDedupe, enableFlightHtmlFirst

| variant | page kind | HTML bytes | HTML gzip | inlined Flight | hydrated (ms, median) | rows adopted | style/ld adopted | recoverable errs | console problems | nav ok | hydration check |
|---|---|---|---|---|---|---|---|---|---|---|---|
| off | baseline | 1,697,857 | 141,084 | 627,532 | 156 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| off | html-first-json | 1,697,857 | 141,084 | 627,532 | 149 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| off | html-first | 1,697,857 | 141,084 | 627,532 | 147 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | baseline | 1,697,855 | 141,083 | 627,530 | 246 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | html-first-json | 1,085,557 | 73,642 | 15,233 | 194 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | html-first | 1,085,346 | 73,609 | 15,022 | 188 | 1000/1000 | yes | 0 | 0 | yes | PASS |

## In-process render (off)

```
PageApp fizz (no RSC) floor          median 13.2 ms  p10 12.3  html 1068303
PageApp baseline flight              median 22.9 ms  p10 21.3  html 1695835
PageApp html-first                   median 22.9 ms  p10 21.1  html 1695835
PageApp html-first LIVE              median 22.5 ms  p10 21.1  html 1695835
fizz same markup (no RSC)            median 12.8 ms  p10 11.9  html 686871
lean rows                            median 19.4 ms  p10 17.9  html 901413
lean rows, elide                     median 19.5 ms  p10 18.1  html 901413
static rows (prune tr), elide        median 19.4 ms  p10 18.1  html 901413
static tbody (prune tbody), elide    median 19.3 ms  p10 18.0  html 901413
static rows LIVE                     median 19.2 ms  p10 18.2  html 901413
static tbody LIVE                    median 19.6 ms  p10 17.9  html 901413
```

## In-process render (on)

```
PageApp fizz (no RSC) floor          median 22.5 ms  p10 21.3  html 1068303
PageApp baseline flight              median 37.9 ms  p10 37.1  html 1695833
PageApp html-first                   median 32.6 ms  p10 32.0  html 1083536
PageApp html-first LIVE              median 26.9 ms  p10 26.2  html 1083325
fizz same markup (no RSC)            median 21.6 ms  p10 20.7  html 686871
lean rows                            median 32.2 ms  p10 31.6  html 901412
lean rows, elide                     median 32.6 ms  p10 31.6  html 900950
static rows (prune tr), elide        median 27.7 ms  p10 27.2  html 687385
static tbody (prune tbody), elide    median 27.6 ms  p10 27.0  html 687385
static rows LIVE                     median 24.6 ms  p10 23.3  html 687180
static tbody LIVE                    median 24.5 ms  p10 24.0  html 687180
```
