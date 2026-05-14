FROM ghcr.io/home-assistant/base:latest

ARG BUILD_VERSION=0.1.0

LABEL \
  io.hass.version="${BUILD_VERSION}" \
  io.hass.type="app" \
  io.hass.arch="aarch64|amd64"

ENV LOG_LEVEL=info

WORKDIR /app

RUN apk add --no-cache deno

COPY import_map.json /app/import_map.json
COPY src /app/src
COPY run.sh /run.sh

RUN chmod a+x /run.sh

CMD [ "/run.sh" ]
