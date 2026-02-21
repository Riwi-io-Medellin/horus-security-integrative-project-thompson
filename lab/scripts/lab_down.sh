#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LAB_COMPOSE_FILE="${ROOT_DIR}/lab/docker-compose.lab.yml"

docker compose -f "${LAB_COMPOSE_FILE}" down -v --remove-orphans
echo "Laboratorio detenido y volumenes eliminados."
