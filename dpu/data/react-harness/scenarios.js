'use strict';
// React port of preact-eco-ci/demos/streaming scenarios (the DPU_SET). Isomorphic: shared by server.js and client.js.
const RECORDER = `(function(){
var log=window.__rp={calls:0,ids:0,hadTemplate:0,errors:0,maxGap:0},real;
Object.defineProperty(window,'$RP',{configurable:true,get:function(){return real&&wrap},set:function(f){real=f}});
function wrap(){log.calls++;for(var i=0;i<arguments.length;i++){log.ids++;
 if(document.querySelector('template[for="'+arguments[i]+'"]'))log.hadTemplate++}
 return real.apply(this,arguments)}
addEventListener('error',function(){log.errors++});
var last=performance.now();setInterval(function(){var n=performance.now();log.maxGap=Math.max(log.maxGap,n-last-100);last=n},100);
})();`;

module.exports = function createScenarios(React, ctx) {
  const {Suspense, useState, use} = React;
  const h = React.createElement;
  const isServer = typeof window === 'undefined';
  const cache = (ctx && ctx.cache) || new Map();

  function Late({id, ms = 500, children}) {
    if (isServer && ms > 0) {
      let p = cache.get(id);
      if (!p) {
        p = new Promise(r => setTimeout(r, ms));
        cache.set(id, p);
      }
      use(p);
    }
    return children === undefined ? null : children;
  }
  const Fallback = ({text = 'Loading…'}) => h('p', {'data-testid': 'fallback'}, text);
  const fb = t => h(Fallback, {text: t});
  const S = (id, ms, children, fallback) =>
    h(Suspense, {fallback: fallback || fb()}, h(Late, {id, ms}, children));
  function Counter({name}) {
    const [n, setN] = useState(0);
    return h('button', {type: 'button', 'data-testid': name + '-btn', onClick: () => setN(v => v + 1)},
      name + ' clicks: ', h('span', {'data-testid': name + '-count'}, n));
  }
  const Panel = ({label, ms, children}) =>
    h(Late, {id: 'panel:' + label, ms},
      h('div', {className: 'panel', 'data-testid': 'panel-' + label}, h('b', null, label), ' resolved after ' + ms + 'ms ', children));
  const PS = ({label, ms, children}) =>
    h(Suspense, {fallback: fb('Loading ' + label + '…')}, h(Panel, {label, ms}, children));
  const KERNELS = [420, 1680, 780, 2100, 1100, 540, 1900, 1320, 2260, 860, 1480, 640, 1980, 980, 1200, 1540];
  const BIG = Array.from({length: 600}, (_, i) => h('p', {key: i, 'data-i': i}, 'row ' + i));
  const GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';

  const L = ({n}) => n > 5 ? null : h(Suspense, {fallback: fb('level ' + n + '…')},
    h(Late, {id: 'deep-' + n, ms: 250}, h('div', {'data-level': n}, 'level ' + n, h(L, {n: n + 1}))));

  const SC = {
    'html-baseline': () => S('edge-html', 600, h('p', {'data-testid': 'html-done'}, 'Done — declarative DPU worked')),
    popcorning: () => h('div', {className: 'grid4', 'data-testid': 'popcorn'}, KERNELS.map((ms, i) =>
      h(Suspense, {key: i, fallback: h('span', {className: 'pulse'}, '…')}, h(Late, {id: 'k' + i, ms}, h('span', {'data-cell': i, className: 'done'}, i))))),
    nested: () => h(Suspense, {fallback: fb('account shell…')}, h(Panel, {label: 'Account', ms: 1000},
      h(Suspense, {fallback: fb('nested details…')}, h(Panel, {label: 'Details', ms: 1500})))),
    'out-of-order': () => [h(PS, {key: 1, label: 'slow-first', ms: 2500}), h(PS, {key: 2, label: 'fast-second', ms: 600})],
    'table-rows': () => h('table', null, h('tbody', null, h('tr', null, h('td', null, 'static')),
      h(Suspense, {fallback: h('tr', {'data-testid': 'fallback'}, h('td', null, 'loading'))},
        h(Late, {id: 'table-rows'}, [h('tr', {key: 'a', 'data-testid': 'row-a'}, h('td', null, 'A')), h('tr', {key: 'b', 'data-testid': 'row-b'}, h('td', null, 'B'))])))),
    'select-options': () => h('select', {'data-testid': 'sel', defaultValue: '2'},
      h(Suspense, {fallback: h('option', null, 'loading')}, h(Late, {id: 'select-options'},
        [h('option', {key: 1, value: '1'}, 'one'), h('option', {key: 2, value: '2'}, 'two'), h('option', {key: 3, value: '3'}, 'three')]))),
    'list-items': () => h('ul', {'data-testid': 'ul'}, h(Suspense, {fallback: h('li', null, 'loading')},
      h(Late, {id: 'list-items'}, [h('li', {key: 1}, 1), h('li', {key: 2}, 2), h('li', {key: 3}, 3)]))),
    'svg-namespace': () => h('svg', {width: 160, height: 100, viewBox: '0 0 160 100', 'data-testid': 'svg-stage'},
      h(Suspense, {fallback: h('text', {x: 8, y: 20, fontSize: 12}, 'Loading…')},
        h(Late, {id: 'edge-svg', ms: 800}, h('circle', {cx: 80, cy: 55, r: 24, fill: 'tomato', stroke: 'white', strokeWidth: 2})))),
    'mathml-namespace': () => h('math', {display: 'block', 'data-testid': 'math-stage'},
      h(Suspense, {fallback: h('mtext', null, 'Loading…')}, h(Late, {id: 'edge-math', ms: 800}, [h('mi', {key: 1}, 'x'), h('mo', {key: 2}, '+'), h('mn', {key: 3}, '1')]))),
    'style-hoist': () => S('edge-style', 900, [h('style', {key: 's'}, '.dpu-edge-style{color:tomato;font-weight:700}'),
      h('p', {key: 'p', className: 'dpu-edge-style', 'data-testid': 'styled'}, 'Styled hello')]),
    'foreign-object': () => h('svg', {width: 200, height: 60}, h('foreignObject', {width: 200, height: 60},
      h(Suspense, {fallback: fb()}, h(Late, {id: 'foreign-object'}, h('p', {'data-testid': 'fo'}, 'html in svg'))))),
    'inline-script': () => S('inline-script', 500, [h('script', {key: 's', dangerouslySetInnerHTML: {__html: 'window.__scriptRan=(window.__scriptRan||0)+1'}}),
      h('p', {key: 'p', 'data-testid': 'script-done'}, 'done')]),
    empty: () => h('div', {'data-testid': 'empty-host'}, S('empty', 500, undefined)),
    'multi-root': () => h('div', {'data-testid': 'multi-host'}, S('multi-root', 500, [h('b', {key: 1}, 1), h('i', {key: 2}, 2), h('u', {key: 3}, 3)])),
    'text-only': () => h('p', {'data-testid': 'text-host'}, h(Suspense, {fallback: 'loading'}, h(Late, {id: 'text-only'}, 'resolved text'))),
    'nested-template': () => S('ntpl', 500, [h('template', {key: 't', 'data-testid': 'inner-tpl'}, h('p', null, 'inert')), h('p', {key: 'p', 'data-testid': 'ntpl-done'}, 'done')]),
    'link-stylesheet': () => S('link', 500, [h('link', {key: 'l', rel: 'stylesheet', href: 'data:text/css,.lnk{color:rgb(0,128,0)}'}), h('p', {key: 'p', className: 'lnk', 'data-testid': 'lnk'}, 'linked')]),
    'iframe-srcdoc': () => S('iframe', 500, h('iframe', {'data-testid': 'ifr', srcDoc: '<p id=x>inside</p>'})),
    'big-boundary': () => S('big', 600, h('div', {'data-testid': 'big'}, BIG)),
    'patch-interactive': () => S('patch-interactive', 400, h(Counter, {name: 'patched'}), fb('Loading counter…')),
    'client-wins': () => S('client-wins', 1800, h('p', {'data-testid': 'client-wins-content'}, 'content')),
    'adjacent-boundaries': () => [h(Suspense, {key: 'a', fallback: fb('A…')}, h(Late, {id: 'adj-a', ms: 500}, h('p', {'data-testid': 'adj-a'}, 'A'))),
      h(Suspense, {key: 'b', fallback: fb('B…')}, h(Late, {id: 'adj-b', ms: 500}, h('p', {'data-testid': 'adj-b'}, 'B')))],
    'nested-inner-first': () => h(Suspense, {fallback: fb('outer…')}, h(Late, {id: 'nest-outer', ms: 1200},
      h('div', {'data-testid': 'nest-outer'}, 'outer', h(Suspense, {fallback: fb('inner…')}, h(Late, {id: 'nest-inner', ms: 300}, h('p', {'data-testid': 'nest-inner'}, 'inner')))))),
    'many-boundaries': () => h('div', {className: 'grid10', 'data-testid': 'many-grid'}, Array.from({length: 60}, (_, i) =>
      h(Suspense, {key: i, fallback: h('span', null, '·')}, h(Late, {id: 'many-' + i, ms: 200 + ((i * 37) % 23) * 60}, h('span', {'data-cell': i}, i))))),
    'zero-delay': () => S('zero', 0, h('p', {'data-testid': 'zero-done'}, 'instant')),
    'deep-nesting': () => h(L, {n: 1}),
    'reverse-order': () => h('div', {'data-testid': 'reverse'}, [0, 1, 2, 3, 4].map(i =>
      h(Suspense, {key: i, fallback: h('span', null, '…')}, h(Late, {id: 'rev-' + i, ms: (5 - i) * 300}, h('span', {'data-cell': i}, i))))),
    'grid-100': () => h('div', {className: 'grid10', 'data-testid': 'grid-100'}, Array.from({length: 100}, (_, i) =>
      h(Suspense, {key: i, fallback: h('span', null, '·')}, h(Late, {id: 'g' + i, ms: (i % 7) * 100}, h('span', {'data-cell': i}, i))))),
    // React-specific extras (not in the Preact set): stylesheet / style resources with precedence.
    'css-precedence': () => S('css-prec', 300, [h('link', {key: 'l', rel: 'stylesheet', href: '/slow.css?ms=700', precedence: 'default'}),
      h('div', {key: 'd', id: 'styled', className: 'styled', 'data-testid': 'css-styled'}, 'Styled')]),
    'style-precedence': () => S('style-prec', 300, [h('style', {key: 's', href: 'late-1', precedence: 'default'}, '.sty{display:block;background-color:rgb(0,0,255)}'),
      h('div', {key: 'd', className: 'sty', 'data-testid': 'sty-styled'}, 'Late style')]),
  };
  const DPU_SET = ['html-baseline', 'popcorning', 'nested', 'out-of-order', 'table-rows', 'select-options', 'list-items', 'svg-namespace',
    'mathml-namespace', 'style-hoist', 'inline-script', 'empty', 'multi-root', 'text-only', 'nested-template', 'link-stylesheet',
    'iframe-srcdoc', 'big-boundary', 'patch-interactive', 'client-wins', 'adjacent-boundaries', 'nested-inner-first', 'many-boundaries',
    'zero-delay', 'deep-nesting', 'reverse-order', 'css-precedence', 'style-precedence'];

  // props: {only: string[]|undefined, skip: string[]}
  function App({only, skip}) {
    let ids = only && only.length ? only : DPU_SET;
    ids = ids.filter(id => SC[id] && !(skip || []).includes(id));
    return h('html', {lang: 'en'},
      h('head', null, h('meta', {charSet: 'utf-8'}),
        h('script', {dangerouslySetInnerHTML: {__html: RECORDER}}),
        ctx.polyfill ? h('script', {src: '/polyfill.js'}) : null,
        h('title', null, 'react dpu')),
      h('body', null,
        h('div', {id: 'root'}, ids.map(id => h('section', {key: id, 'data-scenario': id, className: 'card'},
          h('h3', null, id), h('div', {'data-slot': 'stage'}, SC[id]())))),
        ctx.hydrate === 'late' ? h('script', {src: '/client.js', defer: true}) : null));
  }
  return {App, SC, DPU_SET};
};
