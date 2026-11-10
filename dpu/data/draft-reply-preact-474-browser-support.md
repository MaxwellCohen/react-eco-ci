# Draft reply (not posted) — browser support on preactjs/preact-render-to-string#474

Chrome 150 ships out-of-order streaming (`<template for>` / `<?start>`). Edge matches. Firefox and Safari do not ship yet; both standards positions are positive (Mozilla #1369, WebKit #628). The WHATWG HTML PR is merged.

This branch keeps a polyfill/fallback path for browsers without native support. Separately, MaxwellCohen/preact-render-to-string#8 makes DPU opt-in (`dpu: true`) so flipping the default stays a major, which addresses the request to treat default changes carefully.

Happy to adjust the PR description with these links if useful.
