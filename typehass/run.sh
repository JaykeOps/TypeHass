#!/usr/bin/with-contenv bash
set -euo pipefail

if ! command -v deno >/dev/null 2>&1; then
  echo "Deno is not installed or not on PATH" >&2
  exit 1
fi

exec deno run \
  --unstable-cron \
  --import-map=/app/import_map.json \
  --allow-net=supervisor \
  --allow-env=SUPERVISOR_TOKEN,LOG_LEVEL \
  --allow-read=/app,/config/typehass \
  --allow-write=/config/typehass/sdk,/config/typehass/deno.json,/config/typehass/tsconfig.json \
  /app/src/main.ts
