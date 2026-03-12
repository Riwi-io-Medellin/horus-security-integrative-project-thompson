# HORUS Documentation (English)

## 1) What HORUS Is
HORUS is a cybersecurity platform for controlled network assessment.
It combines network discovery, deep scans, credential testing, AI-assisted analysis, PDF reporting, and audit logging.

Important: use HORUS only on assets you own or are explicitly authorized to test.

## 2) What the Application Does
1. Authenticates users and applies roles.
2. Runs discovery scans and deep scans.
3. Persists scan results in MySQL.
4. Enriches results with AI (OpenAI or Ollama).
5. Generates report artifacts.
6. Registers critical actions in audit logs.

## 3) Architecture Overview
- Frontend: FRONTED/frontend
- Node API (Express): BACKEND/api on port 3000
- Unified security API (FastAPI): BACKEND/api/main.py, exposed through /api/v2 via Node proxy
- Scanner execution: Kali container + orchestration
- Persistence: MySQL 8 schema in BACKEND/database/schema.mysql.sql
- Optional local AI runtime: Ollama profile in docker-compose

## 4) Technology Stack and Why
- Node.js + Express: stable API layer and fast iteration.
- Python + FastAPI: excellent fit for security analytics and orchestration logic.
- Docker Compose: reproducible multi-service setup for dev/stage/prod-like environments.
- MySQL 8: relational consistency for auth, simulations, findings, reporting, and auditability.
- OpenAI/Ollama abstraction: same product flow with cloud or local AI backend.
- Vanilla HTML/CSS/JS frontend: simple runtime and deployment.

## 5) Core Flows
- Discover Network: enumerate active hosts in a CIDR range.
- Deep Scan: inspect one target host in detail.
- AI Analysis: produce risk score and recommendations.
- Reports: generate and share PDF output.
- Admin Panel: user lifecycle and role management.

## 6) Database Model (Production)
Main entities:
- Users, UserProfiles, Roles, UserRoles
- Simulations, Hosts, Ports, Vulnerabilities, CredentialTests
- Reports, AuditLog, AIAnalysisResults

Authoritative SQL schema:
- BACKEND/database/schema.mysql.sql

## 7) Installation Paths
Recommended:
- Linux/macOS: ./install.sh
- Windows PowerShell: ./install.ps1
- Windows CMD: install.bat

The installer validates prerequisites, installs dependencies, creates env template if missing, and starts Docker services.

Detailed steps are in docs/en/QUICK_START.md.

## 8) Essential Configuration
Edit BACKEND/api/.env:
- Database: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- AI selection: AI_PROVIDER=openai or AI_PROVIDER=ollama
- OpenAI: OPENAI_API_KEY, OPENAI_MODEL
- Ollama: OLLAMA_BASE_URL, OLLAMA_MODEL
- Email: SMTP settings for report operations

Default compose ports:
- 3000: UI and Node API
- 8001: FastAPI unified services
- 3309: MySQL
- 5433: PostgreSQL helper service
- 11434: Ollama (optional)

## 9) Production Checklist
- Keep env secrets out of version control.
- Keep target authorization policy strict.
- Place services behind HTTPS reverse proxy.
- Monitor API logs and AuditLog table.
- Back up database volume and report artifacts.
- Keep dependencies patched and pinned.

## 10) Troubleshooting
- Health: GET /api/health
- Unified API quick check: GET /api/v2/risk-score
- Compose validation: docker compose -f docker/docker-compose.yml config
- After changing AI provider or model: docker compose up -d --force-recreate scanner-api

## 11) Legal and Safety
HORUS includes controlled offensive security capabilities.
Unauthorized scanning or credential testing is prohibited.
