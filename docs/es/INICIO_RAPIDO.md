# HORUS Inicio Rápido (Español)

## 1) Requisitos
- Node.js 18+
- npm 9+
- Docker + Docker Compose
- Git
- Python 3 (recomendado)

## 2) Clonar repositorio
~~~bash
git clone https://github.com/69kingDavid69/back-integrative-project.git
cd back-integrative-project
~~~

## 3) Instalar
Linux o macOS:
~~~bash
chmod +x install.sh
./install.sh
~~~

Windows PowerShell:
~~~powershell
.\install.ps1
~~~

Windows CMD:
~~~cmd
install.bat
~~~

## 4) Validar servicios
~~~bash
docker compose -f docker/docker-compose.yml ps
curl -sS http://localhost:3000/api/health
curl -sS http://localhost:3000/api/v2/risk-score
~~~

## 5) Abrir aplicación
- http://localhost:3000

## 6) Configurar IA (opcional)
Editar BACKEND/api/.env y elegir proveedor.

OpenAI:
~~~env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-tu-clave
OPENAI_MODEL=gpt-4o-mini
~~~

Ollama:
~~~env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.1:8b
~~~

Aplicar cambios de IA:
~~~bash
docker compose -f docker/docker-compose.yml up -d --force-recreate scanner-api
~~~

## 7) Prueba funcional inicial
1. Inicia sesión.
2. Ejecuta Descubrir Red.
3. Ejecuta un Escaneo Profundo.
4. Abre el chat IA y verifica estado.
5. Genera un reporte.

## 8) Detener servicios
~~~bash
docker compose -f docker/docker-compose.yml down
~~~
