# No-hold main-thread cost (Chromium, throttle 1x, 20 runs/cell)

Median TaskDuration (ms):

| variant | 60 | 500 | 2000 |
|---|---|---|---|
| base@300 | 50.1 | 117 | 176 |
| base@16 | 83.8 | 171 | 288 |
| nat@0 | 78.6 | 278 | 591 |
| rp@0 | 106 | 261 | 566 |
| poly@0 | 117 | 371 | 2097 |

nat@0 − base@300 (bootstrap 95% CI): +28.5 ns | +161 | +414

Conclusion: the minimal no-hold React design does not win on main-thread vs shipping classic $RC.
