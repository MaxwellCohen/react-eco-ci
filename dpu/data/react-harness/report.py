import json, statistics as st, sys, os
R=sys.argv[1]
def med(a):
    a=[x for x in a if x is not None]
    return round(st.median(a)) if a else None
out=[]
c=json.load(open(f'{R}/compare.json'))
ids=list(next(iter(next(iter(c.values())).values()))['checks'].keys())
out.append('## Correctness (28 checks = 26 Preact-port + 2 React-only extras x-*; foreignObject isolated)\n')
for b,cs in c.items():
    out.append(f'### {b}\n')
    keys=list(cs.keys())
    out.append('| check | '+' | '.join(k.replace(' | hydrate=','<br>h=') for k in keys)+' |')
    out.append('|---|'+'---|'*len(keys))
    for i in ids:
        out.append(f'| {i} | '+' | '.join('ok' if cs[k]['checks'][i] else '**FAIL**' for k in keys)+' |')
    out.append('| foreignObject (isolated) | '+' | '.join(str(cs[k]['foreignObject']) for k in keys)+' |')
    out.append('| passed | '+' | '.join(f"{sum(cs[k]['checks'].values())}/{len(ids)}" for k in keys)+' |')
    out.append('| $RP calls / ids that still had template | '+' | '.join(f"{cs[k]['rp']['calls']}/{cs[k]['rp']['hadTemplate']}" if cs[k]['rp'] else '-' for k in keys)+' |')
    out.append('| leftover template[for] / fallbacks | '+' | '.join(f"{cs[k]['leftoverTemplates']}/{cs[k]['leftoverFallbacks']}" for k in keys)+' |')
    out.append('| page errors / recoverable | '+' | '.join(f"{len(cs[k]['errors'])}/{len(cs[k]['recoverable'] or [])}" for k in keys)+' |\n')
for sc,title in [('popcorn','popcorning (16)'),('many','many-boundaries (60)'),('grid','grid-100 (100)')]:
    out.append(f'## Timing: {title} — median of runs (ms)\n')
    for b in ['chromium','firefox','webkit']:
        p=f'{R}/bench-{b}.json'
        if not os.path.exists(p): out.append(f'{b}: NOT RUN\n'); continue
        d=json.load(open(p))
        out.append(f'### {b} {d["version"]} (n={d["runs"]})\n')
        out.append('| variant | TTFB | FCP | lag median | lag p95 | lag max | last visible | longest stall | never shown | leftover tpl |')
        out.append('|---|---|---|---|---|---|---|---|---|---|')
        for v,o in d['variants'].items():
            r=[x for x in o[sc] if not x.get('hung')]
            f=lambda k: med([x.get(k) for x in r])
            out.append(f"| {v} | {f('ttfb')} | {f('fcp')} | {f('lagMedian')} | {f('lagP95')} | {f('lagMax')} | {f('lastVisible')} | {f('maxGap')} | {sum(x['missing'] for x in r)} | {sum(x['leftoverTpl'] for x in r)} |"+(f" hung={len(o[sc])-len(r)}" if len(r)<len(o[sc]) else ''))
        out.append('')
out.append('## patch-interactive: gap between patched counter visible and first click registering (median ms)\n')
for b in ['chromium','firefox','webkit']:
    p=f'{R}/bench-{b}.json'
    if not os.path.exists(p): continue
    d=json.load(open(p)); out.append(f'### {b}\n'); out.append('| variant | hydrate | visible at | gap | never interactive |'); out.append('|---|---|---|---|---|')
    for v,o in d['variants'].items():
        for m in ['late','early']:
            r=o['interactive'][m]; ok=[x for x in r if x.get('gap') is not None]
            out.append(f"| {v} | {m} | {med([x['visible'] for x in r if 'visible' in x])} | {med([x['gap'] for x in ok])} | {len(r)-len(ok)}/{len(r)} |")
    out.append('')
print('\n'.join(out))
