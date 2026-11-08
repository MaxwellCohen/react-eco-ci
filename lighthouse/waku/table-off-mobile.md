# Web performance report: https://react-eco-waku-1930da7c-off.to-email-max.workers.dev/table

## Scores (0–100)

| Report | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Mobile | 100 | 100 | 96 | 91 |

## Mobile metrics

Lab: FCP 1.2 s (good); LCP 1.2 s (good); TBT 10 ms (good); CLS 0 (good); SI 1.2 s (good)
Baseline features used: 4 widely available, 4 newly available, 2 limited (limited: link-rel-expect, blocking-render)
CSP: No CSP found in enforcement mode (High)

## Speed-up prompt

Personalized from this report's findings. Follow it, or hand it to a coding agent as-is.

````markdown
You are a web performance engineer. Improve this site's Core Web Vitals (LCP, CLS, INP) and Lighthouse performance score using the PageSpeed Insights findings below. First identify the meta framework in use (e.g. Next.js, Nuxt, SvelteKit, Astro, Remix/React Router, TanStack Start, SolidStart, Qwik) and apply each fix with that framework's native APIs. Only work on the focus areas listed — they were selected from the report data. Work in small, separately measurable changes.

## Report data
- Mobile · URL https://react-eco-waku-1930da7c-off.to-email-max.workers.dev/table · mobile · performance score 100
  - Lab: First Contentful Paint 1.2 s (good); Largest Contentful Paint 1.2 s (good); Total Blocking Time 10 ms (good); Cumulative Layout Shift 0 (good); Speed Index 1.2 s (good)

## 1. Measure correctly before changing anything
- Before measuring, ask me which target to test: a local production build of the repo (build, then run the preview/start server), the staging environment URL, or the live production URL. Wait for my answer and do not assume.
- Audit only a production build (local built output, staging, or production), never the dev server.
- Run Lighthouse several times and compare medians; single runs vary by several points.
- Make sure the preview/server applies Brotli or gzip, or results will be skewed.

## 2. JavaScript size and main-thread work
Evidence from the report:
- Unused JS: https://react-eco-waku-1930da7c-off.to-email-max.workers.dev/assets/index-CVqiwEkP.js (47.2 KiB unused)

What to do:
- Find large modules imported into every page (manifests, content indexes, icon sets, utility bundles). Pass each route only the data it renders and strip unused fields.
- Lazy-load anything not needed for first paint: search, menus, dialogs, lightboxes, editors, video players. Mount dialogs on first open, wrapped in Suspense/loading and error boundaries.
- Verify lazy chunks are NOT modulepreloaded on the initial page.

## 3. Lock in the gains
- Add bundle budgets enforced in CI (gzip bytes) for render-blocking CSS, total CSS, initial JS, and module preload count. Deferred downloads still count.
- Add browser tests that check main content exists before hydration, fonts load without reflow, hidden assets stay unloaded, and early scroll survives hydration.
- For each change: explain what changed and why, then re-measure on the same target I chose (built repo, staging, or production) and report before/after LCP, CLS, TBT, and JS/CSS transfer sizes.
````

## Issues (most impactful first)

- **[performance] Reduce unused JavaScript** — Est savings of 47 KiB (`unused-javascript`, Mobile)
  - https://react-eco-waku-1930da7c-off.to-email-max.workers.dev/assets/index-CVqiwEkP.js
- **[best-practices] Browser errors were logged to the console** (`errors-in-console`, Mobile)
  - Failed to load resource: the server responded with a status of 404 ()
- **[seo] Document does not have a meta description** (`meta-description`, Mobile)
