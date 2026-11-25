set -u
SP=/private/tmp/claude-501/-Users-maxcohen-code-react-ecosystem/e78ade9f-686d-4901-b3a8-7a85501d36b9/scratchpad
cd $SP/next-tee
perl -pi -e 's/^    htmlFirstFlight: false,/    htmlFirstFlight: true,/' packages/next/src/server/config-shared.ts
grep -c "htmlFirstFlight: true," packages/next/src/server/config-shared.ts
pnpm build --filter=next > $SP/e2e-on-build.log 2>&1 || echo BUILD-FAIL
L="$(cat /Users/maxcohen/code/react-ecosystem/next-htmlfirst-bench/tee-round/e2e-suites-52.txt | tr '\n' ' ')"
NEXT_TELEMETRY_DISABLED=1 pnpm test-start-turbo ${=L} > $SP/e2e-on.log 2>&1
echo "E2E-ON: $(grep -E '^Tests:' $SP/e2e-on.log)"; grep -E "^  ● " $SP/e2e-on.log | sort -u | head -30
perl -pi -e 's/^    htmlFirstFlight: true,/    htmlFirstFlight: false,/' packages/next/src/server/config-shared.ts
git diff --stat packages/next/src/server/config-shared.ts
pnpm build --filter=next > $SP/e2e-off-build.log 2>&1 || echo BUILD2-FAIL
NEXT_TELEMETRY_DISABLED=1 pnpm test-start-turbo test/e2e/app-dir/rsc-basic/rsc-basic.test.ts test/e2e/app-dir/actions/app-action.test.ts test/e2e/app-dir/navigation/navigation.test.ts > $SP/e2e-off.log 2>&1
echo "E2E-OFF: $(grep -E '^Tests:' $SP/e2e-off.log)"; grep -E "^  ● " $SP/e2e-off.log | sort -u | head -30
echo DONE
