#!/bin/bash
# Throwaway check: does profile.siteContent reach every theme, and do the
# defaults still render when it's absent? Run against `pnpm dev -p 3999`.
set -e
URL=http://localhost:3999/api/internal/render
HDR=(-H 'content-type: application/json' -H 'x-internal-token: devtoken')

CUSTOM='{"basicInformation":{"fullName":"Ada Counsel"},"siteContent":{"valuePoints":[{"title":"CUSTOM_VP","description":"vp body"}],"processSteps":[{"title":"CUSTOM_STEP","description":"step body"},{"title":"SECOND_STEP","description":"b"}],"faqs":[{"question":"CUSTOM_Q","answer":"custom a"}]}}'
BARE='{"basicInformation":{"fullName":"Ada Counsel"}}'

fail=0
for theme in classic executive legal-craft; do
  echo "== $theme"
  out=$(curl -s -X POST "$URL" "${HDR[@]}" -d "{\"theme\":\"$theme\",\"profile\":$CUSTOM}")
  for token in CUSTOM_VP CUSTOM_STEP SECOND_STEP CUSTOM_Q '>02<'; do
    if grep -q -- "$token" <<<"$out"; then echo "  ok   custom $token"; else echo "  FAIL custom $token"; fail=1; fi
  done

  def=$(curl -s -X POST "$URL" "${HDR[@]}" -d "{\"theme\":\"$theme\",\"profile\":$BARE}")
  for token in 'Direct Access' 'Initial Consultation' 'Do you offer an initial consultation'; do
    if grep -q -- "$token" <<<"$def"; then echo "  ok   default $token"; else echo "  FAIL default $token"; fail=1; fi
  done
done

[ $fail -eq 0 ] && echo "ALL PASS" || { echo "FAILURES"; exit 1; }
