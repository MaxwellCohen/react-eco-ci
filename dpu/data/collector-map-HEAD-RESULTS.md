# Collector-Map PR head re-bench (no server hold)

Date: 2026-11-12. Branch: `fizz/template-for-streaming`.
Chromium 156, hydrate off unless noted.

Two harnesses:

1. **`react-bench-v2`** (earlier same day, head `18cce7d244`) — interleaved cost cells vs classic `$RC`, client `$RP` throttle.
2. **Replay** (later same day, working tree after the ScriptDuration pass) — real Fizz HTML streamed into headless Chromium with one flush per boundary. Used to validate each micro-change.

## $RP size

| | raw | gzip≈ |
|---|---|---|
| `$RC` (`completeBoundary`) | 829 | 471 |
| `$RP` at `18cce7d244` (collector Map + collect-only observer) | 4518 | 1865 |
| `$RP` after ScriptDuration pass | **4444** | **1911** |

## Document bytes (`/s/nbound`, head `18cce7d244`)

| | N=60 raw/gzip | N=500 | N=2000 |
|---|---|---|---|
| classic `$RC` | 14048 / 1854 | 110424 / 10094 | 443924 / 38240 |
| collector `$RP` | 17221 / 3148 | 109455 / 10264 | 406166 / 34785 (−8.5% / −9.0%) |

## TaskDuration (ms, median) — `react-bench-v2` at `18cce7d244`

| | N=60 | N=500 | N=2000 |
|---|---|---|---|
| classic `$RC` | 52.3 | 130 | 202 |
| collector `$RP` | 59.3 (ns) | 165 (+35) | 325 (+123) |

At that head, ScriptDuration dominated the gap (207 vs 22 at N=2000). Layout was *better* for `$RP` at N=2000 (−14 ms).

## ScriptDuration pass (replay, after `18cce7d244`)

Kept after measuring each change:

| Change | Scenario | Before | After |
|---|---|---|---|
| Collect each group's templates at announce (walk back from `document.currentScript`); no document rescan on a miss | 200 parents + nested child | 3,930 ms | 114 ms |
| `TreeWalker` instead of two live `NodeIterator`s | flat 2,000 | 149 ms | 24 ms |
| Swap nested `<?start>` / `<?end>` for comments before insert | 500 parents + nested child | 2,062 ms* | 20 ms |
| Drop page-lifetime collector on the inline path; external runtime disconnects at `DOMContentLoaded` | flat 2,000 | 33 ms | 21 ms |
| | 30k DOM mutations after load | 29.7 ms | 13.0 ms |
| One shared hydration observer per document | flat 2,000 + hydrate, task time | 1,910 ms | 261 ms |
| | observer callbacks | 2.1 M | 1.8 k |

\* At the previous head the 500-parent nested case often failed to finish loading within 30 s.

Also in: `document.contains(marker)` → `marker.isConnected` (flush ~6.0 → 5.2 ms; fewer bytes).

Reverted after measuring: `for…in` ownership check (flush 6.9 → 9.3 ms); `Range.deleteContents()` for fallback removal (flush 7 → 236 ms).

### Progression (N≈2000 ScriptDuration / related)

| head | note |
|---|---|
| collector Map only (full document rescan per `$RP`) | TaskDuration 25112 ms (`react-bench-v2`) |
| + O(1) Map + collect-only observer | TaskDuration 434 ms |
| + defer template lookup to flush (`18cce7d244`) | TaskDuration 325 ms; ScriptDuration ~207 ms |
| + announce-time template walk / TreeWalker / PI→comment / no lifetime observer | flat ScriptDuration ~24 ms (≈ `$RC` 22 ms) |
| + shared hydration observer | hydrate task 1910 → 261 ms |

## Takeaway

Announce protocol is the right architecture (MutationObserver *apply* was parked).

On the PR’s real no-hold client-throttle path, flat 2,000 ScriptDuration is now in line with classic `$RC`, and the nested document-rescan cliff is gone. The published −37…−55% equal-policy TaskDuration win still needs a server hold (or equivalent coalesce) — that table is a different policy from the PR head.

Bytes win at ≥500 boundaries; bootstrap is larger at small N.
