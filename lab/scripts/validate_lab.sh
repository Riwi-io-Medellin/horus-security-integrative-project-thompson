#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
API_BASE="${API_BASE:-http://127.0.0.1:3000}"
TARGET_IP="${TARGET_IP:-}"

is_valid_ipv4() {
  local ip="$1"
  [[ "${ip}" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]] || return 1
  IFS='.' read -r o1 o2 o3 o4 <<<"${ip}"
  for octet in "${o1}" "${o2}" "${o3}" "${o4}"; do
    ((octet >= 0 && octet <= 255)) || return 1
  done
  return 0
}

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon no disponible."
  echo "Abre Docker Desktop y luego ejecuta: bash lab/scripts/lab_up.sh"
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -q '^lab-vuln-host$'; then
  echo "El contenedor lab-vuln-host no esta corriendo."
  echo "Ejecuta primero: bash lab/scripts/lab_up.sh"
  exit 1
fi

TARGET_IP="$(echo "${TARGET_IP}" | tr -d '[:space:]')"

if [ -n "${TARGET_IP}" ] && ! is_valid_ipv4 "${TARGET_IP}"; then
  echo "TARGET_IP en entorno invalida (${TARGET_IP}). Se ignora y se intenta autodeteccion."
  TARGET_IP=""
fi

if [ -z "${TARGET_IP}" ]; then
  TARGET_IP="$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' lab-vuln-host 2>/dev/null || true)"
  TARGET_IP="$(echo "${TARGET_IP}" | tr -d '[:space:]')"
fi

if [ -z "${TARGET_IP}" ]; then
  echo "No se pudo resolver TARGET_IP."
  echo "Verifica red del contenedor: docker inspect lab-vuln-host"
  exit 1
fi

if ! is_valid_ipv4 "${TARGET_IP}"; then
  echo "TARGET_IP invalida: ${TARGET_IP}"
  echo "Exporta una IP valida o reinicia el lab:"
  echo "  unset TARGET_IP"
  echo "  bash ${ROOT_DIR}/lab/scripts/lab_up.sh"
  exit 1
fi

if ! curl -sS -m 5 "${API_BASE}/" >/dev/null 2>&1; then
  echo "API Node no responde en ${API_BASE}."
  echo "Inicia backend Node en otra terminal:"
  echo "  cd ${ROOT_DIR}/api && npm run dev"
  exit 1
fi

V2_HEALTH="$(curl -sS -m 8 "${API_BASE}/api/v2/risk-score" 2>/dev/null || true)"
if echo "${V2_HEALTH}" | grep -qi "Unified API unavailable"; then
  echo "API v2 no disponible (FastAPI en 8001 apagada)."
  echo "Inicia FastAPI en otra terminal:"
  echo "  cd ${ROOT_DIR} && ./.venv/bin/uvicorn api.main:app --host 127.0.0.1 --port 8001"
  exit 1
fi

echo "[1/5] Escaneo profundo contra ${TARGET_IP}"
SCAN_JSON="$(curl -sS -m 180 -X POST "${API_BASE}/api/simulations" \
  -H 'content-type: application/json' \
  -d "{\"target\":\"${TARGET_IP}\"}")"

python3 -c '
import json, sys
data = json.loads(sys.stdin.read())
if data.get("error"):
    print("Error API scan:", data.get("error"))
    sys.exit(1)
ports = [str(p.get("port")) for p in data.get("ports", [])]
hydra = data.get("credential_tests", [])
hits = [h for h in hydra if h.get("status") == "credentials_found"]
print("Puertos detectados:", ", ".join(ports) if ports else "ninguno")
print("Hydra findings:", len(hits))
for h in hits:
    d = h.get("details") or {}
    print(f"  - {h.get('service')}:{h.get('port')} -> {d.get('user')}:{d.get('password')}")
' <<<"${SCAN_JSON}"

echo "[2/5] Simulando comportamiento tipo ransomware"
"${ROOT_DIR}/lab/scripts/simulate_ransomware_safe.sh"

echo "[3/5] Consultando findings unificados"
FINDINGS_JSON="$(curl -sS -m 20 "${API_BASE}/api/v2/findings")"
python3 -c '
import json, sys
data = json.loads(sys.stdin.read())
items = data.get("items", [])
print("Total findings:", data.get("count", len(items)))
for item in items[:8]:
    print(f"  - {item.get('id')[:8]} {item.get('source')} {item.get('finding_type')} {item.get('risk_score')}/100")
' <<<"${FINDINGS_JSON}"

echo "[4/5] Preview + remediacion para telnet_open (si existe)"
FINDING_ID="$(python3 -c '
import json, sys
data = json.loads(sys.stdin.read())
for item in data.get("items", []):
    if item.get("finding_type") == "telnet_open":
        print(item.get("id"))
        break
' <<<"${FINDINGS_JSON}")"

if [ -n "${FINDING_ID}" ]; then
  echo "Preview:"
  curl -sS -m 20 "${API_BASE}/api/v2/remediation/preview/${FINDING_ID}"
  echo
  echo "Remediar:"
  curl -sS -m 20 -X POST "${API_BASE}/api/v2/remediate/${FINDING_ID}" \
    -H 'content-type: application/json' \
    -d '{"os_name":"linux","force":false}'
  echo
else
  echo "No se encontro finding telnet_open en esta corrida."
fi

echo "[5/5] Score de riesgo final"
curl -sS -m 20 "${API_BASE}/api/v2/risk-score"
echo
