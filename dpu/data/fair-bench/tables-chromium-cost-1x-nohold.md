
### chromium 156.0.8078.4 — cost, CPU throttle 1x, hydrate=off, 20 runs/cell (raw/chromium-cost-1x-nohold.jsonl)

Failed/incomplete loads (hung, error, missing boundaries, leftover fallback/template, not all revealed): 0 of 300

#### Main thread TaskDuration (ms)
Cell = median [p25-p75] / p95 across runs.

| variant | N=60 | N=500 | N=2000 |
|---|---|---|---|
| base@300 | 50.1 [32.7-57.3] / 60.0 (n=20) | 117 [67.6-126] / 133 (n=20) | 176 [116-205] / 244 (n=20) |
| base@16 | 83.8 [50.5-113] / 125 (n=20) | 171 [124-190] / 213 (n=20) | 288 [258-300] / 319 (n=20) |
| nat@0 | 78.6 [48.7-116] / 135 (n=20) | 278 [174-311] / 332 (n=20) | 591 [580-606] / 651 (n=20) |
| rp@0 | 106 [52.6-122] / 129 (n=20) | 261 [177-318] / 342 (n=20) | 566 [542-583] / 637 (n=20) |
| poly@0 | 117 [62.6-146] / 160 (n=20) | 371 [346-417] / 435 (n=20) | 2097 [2016-2198] / 2902 (n=20) |

Difference of medians vs the baseline with the SAME window (bootstrap 95% CI over runs, 10000 resamples; "ns" = CI includes 0):

| variant | N=60 | N=500 | N=2000 |
|---|---|---|---|
| nat@0 - base@0 | n/a | n/a | n/a |
| rp@0 - base@0 | n/a | n/a | n/a |
| poly@0 - base@0 | n/a | n/a | n/a |

#### ScriptDuration (ms)
Cell = median [p25-p75] / p95 across runs.

| variant | N=60 | N=500 | N=2000 |
|---|---|---|---|
| base@300 | 4.38 [2.71-5.11] / 5.65 (n=20) | 11.0 [7.13-12.7] / 13.4 (n=20) | 18.3 [10.1-23.2] / 26.3 (n=20) |
| base@16 | 6.95 [4.36-8.77] / 10.7 (n=20) | 8.81 [7.33-10.1] / 11.0 (n=20) | 11.9 [11.1-12.8] / 13.3 (n=20) |
| nat@0 | 5.21 [3.43-8.61] / 9.43 (n=20) | 79.7 [42.9-87.2] / 90.4 (n=20) | 266 [250-288] / 310 (n=20) |
| rp@0 | 11.3 [5.96-13.7] / 14.3 (n=20) | 100 [62.0-113] / 121 (n=20) | 332 [312-346] / 382 (n=20) |
| poly@0 | 30.8 [16.1-39.9] / 42.9 (n=20) | 242 [212-279] / 292 (n=20) | 1833 [1779-1903] / 2423 (n=20) |

Difference of medians vs the baseline with the SAME window (bootstrap 95% CI over runs, 10000 resamples; "ns" = CI includes 0):

| variant | N=60 | N=500 | N=2000 |
|---|---|---|---|
| nat@0 - base@0 | n/a | n/a | n/a |
| rp@0 - base@0 | n/a | n/a | n/a |
| poly@0 - base@0 | n/a | n/a | n/a |

#### LayoutDuration (ms)
Cell = median [p25-p75] / p95 across runs.

| variant | N=60 | N=500 | N=2000 |
|---|---|---|---|
| base@300 | 5.76 [5.03-6.78] / 7.74 (n=20) | 14.1 [9.85-15.8] / 18.2 (n=20) | 24.6 [19.1-31.3] / 34.0 (n=20) |
| base@16 | 17.4 [10.5-21.8] / 24.6 (n=20) | 29.8 [21.8-34.7] / 40.6 (n=20) | 64.7 [58.3-66.0] / 72.7 (n=20) |
| nat@0 | 15.3 [10.1-21.8] / 26.2 (n=20) | 30.7 [22.8-40.8] / 44.0 (n=20) | 57.1 [54.5-59.1] / 64.7 (n=20) |
| rp@0 | 20.0 [11.1-23.4] / 25.2 (n=20) | 32.5 [22.6-42.0] / 46.5 (n=20) | 58.9 [56.5-61.5] / 81.4 (n=20) |
| poly@0 | 18.1 [10.7-21.7] / 24.2 (n=20) | 24.8 [22.4-26.0] / 26.3 (n=20) | 58.2 [54.6-66.4] / 105 (n=20) |

Difference of medians vs the baseline with the SAME window (bootstrap 95% CI over runs, 10000 resamples; "ns" = CI includes 0):

| variant | N=60 | N=500 | N=2000 |
|---|---|---|---|
| nat@0 - base@0 | n/a | n/a | n/a |
| rp@0 - base@0 | n/a | n/a | n/a |
| poly@0 - base@0 | n/a | n/a | n/a |

#### RecalcStyleDuration (ms)
Cell = median [p25-p75] / p95 across runs.

| variant | N=60 | N=500 | N=2000 |
|---|---|---|---|
| base@300 | 3.17 [1.94-3.81] / 4.16 (n=20) | 12.5 [6.23-13.2] / 14.7 (n=20) | 28.4 [15.5-34.4] / 44.3 (n=20) |
| base@16 | 4.27 [2.74-5.50] / 6.65 (n=20) | 11.2 [7.76-12.3] / 15.2 (n=20) | 23.1 [21.9-24.5] / 25.9 (n=20) |
| nat@0 | 3.92 [2.76-5.93] / 7.39 (n=20) | 10.7 [7.60-13.9] / 15.2 (n=20) | 18.6 [17.4-19.3] / 21.7 (n=20) |
| rp@0 | 5.34 [2.82-6.14] / 6.80 (n=20) | 11.6 [7.36-14.4] / 16.7 (n=20) | 19.9 [18.3-20.9] / 21.7 (n=20) |
| poly@0 | 4.75 [2.46-5.88] / 6.93 (n=20) | 7.99 [7.39-8.43] / 9.01 (n=20) | 19.7 [18.9-22.7] / 36.4 (n=20) |

Difference of medians vs the baseline with the SAME window (bootstrap 95% CI over runs, 10000 resamples; "ns" = CI includes 0):

| variant | N=60 | N=500 | N=2000 |
|---|---|---|---|
| nat@0 - base@0 | n/a | n/a | n/a |
| rp@0 - base@0 | n/a | n/a | n/a |
| poly@0 - base@0 | n/a | n/a | n/a |

