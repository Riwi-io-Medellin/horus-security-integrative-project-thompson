#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LAB_COMPOSE_FILE="${ROOT_DIR}/lab/docker-compose.lab.yml"

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon no disponible."
  echo "Abre Docker Desktop y espera a que diga 'Engine running'."
  exit 1
fi

docker compose -f "${LAB_COMPOSE_FILE}" up -d --build

TARGET_IP="$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' lab-vuln-host)"

cat <<EOF
Laboratorio vulnerable levantado.
Container: lab-vuln-host
Target IP: ${TARGET_IP}
Red Docker: lab_net

Siguiente paso (api/.env):
  SCANNER_DOCKER_NETWORK=lab_net
  AUTHORIZED_TARGETS=172.28.10.0/24

Luego reinicia la API Node:
  cd ${ROOT_DIR}/api && npm run dev
EOF
