# Unified Security Platform

This repository now includes an additive unified security layer that does not replace the existing scanner frontend/API.

## New modules
- `scanner/`: Docker Kali wrapper and scan profiles
- `parsers/`: Nmap XML and Hydra output parsers
- `engine/`: central analysis, correlation, risk scoring, remediation, ML fallback stack
- `agent/`: endpoint watcher, honeypots, entropy analysis, process telemetry, Swift placeholders
- `api/main.py`: FastAPI unified API under `/api/v2`
- `tests/`: parser, engine, correlation, remediation, inference tests

## Run unified API
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r api/requirements-unified.txt
uvicorn api.main:app --host 0.0.0.0 --port 8001
```

## API endpoints
- `POST /api/v2/scan/network`
- `GET /api/v2/scan/status/{scan_id}`
- `GET /api/v2/findings`
- `GET /api/v2/risk-score`
- `GET /api/v2/risk-explanation`
- `POST /api/v2/remediate/{finding_id}`
- `GET /api/v2/remediation/preview/{finding_id}`
- `POST /api/v2/agent/event`
- `GET /api/v2/correlations`
- `WS /api/v2/ws/stream`

## Safety defaults
- `AUTO_REMEDIATION=false`
- Remediation requires preview/approval for gated playbooks.
- Inference falls back to heuristics if models are unavailable.
