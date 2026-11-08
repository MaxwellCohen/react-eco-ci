# Web performance report: https://react-eco-next-1930da7c-next164-stock.to-email-max.workers.dev/table

## Scores (0–100)

| Report | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Mobile | 93 | 100 | 96 | 91 |

## Mobile metrics

Lab: FCP 1.3 s (good); LCP 1.3 s (good); TBT 300 ms (needs-improvement); CLS 0 (good); SI 1.9 s (good)
Baseline features used: 5 widely available, 4 newly available, 1 limited (limited: referencetarget)
CSP: No CSP found in enforcement mode (High)

## Speed-up prompt

Personalized from this report's findings. Follow it, or hand it to a coding agent as-is.

````markdown
You are a web performance engineer. Improve this site's Core Web Vitals (LCP, CLS, INP) and Lighthouse performance score using the PageSpeed Insights findings below. First identify the meta framework in use (e.g. Next.js, Nuxt, SvelteKit, Astro, Remix/React Router, TanStack Start, SolidStart, Qwik) and apply each fix with that framework's native APIs. Only work on the focus areas listed — they were selected from the report data. Work in small, separately measurable changes.

## Report data
- Mobile · URL https://react-eco-next-1930da7c-next164-stock.to-email-max.workers.dev/table · mobile · performance score 93
  - Lab: First Contentful Paint 1.3 s (good); Largest Contentful Paint 1.3 s (good); Total Blocking Time 300 ms (needs improvement); Cumulative Layout Shift 0 (good); Speed Index 1.9 s (good)

## 1. Measure correctly before changing anything
- Before measuring, ask me which target to test: a local production build of the repo (build, then run the preview/start server), the staging environment URL, or the live production URL. Wait for my answer and do not assume.
- Audit only a production build (local built output, staging, or production), never the dev server.
- Run Lighthouse several times and compare medians; single runs vary by several points.
- Make sure the preview/server applies Brotli or gzip, or results will be skewed.

## 2. Server response and document delivery
Evidence from the report:
- Document request latency — Est savings of 610 ms
- Reduce initial server response time — Root document took 710 ms

What to do:
- Confirm the main heading and LCP content are present in the initial HTML response.
- Fetch page data in the framework's server loaders / server components instead of client-side effects.
- Prerender or statically generate public routes; keep request-time rendering only for personalized pages. Cache HTML at the edge/CDN where possible.
- Verify Content-Encoding (Brotli/gzip) on HTML and avoid redirects on the main document.

## 3. Render-blocking CSS and scripts
Evidence from the report:
- Unused CSS: inline <style>/<script> (14.3 KiB unused)

What to do:
- Keep only shared tokens and base styles global; co-locate feature styles with their routes/components so each page ships only the CSS it uses.
- Make non-critical scripts async/defer or load them after the load event.
- Consider critical-CSS inlining only after the above, and test dark mode, CSS-variable fonts, and form-control styles carefully.

## 4. JavaScript size and main-thread work
Evidence from the report:
- Total Blocking Time — 300 ms
- Unused JS: https://react-eco-next-1930da7c-next164-stock.to-email-max.workers.dev/_next/static/chunks/23e6jep2anmtk.js (30.6 KiB unused)
- Unused JS: https://react-eco-next-1930da7c-next164-stock.to-email-max.workers.dev/_next/static/chunks/0m3mby5pxg4oz.js (25.8 KiB unused)
- Legacy polyfills: https://react-eco-next-1930da7c-next164-stock.to-email-max.workers.dev/_next/static/chunks/23e6jep2anmtk.js (13.9 KiB)

What to do:
- Find large modules imported into every page (manifests, content indexes, icon sets, utility bundles). Pass each route only the data it renders and strip unused fields.
- Lazy-load anything not needed for first paint: search, menus, dialogs, lightboxes, editors, video players. Mount dialogs on first open, wrapped in Suspense/loading and error boundaries.
- Verify lazy chunks are NOT modulepreloaded on the initial page.
- Update the browserslist/build target to modern browsers so polyfills for Baseline features are not shipped.
- If the framework supports partial/deferred hydration (islands, server components, visible/idle hydration), defer hydration of below-the-fold and non-interactive sections.

## 5. Lock in the gains
- Add bundle budgets enforced in CI (gzip bytes) for render-blocking CSS, total CSS, initial JS, and module preload count. Deferred downloads still count.
- Add browser tests that check main content exists before hydration, fonts load without reflow, hidden assets stay unloaded, and early scroll survives hydration.
- For each change: explain what changed and why, then re-measure on the same target I chose (built repo, staging, or production) and report before/after LCP, CLS, TBT, and JS/CSS transfer sizes.
````

## Issues (most impactful first)

- **[performance] Document request latency** — Est savings of 610 ms (`document-latency-insight`, Mobile)
- **[performance] Reduce unused JavaScript** — Est savings of 56 KiB (`unused-javascript`, Mobile)
  - https://react-eco-next-1930da7c-next164-stock.to-email-max.workers.dev/_next/static/chunks/23e6jep2anmtk.js
  - https://react-eco-next-1930da7c-next164-stock.to-email-max.workers.dev/_next/static/chunks/0m3mby5pxg4oz.js
- **[performance] Reduce unused CSS** — Est savings of 14 KiB (`unused-css-rules`, Mobile)
  - .c0{color:#000000;margin:0px 0px;padding:0px;display:flex;flex-direction:column; … } …
- **[performance] Page prevented back/forward cache restoration** — 2 failure reasons (`bf-cache`, Mobile)
- **[performance] Legacy JavaScript** — Est savings of 14 KiB (`legacy-javascript-insight`, Mobile)
  - https://react-eco-next-1930da7c-next164-stock.to-email-max.workers.dev/_next/static/chunks/23e6jep2anmtk.js
- **[best-practices] Browser errors were logged to the console** (`errors-in-console`, Mobile)
  - Failed to load resource: the server responded with a status of 404 ()
- **[best-practices] Missing source maps for large first-party JavaScript** (`valid-source-maps`, Mobile)
- **[seo] Document does not have a meta description** (`meta-description`, Mobile)
