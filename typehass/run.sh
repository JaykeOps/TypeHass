#!/usr/bin/env bash
set -euo pipefail

exec deno run \
  --unstable-cron \
  --import-map=/app/import_map.json \
  --allow-net=supervisor \
  --allow-env=SUPERVISOR_TOKEN,LOG_LEVEL \
  --allow-read=/app,/config/typehass \
  --allow-write=/config/typehass/generated \
  /app/src/main.ts
