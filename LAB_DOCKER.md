# Laboratorio Docker Vulnerable (Validacion Real)

Este laboratorio crea un objetivo vulnerable para validar tu plataforma unificada:

- Deteccion de puertos y servicios inseguros con Nmap.
- Deteccion de credenciales debiles con Hydra.
- Deteccion de comportamiento tipo ransomware via eventos de agente.

## 1) Levantar laboratorio

```bash
cd /Users/user/Desktop/kali-api-project
bash lab/scripts/lab_up.sh
```

Servicio vulnerable:
- Contenedor: `lab-vuln-host`
- IP fija en red Docker: `172.28.10.10`
- Servicios expuestos intencionalmente: `21(FTP)`, `23(Telnet)`, `445(SMB)`
- Credenciales debiles: `admin:admin`, `user:password`

## 2) Configurar scanner para red Docker del lab

Edita `/Users/user/Desktop/kali-api-project/api/.env`:

```env
SCANNER_DOCKER_NETWORK=lab_net
AUTHORIZED_TARGETS=172.28.10.0/24
KALI_CONTAINER=kali-redteam
```

Luego reinicia API Node:

```bash
cd /Users/user/Desktop/kali-api-project/api
npm run dev
```

Si usas API v2 (FastAPI), inicala tambien:

```bash
cd /Users/user/Desktop/kali-api-project
./.venv/bin/uvicorn api.main:app --host 127.0.0.1 --port 8001
```

## 3) Validacion automatica end-to-end

```bash
cd /Users/user/Desktop/kali-api-project
bash lab/scripts/validate_lab.sh
```

Que valida:
- Escaneo profundo a `lab-vuln-host`.
- Hallazgos de red (telnet/ftp/smb y score de riesgo).
- Hallazgos Hydra (credenciales encontradas, si aplica).
- Simulacion segura de comportamiento ransomware.
- Riesgo unificado y findings en `/api/v2`.
- Preview y remediacion para `telnet_open`.

## 4) Simulacion ransomware segura (manual)

```bash
cd /Users/user/Desktop/kali-api-project
API_BASE=http://127.0.0.1:3000 bash lab/scripts/simulate_ransomware_safe.sh
```

Esta simulacion:
- Modifica archivos de prueba en `/srv/labdata/ransom_test` dentro del contenedor.
- Envia telemetria de alto riesgo a `/api/v2/agent/event`.
- No ejecuta malware real.

## 5) Remediacion: que esperar hoy

En la UI, boton `REMEDIAR`:
- Ejecuta `POST /api/v2/remediate/{finding_id}`.
- Por defecto (`AUTO_REMEDIATION=false`) queda **EN COLA** para aprobacion manual.
- Se registra en auditoria: `/Users/user/Desktop/kali-api-project/engine/remediation_audit.log`.

`PREVIEW` te muestra el playbook/comando recomendado para validar correccion.

## 6) Apagar laboratorio

```bash
cd /Users/user/Desktop/kali-api-project
bash lab/scripts/lab_down.sh
```

## 7) Troubleshooting rapido

### Error: `No se pudo resolver TARGET_IP`
Significa que `lab-vuln-host` no esta activo.

```bash
docker info
docker ps --format 'table {{.Names}}\t{{.Status}}'
cd /Users/user/Desktop/kali-api-project
bash lab/scripts/lab_up.sh
```

### Node no aparece en puerto 3000

```bash
cd /Users/user/Desktop/kali-api-project/api
npm run dev
```

En otra terminal:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
curl -sS -m 5 http://127.0.0.1:3000/
```

Si no escucha en `3000`, mira el error en la terminal donde corriste `npm run dev`.

### En plataforma unificada sale `0/100`
`0/100` significa que no han entrado eventos reales al motor v2.

Para subir riesgo en laboratorio:
1. En UI unificada lanza escaneo v2 (`LANZAR V2`) al target `172.28.10.10`.
2. Ejecuta simulacion de comportamiento:

```bash
cd /Users/user/Desktop/kali-api-project
bash lab/scripts/simulate_ransomware_safe.sh
```

3. En la UI pulsa `REFRESCAR`.
