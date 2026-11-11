# Flight SSR: flags off vs on

- **off**: MaxwellCohen/react@rsc/html-first-one-flag (df356153), flags: none
- **on**: MaxwellCohen/react@rsc/html-first-one-flag (df356153), flags: enableFlightStaticHostElision

| variant | page kind | HTML bytes | HTML gzip | inlined Flight | hydrated (ms, median) | rows adopted | style/ld adopted | recoverable errs | console problems | nav ok | hydration check |
|---|---|---|---|---|---|---|---|---|---|---|---|
| off | baseline | 1,697,857 | 141,084 | 627,532 | 230 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| off | client-rows | 1,697,857 | 141,084 | 627,532 | 223 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| off | server-rows-baseline | 2,801,336 | 156,084 | 1,729,031 | 348 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| off | html-first-json | 2,801,336 | 156,084 | 1,729,031 | 341 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| off | html-first | 2,801,336 | 156,084 | 1,729,031 | 341 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | baseline | 1,697,855 | 141,083 | 627,530 | 205 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | client-rows | 1,284,276 | 96,942 | 213,952 | 171 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | server-rows-baseline | 2,801,335 | 156,084 | 1,729,030 | 318 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | html-first-json | 1,091,147 | 76,487 | 20,823 | 189 | 1000/1000 | yes | 0 | 0 | yes | PASS |
| on | html-first | 1,091,204 | 76,493 | 20,880 | 197 | 1000/1000 | yes | 0 | 0 | yes | PASS |

## In-process render (off)

```
<--- Last few GCs --->

[4807:0x1589c000]    69196 ms: Scavenge (interleaved) 4083.8 (4128.1) -> 4082.8 (4136.1) MB, pooled: 0 MB, 5.43 / 0.00 ms  (average mu = 0.339, current mu = 0.288) allocation failure; 
[4807:0x1589c000]    70056 ms: Mark-Compact (reduce) 4092.2 (4139.0) -> 4082.5 (4119.7) MB, pooled: 0 MB, 683.99 / 0.00 ms  (+ 9.2 ms in 0 steps since start of marking, biggest step 0.0 ms, walltime since start of marking 755 ms) (average mu = 0.319, curr

<--- JS stacktrace --->

FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
----- Native stack trace -----

 1: 0xe48bbe node::OOMErrorHandler(char const*, v8::OOMDetails const&) [node]
 2: 0x1248d00 v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, v8::OOMDetails const&) [node]
 3: 0x1248fd7 v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, v8::OOMDetails const&) [node]
 4: 0x1477ee5  [node]
 5: 0x1477f13  [node]
 6: 0x1490fea  [node]
 7: 0x14941b8  [node]
 8: 0x1cfcc61  [node]
```

## In-process render (on)

```
PageApp fizz (no RSC) floor          median 23.4 ms  p10 18.8  html 1068303
PageApp client rows, flight          median 36.8 ms  p10 34.6  html 1695833
PageApp client rows, elide LIVE      median 32.3 ms  p10 30.2  html 1282257
PageApp server rows, flight          median 101.1 ms  p10 92.5  html 2797333
PageApp server rows, elide           median 34.2 ms  p10 30.7  html 1089184
PageApp server rows, elide LIVE      median 35.6 ms  p10 32.3  html 1089184
fizz same markup (no RSC)            median 22.5 ms  p10 17.7  html 686871
lean rows                            median 31.6 ms  p10 28.9  html 901412
lean rows, elide                     median 30.9 ms  p10 29.3  html 901008
server rows, elide                   median 31.9 ms  p10 28.4  html 704105
server tbody, elide                  median 34.4 ms  p10 32.0  html 704105
server rows LIVE                     median 34.6 ms  p10 32.2  html 704105
server tbody LIVE                    median 34.2 ms  p10 30.7  html 704105
```
