# `<template for>`: what streaming SSR libraries still do in script

Notes for web standards discussion. 10 November 2026.

Source: building out-of-order Suspense streaming on `<template for>` / `<?start name>` / `<?end>` in
React Fizz ([MaxwellCohen/react#25](https://github.com/MaxwellCohen/react/pull/25)) and
preact-render-to-string ([#474](https://github.com/preactjs/preact-render-to-string/pull/474),
[#490](https://github.com/preactjs/preact-render-to-string/pull/490)), tested in Chromium 156.0.8078.4.
Summary page: https://maxwellcohen.github.io/react-eco-ci/dpu/

Each item says what the browser does today, what the library does about it, and a possible ask.
"Observed" means seen in Chromium 156 through the PR's tests or the benchmark harness. The asks are
starting points, not worked-out proposals.

## Summary

| # | Gap | Library workaround today | Severity for adoption |
|---|---|---|---|
| 1 | A patch cannot be held, batched or scheduled | React switches native patching off and applies in script | Blocks the native path in React |
| 2 | No signal that a patch was applied | MutationObserver on the markers, plus a script per flush | Needs script for hydration state |
| 3 | A native patch cannot join a view transition | Script applies the batch inside `startViewTransition` | Blocks native for pages using view transitions |
| 4 | Patch content is parsed as HTML, also inside SVG and MathML | Reparse with `outerHTML = outerHTML`, restore `<image>` | Wrong DOM without script |
| 5 | A patch cannot wait for, or place, its styles | Render-blocking `<link>` before the patch, script hoists `<style>` | Cascade order differs without script |
| 6 | A patch with no matching range stays in the document | Script removes the leftover `<template>` | Clean-up only |
| 7 | The range name cannot be looked up, and old browsers see a comment | A second marker per boundary | About +3 to +5 gzip bytes per boundary |
| 8 | Native apply gets slower than a script batch at high counts | None | Implementation, not spec |
| 9 | Chromium only | Script fallback, which CSP can block | Fallback is required |

## 1. A patch cannot be held, batched or scheduled

**Today.** The browser applies `<template for>` while it parses it. There is no attribute, event or
API to delay it, group it with other patches, or align it to a frame.

**Why it matters.** React throttles Suspense reveals on purpose (about 300 ms since the last reveal,
first paint for the first one) so content does not pop in one boundary at a time. Unthrottled native
patching reveals sooner but costs more main-thread time than today's throttled `$RC`:

| Median TaskDuration (ms) | 60 | 500 | 2,000 |
|---|---|---|---|
| Classic `$RC`, 300 ms throttle | 50.1 | 117 | 176 |
| Classic `$RC`, 16 ms throttle | 83.8 | 171 | 288 |
| Native `<template for>`, no hold | 78.6 | 278 | 591 |

Native minus classic@300, bootstrap 95% CI: +28.5 (not significant) at 60, +161 at 500, +414 at 2,000.
Median patch lag: 26 to 27 ms native against 162 to 166 ms for classic@300.

When the server holds completed boundaries for the same 300 ms and sends them as one group, native
wins instead (28.9 vs 47.1 ms at 60, 64.6 vs 124 at 500). So the cost is in the cadence, not in the
mechanism. A server-side hold is not acceptable for React, since it delays bytes.

**Workaround.** `$RP()` runs once after the shell and replaces every `<?start name>` processing
instruction with a comment of the same text. With no range to target, the browser leaves each
`<template for>` in the document, and `$RP(id, …)` applies the queued ones after the throttle. With
scripts on, the native path is therefore never used. Without script the browser patches natively,
unthrottled, so the two modes reveal on different schedules.

**Possible ask.** A way to say "apply these patches together", for example a group that commits
at its end tag, a frame-aligned commit, or a cancellable event before apply that lets script take
over the timing.

## 2. No signal that a patch was applied

**Today.** No event fires and no promise resolves when a range is patched.

**Why it matters.** The library has to update its own state at that moment: mark the boundary as
complete (`<!--$?-->` to `<!--$-->`), and retry hydration for it.

**Workaround.** React's client watches for the range markers disappearing with a MutationObserver.
The server still sends a `<script>` after each flushed group.

**Possible ask.** A `patch` event on the range's parent (or the document) naming the range.

## 3. A native patch cannot join a view transition

**Today.** A patch the browser applies is a plain DOM change. It is not inside
`document.startViewTransition`, and there is no point at which to set per-element
`view-transition-name` values for the old and new content.

**Workaround.** When the page renders `<ViewTransition>`, React applies the batch in script inside
one `startViewTransition`, with the same enter, exit, share and update names as `$RC`.

**Possible ask.** A declarative opt-in for a patch (or patch group) to run as a view transition.
This depends on gap 1, since a transition needs a batch boundary.

## 4. Patch content is parsed as HTML, also inside SVG and MathML

**Today.** `<template>` content is parsed in the HTML namespace regardless of where the target range
sits. A patch into `<svg>` or `<math>` inserts HTML-namespace elements. The HTML parser also rewrites
`<image>` to `<img>` before the content reaches the SVG parent.

**Workaround.** After every apply, including a native one, the script reparses the patched nodes with
`outerHTML = outerHTML` in the parent's namespace, and first turns `<img>` back into SVG `<image>`
(except inside `<foreignObject>`). Preact does the same reparse.

**Possible ask.** Parse the content of `<template for>` with the target range's parent as the
context element, as fragment parsing does for `innerHTML`.

## 5. A patch cannot wait for, or place, its styles

**Today.** A patch writes only into its range. It cannot also insert into `<head>`, and it cannot
wait for a stylesheet to load before it shows.

**Why it matters.** React orders hoisted styles by precedence in `<head>`, and `$RC` waits for a
boundary's stylesheets before revealing it.

**Workaround.** Late stylesheets are written as a render-blocking `<link>` in front of the patch.
Late `<style data-precedence>` rules arrive inside the patch and the script moves them into `<head>`
after the last resource of the same precedence. Without script they stay at the patch location, so
the cascade order can differ from a scripted load.

**Possible ask.** Either a patch group that can target more than one range (one of them in
`<head>`), or a way for a patch to declare resources it must wait for.

## 6. A patch with no matching range stays in the document

**Today.** When no `<?start name>` range with that name exists, the `<template for>` element stays in
the DOM as an inert template. (React's workaround for gap 1 relies on this.)

**Why it matters.** A range can be gone for good reasons: the client rendered that boundary first,
or the parent was removed.

**Workaround.** The script removes templates whose boundary is gone.

**Possible ask.** Define the behaviour, and consider discarding an unmatched patch, or reporting it
through the event from gap 2.

## 7. The range name cannot be looked up, and old browsers see a comment

**Today.** There is no lookup from a name to its range. Script finds one by walking the tree. In
browsers without support, `<?start name="x">` parses as a comment.

**Why it matters.** Libraries carry a second marker for the same boundary: React keeps a
`<!--B:0-->` anchor next to `<?start name="B:0">`; Preact keeps `<!--$s:id-->` comments next to the
processing instruction. The id is then repeated more often, and unique ids compress badly. Preact
measured +2.8 to +5.5 gzip bytes per boundary against its current format, most of it the extra id.

**Possible ask.** A lookup API (name to range), so one marker serves the browser, the fallback and
hydration.

## 8. Native apply gets slower than a script batch at high counts

Implementation note for Chromium, not a spec gap. Same 300 ms policy, median TaskDuration:

| | 60 | 500 | 2,000 |
|---|---|---|---|
| Native | 28.9 | 64.6 | 222 |
| Script-applied | 29.5 | 57.7 | 113 |

Native is level with script up to 500 and twice as slow at 2,000. At a 16 ms window, native is
+59 ms against classic at 2,000 while the script path is level.

## 9. Chromium only

Firefox and WebKit need the script fallback. Under a strict CSP without a nonce on the library's
inline scripts, the Preact test page left all 112 templates unapplied in Firefox and WebKit, and
worked in Chromium.

A page-wide MutationObserver polyfill is not a usable fallback at scale: 248 ms at 500 boundaries
and 1,685 ms at 2,000, against 124 and 251 for classic.

## Not verified

- Whether a large patch becomes visible in pieces while its template is still being parsed, and
  whether libraries need an atomic commit for that.
- Name collisions between a library's ranges and user content, or between two roots on one page.
- Back/forward cache and prerendered pages.

## Data

- Equal policy, main-thread cost: `fair-bench/chromium-cost-1x.md`
- No hold, main-thread cost: `fair-bench/chromium-cost-1x-nohold-summary.md`
- No hold, timing: `fair-bench/chromium-timing-1x-nohold-summary.md`
- Preact comparison: `preact-REPORT.md`
