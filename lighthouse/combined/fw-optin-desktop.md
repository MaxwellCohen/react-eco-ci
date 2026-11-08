# Web performance report: https://react-eco-fw-on.to-email-max.workers.dev/optin?badge=0

## Scores (0–100)

| Report | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Desktop | 100 | 87 | 96 | 91 |

## Desktop metrics

Lab: FCP 0.3 s (good); LCP 0.3 s (good); TBT 0 ms (good); CLS 0 (good); SI 0.6 s (good)
Baseline features used: 5 widely available, 4 newly available, 2 limited (limited: link-rel-expect, blocking-render)
CSP: No CSP found in enforcement mode (High)

## Speed-up prompt

Personalized from this report's findings. Follow it, or hand it to a coding agent as-is.

````markdown
You are a web performance engineer. Improve this site's Core Web Vitals (LCP, CLS, INP) and Lighthouse performance score using the PageSpeed Insights findings below. First identify the meta framework in use (e.g. Next.js, Nuxt, SvelteKit, Astro, Remix/React Router, TanStack Start, SolidStart, Qwik) and apply each fix with that framework's native APIs. Only work on the focus areas listed — they were selected from the report data. Work in small, separately measurable changes.

## Report data
- Desktop · URL https://react-eco-fw-on.to-email-max.workers.dev/optin?badge=0 · desktop · performance score 100
  - Lab: First Contentful Paint 0.3 s (good); Largest Contentful Paint 0.3 s (good); Total Blocking Time 0 ms (good); Cumulative Layout Shift 0 (good); Speed Index 0.6 s (good)

## 1. Measure correctly before changing anything
- Before measuring, ask me which target to test: a local production build of the repo (build, then run the preview/start server), the staging environment URL, or the live production URL. Wait for my answer and do not assume.
- Audit only a production build (local built output, staging, or production), never the dev server.
- Run Lighthouse several times and compare medians; single runs vary by several points.
- Make sure the preview/server applies Brotli or gzip, or results will be skewed.

## 2. Render-blocking CSS and scripts
Evidence from the report:
- Unused CSS: inline <style>/<script> (17.2 KiB unused)

What to do:
- Keep only shared tokens and base styles global; co-locate feature styles with their routes/components so each page ships only the CSS it uses.
- Make non-critical scripts async/defer or load them after the load event.
- Consider critical-CSS inlining only after the above, and test dark mode, CSS-variable fonts, and form-control styles carefully.

## 3. JavaScript size and main-thread work
Evidence from the report:
- Unused JS: https://react-eco-fw-on.to-email-max.workers.dev/client.js (40.8 KiB unused)

What to do:
- Find large modules imported into every page (manifests, content indexes, icon sets, utility bundles). Pass each route only the data it renders and strip unused fields.
- Lazy-load anything not needed for first paint: search, menus, dialogs, lightboxes, editors, video players. Mount dialogs on first open, wrapped in Suspense/loading and error boundaries.
- Verify lazy chunks are NOT modulepreloaded on the initial page.

## 4. Lock in the gains
- Add bundle budgets enforced in CI (gzip bytes) for render-blocking CSS, total CSS, initial JS, and module preload count. Deferred downloads still count.
- Add browser tests that check main content exists before hydration, fonts load without reflow, hidden assets stay unloaded, and early scroll survives hydration.
- For each change: explain what changed and why, then re-measure on the same target I chose (built repo, staging, or production) and report before/after LCP, CLS, TBT, and JS/CSS transfer sizes.
````

## Issues (most impactful first)

- **[performance] Reduce unused JavaScript** — Est savings of 41 KiB (`unused-javascript`, Desktop)
  - https://react-eco-fw-on.to-email-max.workers.dev/client.js
- **[performance] Reduce unused CSS** — Est savings of 17 KiB (`unused-css-rules`, Desktop)
  - .c0{color:#000000;margin:0px 0px;padding:0px;display:flex;flex-direction:column; … } …
- **[accessibility] Touch targets do not have sufficient size or spacing.** (`target-size`, Desktop)
  - body > header.site-header > nav > a `<a href="/">`
- **[accessibility] Document does not have a main landmark.** (`landmark-one-main`, Desktop)
  - html `<html lang="en">`
- **[best-practices] Browser errors were logged to the console** (`errors-in-console`, Desktop)
  - Failed to load resource: the server responded with a status of 404 ()
- **[seo] Document does not have a meta description** (`meta-description`, Desktop)
