# Flight SSR: flags off vs on

- **off**: MaxwellCohen/react@rsc/html-first-one-flag (df356153), flags: none
- **on**: MaxwellCohen/react@rsc/html-first-one-flag (df356153), flags: enableFlightStaticHostElision

| variant | page kind | HTML bytes | HTML gzip | inlined Flight | hydrated (ms, median) | rows adopted | style/ld adopted | recoverable errs | console problems | nav ok | hydration check |
|---|---|---|---|---|---|---|---|---|---|---|---|
| off | baseline | 1,697,857 | 141,084 | 627,532 | 137 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| off | client-rows | 1,697,857 | 141,084 | 627,532 | 130 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| off | server-rows-baseline | 2,801,336 | 156,084 | 1,729,031 | 211 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| off | html-first-json | 2,801,336 | 156,084 | 1,729,031 | 210 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| off | html-first | 2,801,336 | 156,084 | 1,729,031 | 220 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | baseline | 1,697,855 | 141,083 | 627,530 | 251 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | client-rows | 1,284,276 | 96,942 | 213,952 | 211 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | server-rows-baseline | 2,801,335 | 156,084 | 1,729,030 | 374 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | html-first-json | 1,091,147 | 76,487 | 20,823 | 230 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | html-first | 1,091,204 | 76,493 | 20,880 | 205 | 1000/1000 | yes | 0 | 0 | yes | PASS |

## In-process render (off)

```
PageApp fizz (no RSC) floor          median 16.3 ms  p10 14.1  html 1068303
PageApp client rows, flight          median 24.3 ms  p10 22.7  html 1695835
PageApp client rows, elide LIVE      median 24.8 ms  p10 22.8  html 1695835
PageApp server rows, flight          median 72.0 ms  p10 60.4  html 2797334
PageApp server rows, elide           median 71.9 ms  p10 62.6  html 2797334
PageApp server rows, elide LIVE      median 69.2 ms  p10 62.7  html 2797334
fizz same markup (no RSC)            median 15.7 ms  p10 13.4  html 686871
lean rows                            median 21.0 ms  p10 19.5  html 901413
lean rows, elide                     median 20.2 ms  p10 18.7  html 901413
server rows, elide                   median 61.1 ms  p10 55.8  html 2013869
server tbody, elide                  median 62.4 ms  p10 58.2  html 2013869
server rows LIVE                     median 63.7 ms  p10 57.9  html 2013869
server tbody LIVE                    median 63.6 ms  p10 58.8  html 2013869
```

## In-process render (on)

```
PageApp fizz (no RSC) floor          median 26.3 ms  p10 24.6  html 1068303
PageApp client rows, flight          median 41.0 ms  p10 39.1  html 1695833
PageApp client rows, elide LIVE      median 36.0 ms  p10 34.6  html 1282257
PageApp server rows, flight          median 109.6 ms  p10 103.6  html 2797333
PageApp server rows, elide           median 38.6 ms  p10 36.9  html 1089184
PageApp server rows, elide LIVE      median 38.9 ms  p10 36.3  html 1089184
fizz same markup (no RSC)            median 24.9 ms  p10 22.2  html 686871
lean rows                            median 34.6 ms  p10 33.1  html 901412
lean rows, elide                     median 34.2 ms  p10 33.0  html 901008
server rows, elide                   median 34.7 ms  p10 31.9  html 704105
server tbody, elide                  median 37.6 ms  p10 35.1  html 704105
server rows LIVE                     median 37.2 ms  p10 35.1  html 704105
server tbody LIVE                    median 36.5 ms  p10 33.9  html 704105
```
