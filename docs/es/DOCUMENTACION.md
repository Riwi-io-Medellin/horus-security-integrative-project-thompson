# Documentación HORUS (Español)

## 1) Qué es HORUS
HORUS es una plataforma de ciberseguridad para evaluación controlada de redes.
Integra descubrimiento de red, escaneo profundo, pruebas de credenciales, análisis IA, reportes y auditoría.

Importante: usar solo sobre activos propios o con autorización explícita.

## 2) Qué hace la aplicación
1. Autentica usuarios y aplica roles.
2. Ejecuta descubrimiento y escaneo profundo.
3. Guarda resultados en MySQL.
4. Enriquece resultados con IA (OpenAI u Ollama).
5. Genera reportes.
6. Registra acciones críticas en auditoría.

## 3) Arquitectura general
- Frontend: FRONTED/frontend
- API Node (Express): BACKEND/api en puerto 3000
- API unificada (FastAPI): BACKEND/api/main.py, publicada por proxy en /api/v2
- Motor de escaneo: contenedor Kali + orquestación
- Persistencia: MySQL 8 con esquema en BACKEND/database/schema.mysql.sql
- IA local opcional: perfil Ollama en docker-compose

## 4) Tecnologías y por qué
- Node.js + Express: capa API estable y rápida para evolucionar.
- Python + FastAPI: ideal para análisis de seguridad y orquestación.
- Docker Compose: entorno reproducible multi-servicio.
- MySQL 8: consistencia relacional para autenticación, escaneos, hallazgos y auditoría.
- Abstracción OpenAI/Ollama: mismo flujo funcional con IA en nube o local.
- Frontend HTML/CSS/JS: despliegue simple y liviano.

## 5) Flujos principales
- Descubrir Red: enumera hosts activos en una subred CIDR.
- Escaneo Profundo: inspecciona un objetivo en detalle.
- Análisis IA: calcula riesgo y propone recomendaciones.
- Reportes: genera y comparte resultados.
- Panel Admin: gestión de usuarios y roles.

## 6) Modelo de datos (producción)
Entidades principales:
- Users, UserProfiles, Roles, UserRoles
- Simulations, Hosts, Ports, Vulnerabilities, CredentialTests
- Reports, AuditLog, AIAnalysisResults

Esquema SQL oficial:
- BACKEND/database/schema.mysql.sql

## 7) Instalación
Recomendado:
- Linux/macOS: ./install.sh
- Windows PowerShell: ./install.ps1
- Windows CMD: install.bat

El instalador valida prerequisitos, instala dependencias, crea plantilla de entorno y levanta Docker.

Pasos detallados en docs/es/INICIO_RAPIDO.md.

## 8) Configuración esencial
Editar BACKEND/api/.env:
- Base de datos: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- Proveedor IA: AI_PROVIDER=openai o AI_PROVIDER=ollama
- OpenAI: OPENAI_API_KEY, OPENAI_MODEL
- Ollama: OLLAMA_BASE_URL, OLLAMA_MODEL
- Correo: variables SMTP para reportes

Puertos por defecto:
- 3000: UI y API Node
- 8001: FastAPI
- 3309: MySQL
- 5433: PostgreSQL auxiliar
- 11434: Ollama opcional

## 9) Checklist de producción
- No subir secretos del entorno al repositorio.
- Mantener políticas de autorización de objetivos.
- Publicar detrás de proxy inverso HTTPS.
- Monitorear logs y tabla AuditLog.
- Respaldar volumen de base de datos y artefactos.
- Mantener dependencias actualizadas y fijadas.

## 10) Troubleshooting
- Salud: GET /api/health
- Validación API unificada: GET /api/v2/risk-score
- Validar compose: docker compose -f docker/docker-compose.yml config
- Si cambias modelo/proveedor IA: docker compose up -d --force-recreate scanner-api

## 11) Seguridad y uso legal
HORUS incluye capacidades de seguridad ofensiva para entornos controlados.
Queda prohibido el uso no autorizado.
