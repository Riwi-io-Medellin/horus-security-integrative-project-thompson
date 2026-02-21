# Quick Start (EN/ES)

## 1) Requirements / Requisitos
- Node.js 18+
- Docker Desktop running / Docker Desktop en ejecucion
- `kali-redteam` image available / imagen `kali-redteam` disponible

Build image example / Ejemplo para construir imagen:

```bash
docker build -t kali-redteam /Users/user/Desktop/kali-api-project/kali
```

## 2) Install API dependencies / Instalar dependencias API

```bash
cd /Users/user/Desktop/kali-api-project/api
npm install
```

## 3) Configure environment / Configurar entorno
Edit `/Users/user/Desktop/kali-api-project/api/.env`:

```env
SKIP_AUTHORIZATION=true
ALLOW_PUBLIC_TARGETS=false
AUTHORIZED_TARGETS=192.168.10.0/24,10.0.5.0/24
SCAN_PROFILE=fast
NMAP_DEEP_PROBE_TOP_PORTS=200
NMAP_DEEP_TIMEOUT_SEC=180
HYDRA_ENABLED=true
HYDRA_MAX_SERVICES_PER_SCAN=2
HYDRA_MAX_ATTEMPTS=12
HYDRA_MAX_DURATION_SEC=20
HYDRA_COOLDOWN_SEC=120
HYDRA_TASKS=4
HYDRA_STOP_ON_LOCKOUT=true
HYDRA_STOP_ON_RATE_LIMIT=true
```

## 4) Run the app / Ejecutar la aplicacion

```bash
cd /Users/user/Desktop/kali-api-project/api
npm run dev
```

Open / Abrir:
- http://localhost:3000

### Optional: Unified API v2 (for Unified tab)

```bash
cd /Users/user/Desktop/kali-api-project
python3 -m venv .venv
source .venv/bin/activate
pip install -r /Users/user/Desktop/kali-api-project/api/requirements-unified.txt
uvicorn api.main:app --host 0.0.0.0 --port 8001
```

## 5) Basic flow / Flujo basico
1. Click `DETECTAR RED` to auto-fill subnet / Click en `DETECTAR RED` para autocompletar subred.
2. Click `DESCUBRIR` to list active devices / Click en `DESCUBRIR` para listar dispositivos activos.
3. Click `ESCANEAR` on a device for deep scan / Click `ESCANEAR` en un dispositivo para escaneo profundo.
4. Open `PLATAFORMA UNIFICADA` tab for `/api/v2` findings/risk/correlation / Abrir pestaña `PLATAFORMA UNIFICADA` para findings/riesgo/correlacion de `/api/v2`.
5. Review Hydra status badges:
- `SEGURO`
- `CREDENCIALES ENCONTRADAS`
- `LOCKOUT DETECTADO`
- `RATE LIMIT`
- `COOLDOWN ACTIVO`
- `AUTO-STOP`
- `LIMITE POR ESCANEO`
- `HYDRA DESHABILITADO`

## 6) Useful API endpoints / Endpoints utiles
- `GET /api/simulations/network`
- `POST /api/simulations/discover` body: `{ "subnet": "192.168.1.0/24" }`
- `POST /api/simulations` body: `{ "target": "192.168.1.10" }`

## 7) Notes / Notas
- Hydra checks are policy-limited by `.env` / Hydra esta limitado por politica en `.env`.
- `SCAN_PROFILE` can be `fast`, `balanced`, or `full` / `SCAN_PROFILE` puede ser `fast`, `balanced` o `full`.
- Deep scan now uses two phases (fast probe + detailed scan on open ports) / El escaneo profundo ahora usa dos fases (sondeo rapido + detalle sobre puertos abiertos).
- To scan a public IP, set `ALLOW_PUBLIC_TARGETS=true` and include it in `AUTHORIZED_TARGETS` (example: `38.156.230.73/32`) / Para escanear una IP publica, activa `ALLOW_PUBLIC_TARGETS=true` y agregala en `AUTHORIZED_TARGETS` (ejemplo: `38.156.230.73/32`).
- Use only with explicit authorization / Usar solo con autorizacion explicita.

## 8) Vulnerable Docker Lab (Nmap + Hydra + Anti-Ransomware)
See:
- `/Users/user/Desktop/kali-api-project/LAB_DOCKER.md`

Quick launch:
```bash
cd /Users/user/Desktop/kali-api-project
bash lab/scripts/lab_up.sh
```
