import * as React from 'react';
import {hydrateRoot} from 'react-dom/client';
import {createScenarios} from './scenarios.js';

const props = JSON.parse(document.getElementById('__props').textContent);
const q = new URLSearchParams(location.search);
const {App} = createScenarios(React, {
  cache: new Map(),
  scale: Number(props.scale || 1),
  n: Number(q.get('n') || 0),
  hydrate: props.hydrate || 'late',
  polyfill: !!props.polyfill,
});
window.__recoverable = [];
window.__hydrateStart = performance.now();
hydrateRoot(document.getElementById('root'), React.createElement(App, props), {
  onRecoverableError(e) {
    window.__recoverable.push(String((e && e.message) || e).slice(0, 200));
  },
});
window.__hydrated = performance.now();
