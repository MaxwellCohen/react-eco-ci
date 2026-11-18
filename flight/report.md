# Flight SSR: flags off vs on

- **off**: MaxwellCohen/react@rsc/html-first-one-flag (231161c3), flags: none
- **on**: MaxwellCohen/react@rsc/html-first-one-flag (231161c3), flags: enableFlightHTMLFirst

| variant | page kind | HTML bytes | HTML gzip | inlined Flight | hydrated (ms, median) | rows adopted | style/ld adopted | recoverable errs | console problems | nav ok | hydration check |
|---|---|---|---|---|---|---|---|---|---|---|---|
| off | baseline | 1,697,857 | 141,084 | 627,532 | 249 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| off | client-rows | 1,697,857 | 141,084 | 627,532 | 240 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| off | server-rows-baseline | 2,801,336 | 156,084 | 1,729,031 | 363 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| off | html-first-json | 2,801,336 | 156,084 | 1,729,031 | 366 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| off | html-first | 2,801,336 | 156,084 | 1,729,031 | 369 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | baseline | 1,697,855 | 141,083 | 627,530 | 172 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | client-rows | 1,284,280 | 96,948 | 213,956 | 143 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | server-rows-baseline | 2,801,335 | 156,084 | 1,729,030 | 264 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | html-first-json | 1,091,147 | 76,487 | 20,823 | 160 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | html-first | 1,091,208 | 76,498 | 20,884 | 138 | 1000/1000 | yes | 0 | 0 | yes | PASS |

## In-process render (off)

```
PageApp fizz (no RSC) floor          median 27.7 ms  p10 25.4  html 1068303
PageApp client rows, flight          median 41.9 ms  p10 40.0  html 1695835
PageApp client rows, stub LIVE       median 42.5 ms  p10 40.0  html 1695835
PageApp server rows, flight          median 114.8 ms  p10 105.8  html 2797334
PageApp server rows, stub            median 114.8 ms  p10 107.5  html 2797334
PageApp server rows, stub LIVE       median 116.2 ms  p10 108.6  html 2797334
fizz same markup (no RSC)            median 27.1 ms  p10 24.9  html 686871
lean rows                            median 37.0 ms  p10 34.7  html 901413
lean rows, stub                      median 36.7 ms  p10 34.4  html 901413
server rows, stub                    median 108.5 ms  p10 101.8  html 2013869
server tbody, stub                   median 113.0 ms  p10 102.8  html 2013869
server rows LIVE                     median 113.3 ms  p10 102.6  html 2013869
server tbody LIVE                    median 111.3 ms  p10 102.2  html 2013869
```

## In-process render (on)

```
PageApp fizz (no RSC) floor          median 20.6 ms  p10 18.7  html 1068303
PageApp client rows, flight          median 31.0 ms  p10 28.9  html 1695833
PageApp client rows, stub LIVE       median 27.4 ms  p10 25.7  html 1282261
PageApp server rows, flight          median 84.0 ms  p10 78.3  html 2797333
PageApp server rows, stub            median 30.0 ms  p10 28.1  html 1089188
PageApp server rows, stub LIVE       median 31.1 ms  p10 28.6  html 1089188
fizz same markup (no RSC)            median 19.5 ms  p10 17.7  html 686871
lean rows                            median 26.3 ms  p10 24.6  html 901412
lean rows, stub                      median 26.0 ms  p10 24.3  html 901012
server rows, stub                    median 27.2 ms  p10 25.5  html 704109
server tbody, stub                   median 28.5 ms  p10 26.1  html 704109
server rows LIVE                     median 29.7 ms  p10 27.0  html 704109
server tbody LIVE                    median 29.1 ms  p10 26.4  html 704109
```
