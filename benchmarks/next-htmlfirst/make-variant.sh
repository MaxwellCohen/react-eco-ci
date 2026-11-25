#!/bin/bash
# usage: make-variant.sh <tgz dir with react*, react-dom*, next*> <name>
# Builds templates/next (react-eco-ci case/next-html-first) against those tarballs into .build/<name>.
set -euo pipefail
H=/Users/maxcohen/code/react-ecosystem/next-htmlfirst-bench
T=/private/tmp/claude-501/-Users-maxcohen-code-react-ecosystem/5561229a-4edd-45c2-875a-8d9fdaacb5b0/scratchpad/eci/templates/next
D=$1; N=$2; O=$H/.build/$N
rm -rf $O; mkdir -p $O; cp -R $T/. $O/
cd $O
node -e "
const fs=require('fs'),path=require('path');
const dir='$D';
const pj=JSON.parse(fs.readFileSync('package.json'));
const urls={};
for(const f of fs.readdirSync(dir)){const n=f.replace(/\.tgz$/,'');urls[n]='file:'+path.join(dir,f);}
for(const k of ['react','react-dom','next'])pj.dependencies[k]=urls[k];
delete pj.dependencies['@opennextjs/cloudflare']; delete pj.devDependencies;
pj.overrides={react:urls.react,'react-dom':urls['react-dom'],scheduler:urls.scheduler};
fs.writeFileSync('package.json',JSON.stringify(pj,null,2));
"
npm install --no-audit --no-fund --legacy-peer-deps --silent 2>&1 | tail -5
NEXT_TELEMETRY_DISABLED=1 npx next build 2>&1 | tail -15
