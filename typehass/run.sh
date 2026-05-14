#!/usr/bin/env bash
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
  --allow-write=/config/typehass/generated \
  /app/src/main.ts
