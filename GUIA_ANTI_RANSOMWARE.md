# Guia Simple: Como te Protege esta Plataforma Contra Ransomware

## 1) Que hace esta integracion
Esta plataforma junta dos miradas:

- **Red**: revisa que puertas de entrada tiene tu infraestructura (puertos, servicios inseguros, credenciales debiles).
- **Equipo/endpoint**: observa comportamiento de archivos para detectar senales de cifrado malicioso.

La idea no es solo "ver puertos", sino **detectar ataques reales en progreso** y darte prioridad clara.

## 2) En palabras simples: como detecta un posible ransomware
El sistema se fija en senales como:

- Muchos archivos cambiando en pocos segundos.
- Archivos que pasan a verse como "cifrados" (contenido aleatorio).
- Intento de tocar archivos trampa (honeypots).
- Intento de borrar copias de respaldo.
- Servicios de red expuestos que facilitan propagacion (como SMB viejo o RDP abierto).

Cuando varias de esas senales aparecen juntas, el riesgo sube rapido.

## 3) Que es la correlacion (lo mas importante)
Correlacion significa: **unir piezas de evidencia**.

Ejemplo practico:

- En red aparece SMBv1 activo (riesgo de propagacion).
- En el endpoint aparece cifrado masivo de archivos.
- Tambien hay intento de borrar respaldos.

Si las 3 pasan al mismo tiempo, se dispara una alerta tipo **WANNA_CRY_PATTERN**.

Eso evita falsos positivos, porque no depende de una sola senal aislada.

## 4) Que significan los datos de la pantalla
- **Riesgo unificado (0-100)**: resumen general de peligro.
- **Endpoint score**: riesgo por comportamiento dentro del equipo.
- **Network score**: riesgo por exposicion de red.
- **Findings**: hallazgos abiertos que debes revisar.
- **Correlaciones**: alertas de patrones peligrosos confirmados por varias senales.

## 5) Como interpretar el puntaje rapido
- **0-24 (Bajo)**: sin evidencia fuerte de ataque activo.
- **25-49 (Medio)**: hay senales que conviene corregir.
- **50-74 (Alto)**: riesgo serio, actuar hoy.
- **75-100 (Critico)**: posible ataque activo, responder de inmediato.

## 6) Que hacer si sube el riesgo
1. Aislar el equipo afectado de la red.
2. Revisar y detener proceso sospechoso.
3. Proteger respaldos y verificar que no se esten borrando.
4. Corregir exposiciones de red (SMBv1, RDP publico, credenciales debiles).
5. Ejecutar re-scan y confirmar que el riesgo baje.

## 7) Endpoint nuevo para entender "por que subio el riesgo"
Ahora tienes este endpoint:

- `GET /api/v2/risk-explanation`

Te devuelve:
- Resumen entendible del riesgo actual.
- Razones principales del puntaje.
- Reglas de correlacion que se activaron.
- Acciones sugeridas inmediatas.

## 8) Limite importante
Si no llegan eventos del agente endpoint, la parte de comportamiento sera baja o nula.
Para protegerte bien contra ransomware necesitas ambas partes activas:

- escaneo de red
- telemetria del endpoint

