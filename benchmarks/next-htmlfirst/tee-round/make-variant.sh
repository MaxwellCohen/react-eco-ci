#!/bin/bash
# usage: make-variant.sh <name> <tgz dir with next.tgz, react.tgz, react-dom.tgz, scheduler.tgz> <template|cc-app> <htmlFirstFlight true|false>
# Builds a bench app into ../.build/<name> (next build, Turbopack).
set -euo pipefail
H=/Users/maxcohen/code/react-ecosystem/next-htmlfirst-bench
N=$1; D=$2; APP=$3; HF=$4; O=$H/.build/$N
rm -rf $O; mkdir -p $O; cp -R $H/tee-round/$APP/app $O/app
CC=false; [ "$APP" = cc-app ] && CC=true
echo "export default { ${CC:+$([ $CC = true ] && echo 'cacheComponents: true, ')}experimental: { htmlFirstFlight: $HF } };" > $O/next.config.mjs
cat > $O/package.json <<EOF
{ "name": "bench-$N", "private": true,
  "dependencies": { "next": "file:$D/next.tgz", "react": "file:$D/react.tgz", "react-dom": "file:$D/react-dom.tgz" },
  "overrides": { "react": "file:$D/react.tgz", "react-dom": "file:$D/react-dom.tgz", "scheduler": "file:$D/scheduler.tgz" } }
EOF
cd $O
npm install --no-audit --no-fund --legacy-peer-deps --silent 2>&1 | tail -5
NEXT_TELEMETRY_DISABLED=1 npx next build > build.log 2>&1 || { tail -30 build.log; exit 1; }
tail -25 build.log
