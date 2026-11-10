# No-hold timing (Chromium, 20 runs/cell)

Variants interleaved: base@300, base@16, nat@0, rp@0, poly@0.

Median patch lag (ms):

| variant | 60 | 500 | 2000 |
|---|---|---|---|
| base@300 | 163 | 162 | 166 |
| base@16 | 26.8 | 35.3 | 38.1 |
| nat@0 | 26.3 | 26.7 | 27.0 |
| rp@0 | 26.7 | 26.3 | 27.4 |
| poly@0 | 27.0 | 26.9 | 955 |

Raw: `chromium-timing-1x-nohold.jsonl` (301 lines including meta).
