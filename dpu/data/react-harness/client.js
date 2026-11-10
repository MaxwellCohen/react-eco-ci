'use strict';
const React = require('react');
const {hydrateRoot} = require('react-dom/client');
const createScenarios = require('./scenarios.js');
const q = new URLSearchParams(location.search);
const multi = k => q.getAll(k).flatMap(v => v.split(',')).filter(Boolean);
const m = location.pathname.match(/^\/s\/([\w-]+)$/);
const {App} = createScenarios(React, {polyfill: q.get('polyfill') === '1', hydrate: q.get('hydrate') || 'off'});
window.__recoverable = [];
window.__hydrateStartedAt = performance.now();
hydrateRoot(document, React.createElement(App, {only: m ? [m[1]] : multi('only'), skip: multi('skip')}), {
  onRecoverableError(e) { window.__recoverable.push(String((e && e.message) || e).slice(0, 200)); },
});
window.__hydrated = true;
