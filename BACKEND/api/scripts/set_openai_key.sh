#!/usr/bin/env bash
# Script: set_openai_key.sh
# Purpose: Interactively sets or updates the OPENAI_API_KEY in the API's .env file.
# Usage: ./set_openai_key.sh [API_KEY]
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/BACKEND/api/.env"

if [ ! -f "${ENV_FILE}" ]; then
  echo "Error: .env file not found at ${ENV_FILE}"
  exit 1
fi

OPENAI_KEY="${1:-}"
if [ -z "${OPENAI_KEY}" ]; then
  read -r -s -p "Enter OPENAI_API_KEY: " OPENAI_KEY
  echo
fi

if [ -z "${OPENAI_KEY}" ]; then
  echo "Error: OPENAI_API_KEY is empty. Cancelled."
  exit 1
fi

if ! printf '%s' "${OPENAI_KEY}" | rg -q '^sk-'; then
  echo "Warning: API key does not appear to have the 'sk-' prefix."
fi

if rg -q '^OPENAI_API_KEY=' "${ENV_FILE}"; then
  perl -0pi -e 's/^OPENAI_API_KEY=.*/OPENAI_API_KEY='"${OPENAI_KEY//\//\\/}"'/m' "${ENV_FILE}"
else
  printf '\nOPENAI_API_KEY=%s\n' "${OPENAI_KEY}" >> "${ENV_FILE}"
fi

echo "Success: OPENAI_API_KEY updated in ${ENV_FILE}"
echo "Please restart the Node API to apply changes:"
echo "  cd ${PROJECT_ROOT}/BACKEND/api && npm run dev"
