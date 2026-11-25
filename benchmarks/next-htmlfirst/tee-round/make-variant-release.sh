#!/bin/bash
# usage: make-variant-release.sh <name> <release dir> <next tgz basename> <template|cc-app> <htmlFirstFlight true|false>
# Like make-variant.sh, but installs by path from a release dir (react-html-first-flight.tgz etc.), so the tested files are the released files.
set -euo pipefail
H=/Users/maxcohen/code/react-ecosystem/next-htmlfirst-bench
N=$1; D=$2; NX=$3; APP=$4; HF=$5; O=$H/.build/$N
rm -rf $O; mkdir -p $O; cp -R $H/tee-round/$APP/app $O/app
CCF=""; [ "$APP" = cc-app ] && CCF="cacheComponents: true, "
echo "export default { ${CCF}experimental: { htmlFirstFlight: $HF } };" > $O/next.config.mjs
cat > $O/package.json <<EOP
{ "name": "bench-$N", "private": true,
  "dependencies": { "next": "file:$D/$NX", "react": "file:$D/react-html-first-flight.tgz", "react-dom": "file:$D/react-dom-html-first-flight.tgz" },
  "overrides": { "react": "file:$D/react-html-first-flight.tgz", "react-dom": "file:$D/react-dom-html-first-flight.tgz", "scheduler": "file:$D/scheduler-html-first-flight.tgz" } }
EOP
cd $O
npm install --no-audit --no-fund --legacy-peer-deps --silent 2>&1 | tail -5
NEXT_TELEMETRY_DISABLED=1 npx next build > build.log 2>&1 || { tail -30 build.log; exit 1; }
tail -25 build.log
