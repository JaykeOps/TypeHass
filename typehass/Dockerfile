FROM denoland/deno:alpine

ARG BUILD_VERSION=0.1.0

LABEL \
  io.hass.version="${BUILD_VERSION}" \
  io.hass.type="app" \
  io.hass.arch="aarch64|amd64"

ENV LOG_LEVEL=info

WORKDIR /app

COPY import_map.json /app/import_map.json
COPY src /app/src

CMD [
  "run",
  "--unstable-cron",
  "--import-map=/app/import_map.json",
  "--allow-net=supervisor",
  "--allow-env=SUPERVISOR_TOKEN,LOG_LEVEL",
  "--allow-read=/app,/config/typehass",
  "--allow-write=/config/typehass/generated",
  "/app/src/main.ts"
]
