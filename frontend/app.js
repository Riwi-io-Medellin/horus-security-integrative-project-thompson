// ============================================
// Black Eye — Deep Security Scanner
// ============================================
// EN: Frontend controller for network discovery and deep scan views.
// ES: Controlador frontend para vistas de descubrimiento y escaneo profundo.

const API_BASE = window.location.origin;
const API_SCAN = `${API_BASE}/api/simulations`;
const API_DISCOVER = `${API_BASE}/api/simulations/discover`;
const API_NETWORK = `${API_BASE}/api/simulations/network`;
const API_V2_SCAN_NETWORK = `${API_BASE}/api/v2/scan/network`;
const API_V2_SCAN_STATUS = `${API_BASE}/api/v2/scan/status`;
const API_V2_FINDINGS = `${API_BASE}/api/v2/findings`;
const API_V2_RISK = `${API_BASE}/api/v2/risk-score`;
const API_V2_RISK_EXPLANATION = `${API_BASE}/api/v2/risk-explanation`;
const API_V2_CORRELATIONS = `${API_BASE}/api/v2/correlations`;
const API_V2_REMEDIATE = `${API_BASE}/api/v2/remediate`;
const API_V2_REMEDIATION_PREVIEW = `${API_BASE}/api/v2/remediation/preview`;

// ── DOM Elements ──
const modeTabs = document.getElementById('modeTabs');
const tabDiscover = document.getElementById('tabDiscover');
const tabScan = document.getElementById('tabScan');
const tabUnified = document.getElementById('tabUnified');
const discoverCard = document.getElementById('discoverCard');
const scanCard = document.getElementById('scanCard');
const unifiedCard = document.getElementById('unifiedCard');
const discoveryResults = document.getElementById('discoveryResults');
const scanResults = document.getElementById('scanResults');
const unifiedResults = document.getElementById('unifiedResults');

// Discover
const discoverForm = document.getElementById('discoverForm');
const subnetInput = document.getElementById('subnetInput');
const autoDetectBtn = document.getElementById('autoDetectBtn');
const autoDetectInfo = document.getElementById('autoDetectInfo');
const detectedNetwork = document.getElementById('detectedNetwork');
const detectedIP = document.getElementById('detectedIP');
const subnetValue = document.getElementById('subnetValue');
const hostsUp = document.getElementById('hostsUp');
const hostsTotal = document.getElementById('hostsTotal');
const discoverTime = document.getElementById('discoverTime');
const discoverCmdText = document.getElementById('discoverCmdText');
const devicesBody = document.getElementById('devicesBody');
const devicesEmpty = document.getElementById('devicesEmpty');
const devicesTable = document.getElementById('devicesTable');

// Scan
const scanForm = document.getElementById('scanForm');
const targetInput = document.getElementById('targetInput');
const hostValue = document.getElementById('hostValue');
const hostStatus = document.getElementById('hostStatus');
const portCount = document.getElementById('portCount');
const hydraCount = document.getElementById('hydraCount');
const scanTime = document.getElementById('scanTime');
const nmapCmdText = document.getElementById('nmapCmdText');
const networkGrid = document.getElementById('networkGrid');
const osCard = document.getElementById('osCard');
const osContent = document.getElementById('osContent');
const portsBody = document.getElementById('portsBody');
const portsEmpty = document.getElementById('portsEmpty');
const portsTable = document.getElementById('portsTable');
const traceCard = document.getElementById('traceCard');
const traceBody = document.getElementById('traceBody');
const vulnsCard = document.getElementById('vulnsCard');
const vulnsContent = document.getElementById('vulnsContent');
const hydraCard = document.getElementById('hydraCard');
const hydraCmdLog = document.getElementById('hydraCmdLog');
const hydraCmdText = document.getElementById('hydraCmdText');
const hydraBody = document.getElementById('hydraBody');
const hydraEmpty = document.getElementById('hydraEmpty');
const hydraTable = document.getElementById('hydraTable');
const scriptsCard = document.getElementById('scriptsCard');
const scriptsContent = document.getElementById('scriptsContent');

// Unified
const unifiedScanForm = document.getElementById('unifiedScanForm');
const unifiedTargetInput = document.getElementById('unifiedTargetInput');
const unifiedProfileInput = document.getElementById('unifiedProfileInput');
const unifiedRefreshBtn = document.getElementById('unifiedRefreshBtn');
const unifiedRiskValue = document.getElementById('unifiedRiskValue');
const unifiedEndpointValue = document.getElementById('unifiedEndpointValue');
const unifiedNetworkValue = document.getElementById('unifiedNetworkValue');
const unifiedFindingsCount = document.getElementById('unifiedFindingsCount');
const unifiedCorrCount = document.getElementById('unifiedCorrCount');
const unifiedStatusText = document.getElementById('unifiedStatusText');
const unifiedStatusLog = document.getElementById('unifiedStatusLog');
const unifiedFindingsBody = document.getElementById('unifiedFindingsBody');
const unifiedFindingsTable = document.getElementById('unifiedFindingsTable');
const unifiedFindingsEmpty = document.getElementById('unifiedFindingsEmpty');
const unifiedCorrBody = document.getElementById('unifiedCorrBody');
const unifiedCorrTable = document.getElementById('unifiedCorrTable');
const unifiedCorrEmpty = document.getElementById('unifiedCorrEmpty');
const unifiedExplainSummary = document.getElementById('unifiedExplainSummary');
const unifiedExplainReasons = document.getElementById('unifiedExplainReasons');
const unifiedExplainReasonsEmpty = document.getElementById('unifiedExplainReasonsEmpty');
const unifiedExplainActions = document.getElementById('unifiedExplainActions');
const unifiedExplainActionsEmpty = document.getElementById('unifiedExplainActionsEmpty');
const unifiedExplainMeta = document.getElementById('unifiedExplainMeta');

// Loading & Error
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const loadingDetails = document.getElementById('loadingDetails');
const errorToast = document.getElementById('errorToast');
const errorMessage = document.getElementById('errorMessage');
const errorClose = document.getElementById('errorClose');

// ── Current Mode ──
let currentMode = 'discover';
let unifiedLastScanId = null;
let unifiedPollingTimer = null;

// ── Tab Switching ──
modeTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    const mode = btn.dataset.mode;
    if (mode === currentMode) return;
    currentMode = mode;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    if (mode === 'discover') {
        discoverCard.style.display = '';
        scanCard.style.display = 'none';
        unifiedCard.style.display = 'none';
        scanResults.classList.remove('active');
        unifiedResults.classList.remove('active');
    } else if (mode === 'scan') {
        discoverCard.style.display = 'none';
        scanCard.style.display = '';
        unifiedCard.style.display = 'none';
        discoveryResults.classList.remove('active');
        unifiedResults.classList.remove('active');
    } else {
        discoverCard.style.display = 'none';
        scanCard.style.display = 'none';
        unifiedCard.style.display = '';
        discoveryResults.classList.remove('active');
        scanResults.classList.remove('active');
        unifiedResults.classList.add('active');
        refreshUnifiedDashboard();
    }
});

// ── Validation / Validacion ──
// EN: Client-side format checks to avoid unnecessary API calls.
// ES: Validaciones de formato en cliente para evitar llamadas innecesarias.
function isValidIP(ip) {
    return /^(25[0-5]|2[0-4]\d|[01]?\d\d?)(\.(25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/.test(ip.trim());
}
function isValidSubnet(subnet) {
    return /^(25[0-5]|2[0-4]\d|[01]?\d\d?)(\.(25[0-5]|2[0-4]\d|[01]?\d\d?)){3}\/(2[0-9]|3[0-2]|[1][0-9]|[0-9])$/.test(subnet.trim());
}

// ── Loading / Carga ──
function showLoading(text, details) {
    loadingText.textContent = text || 'Escaneando...';
    loadingDetails.innerHTML = details || '';
    loadingOverlay.classList.add('active');
}
function hideLoading() { loadingOverlay.classList.remove('active'); }

// ── Error / Errores ──
let errorTimeout = null;
function showError(msg) {
    errorMessage.textContent = msg;
    errorToast.classList.add('active');
    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(() => hideError(), 6000);
}
function hideError() { errorToast.classList.remove('active'); clearTimeout(errorTimeout); }
errorClose.addEventListener('click', hideError);

// ── Utility / Utilidad: create badge / crear badge ──
function badge(text, type) {
    const s = document.createElement('span');
    s.className = `badge badge--${type}`;
    s.textContent = text;
    return s;
}

// ── Risk Bar / Barra de Riesgo ──
function createRiskBar(score) {
    const c = document.createElement('div');
    c.className = 'risk-bar';
    let level = score >= 7 ? 'high' : score >= 4 ? 'medium' : 'low';
    const track = document.createElement('div');
    track.className = 'risk-bar__track';
    const fill = document.createElement('div');
    fill.className = `risk-bar__fill risk-bar__fill--${level}`;
    fill.style.width = '0%';
    track.appendChild(fill);
    const sc = document.createElement('span');
    sc.className = `risk-bar__score risk-bar__score--${level}`;
    sc.textContent = `${score}/10`;
    c.appendChild(track);
    c.appendChild(sc);
    requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = `${(score / 10) * 100}%`; }));
    return c;
}

// ── Network info tile / Tarjeta de info de red ──
function createInfoTile(label, value) {
    const d = document.createElement('div');
    d.className = 'network-tile';
    d.innerHTML = `<span class="network-tile__label">${label}</span><span class="network-tile__value">${value || '--'}</span>`;
    return d;
}

// ═══════════════════════════════════════
// AUTO-DETECT NETWORK
// ═══════════════════════════════════════
autoDetectBtn.addEventListener('click', async () => {
    try {
        const res = await fetch(API_NETWORK);
        if (!res.ok) throw new Error('No se pudo detectar la red');
        const data = await res.json();
        if (data.networks && data.networks.length > 0) {
            const net = data.networks[0];
            subnetInput.value = net.subnet;
            detectedNetwork.textContent = net.subnet;
            detectedIP.textContent = `${net.ip} (${net.interface})`;
            autoDetectInfo.style.display = 'flex';
        } else {
            showError('No se detectaron interfaces de red activas');
        }
    } catch (err) {
        showError(err.message);
    }
});

// ═══════════════════════════════════════
// NETWORK DISCOVERY
// ═══════════════════════════════════════
function renderDiscoveryResults(data) {
    // EN: Update summary metrics and command log.
    // ES: Actualizar metricas resumen y log del comando.
    subnetValue.textContent = data.subnet || '--';
    hostsUp.textContent = data.hosts_up || 0;
    hostsTotal.textContent = data.hosts_total || 0;
    discoverTime.textContent = data.scan_time ? `${data.scan_time}s` : '--';
    discoverCmdText.textContent = data.nmap_command || '--';

    if (Array.isArray(data.warnings) && data.warnings.length > 0) {
        showError(data.warnings[0]);
    }

    devicesBody.innerHTML = '';
    if (!data.devices || data.devices.length === 0) {
        devicesTable.querySelector('thead').style.display = 'none';
        devicesEmpty.style.display = 'block';
        discoveryResults.classList.add('active');
        return;
    }
    devicesTable.querySelector('thead').style.display = '';
    devicesEmpty.style.display = 'none';

    data.devices.forEach((d, i) => {
        const row = document.createElement('tr');
        row.style.animation = `fadeSlideUp 0.4s ease ${i * 0.05}s both`;
        row.innerHTML = `
            <td>${d.ip}</td>
            <td>${d.hostname || '--'}</td>
            <td>${d.mac || '--'}</td>
            <td>${d.vendor || '--'}</td>
            <td></td>
        `;
        const scanLink = document.createElement('button');
        scanLink.className = 'btn-scan-device';
        scanLink.type = 'button';
        scanLink.textContent = 'ESCANEAR';
        scanLink.addEventListener('click', (event) => {
            event.preventDefault();
            tabScan.click();
            targetInput.value = d.ip;
            launchDeepScan(d.ip);
        });
        row.lastElementChild.appendChild(scanLink);
        devicesBody.appendChild(row);
    });
    discoveryResults.classList.add('active');
}

async function launchDiscovery(subnet) {
    // EN: Network-discovery request lifecycle.
    // ES: Flujo de solicitud para descubrimiento de red.
    showLoading('Descubriendo dispositivos...', `Escaneando ${subnet} con Nmap ping scan`);
    hideError();
    try {
        const res = await fetch(API_DISCOVER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subnet })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Error del servidor (${res.status})`);
        }
        renderDiscoveryResults(await res.json());
    } catch (err) {
        showError(err.message);
    } finally {
        hideLoading();
    }
}

discoverForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const subnet = subnetInput.value.trim();
    if (!subnet) { subnetInput.classList.add('input--error'); showError('Ingresa una subred CIDR'); setTimeout(() => subnetInput.classList.remove('input--error'), 600); return; }
    if (!isValidSubnet(subnet)) { subnetInput.classList.add('input--error'); showError('Formato invalido. Usa CIDR, ej: 192.168.1.0/24'); setTimeout(() => subnetInput.classList.remove('input--error'), 600); return; }
    launchDiscovery(subnet);
});
subnetInput.addEventListener('input', () => subnetInput.classList.remove('input--error'));

// ═══════════════════════════════════════
// DEEP SCAN
// ═══════════════════════════════════════

function renderNetworkInfo(data) {
    const info = data.network_info || {};
    networkGrid.innerHTML = '';

    const tiles = [
        ['IP del Host', info.host_ip],
        ['Hostname', info.hostname],
        ['MAC', info.mac_address],
        ['Fabricante', info.mac_vendor],
        ['Tipo de Dispositivo', info.device_type],
        ['Puertos Abiertos', info.open_ports_count],
        ['Saltos Traceroute', info.traceroute_hops],
        ['Vulnerabilidades', info.vulnerabilities_count],
        ['Nmap Version', data.nmap_version],
        ['Servicios Detectados', (info.services_detected || []).join(', ') || 'Ninguno']
    ];

    tiles.forEach(([label, val]) => networkGrid.appendChild(createInfoTile(label, val)));
}

function renderOSDetection(data) {
    const os = data.os_detection;
    const allOS = data.network_info?.all_os_matches || [];

    if (!os && allOS.length === 0) { osCard.style.display = 'none'; return; }

    osCard.style.display = '';
    osContent.innerHTML = '';

    if (os) {
        const main = document.createElement('div');
        main.className = 'os-main';
        main.innerHTML = `
            <div class="os-main__name">${os.name}</div>
            <div class="os-main__details">
                <span>Precision: ${os.accuracy}%</span>
                ${os.os_family ? `<span>Familia: ${os.os_family}</span>` : ''}
                ${os.vendor ? `<span>Fabricante: ${os.vendor}</span>` : ''}
                ${os.type ? `<span>Tipo: ${os.type}</span>` : ''}
                ${os.cpe ? `<span>CPE: ${os.cpe}</span>` : ''}
            </div>
        `;
        osContent.appendChild(main);
    }

    if (allOS.length > 1) {
        const othersTitle = document.createElement('p');
        othersTitle.className = 'os-others-title';
        othersTitle.textContent = 'Otras coincidencias:';
        osContent.appendChild(othersTitle);

        allOS.slice(1, 5).forEach(m => {
            const row = document.createElement('div');
            row.className = 'os-other-match';
            row.innerHTML = `<span>${m.name}</span><span class="os-other-match__accuracy">${m.accuracy}%</span>`;
            osContent.appendChild(row);
        });
    }
}

function renderPorts(ports) {
    portsBody.innerHTML = '';
    if (!ports || ports.length === 0) {
        portsTable.querySelector('thead').style.display = 'none';
        portsEmpty.style.display = 'block';
        return;
    }
    portsTable.querySelector('thead').style.display = '';
    portsEmpty.style.display = 'none';

    ports.forEach((p, i) => {
        const row = document.createElement('tr');
        row.style.animation = `fadeSlideUp 0.4s ease ${i * 0.05}s both`;

        const stateCell = document.createElement('td');
        stateCell.appendChild(badge(p.state || 'unknown', p.state === 'open' ? 'open' : p.state === 'closed' ? 'closed' : 'filtered'));

        row.innerHTML = `<td>${p.port}/${p.protocol || 'tcp'}</td>`;
        row.appendChild(stateCell);

        const svcCell = document.createElement('td');
        svcCell.textContent = p.service || '--';
        row.appendChild(svcCell);

        const prodCell = document.createElement('td');
        prodCell.textContent = p.product || '--';
        row.appendChild(prodCell);

        const verCell = document.createElement('td');
        verCell.textContent = p.version || '--';
        row.appendChild(verCell);

        const infoCell = document.createElement('td');
        infoCell.textContent = p.extra_info || (p.cpe ? p.cpe : '--');
        row.appendChild(infoCell);

        portsBody.appendChild(row);
    });
}

function renderTraceroute(trace) {
    if (!trace || trace.length === 0) { traceCard.style.display = 'none'; return; }
    traceCard.style.display = '';
    traceBody.innerHTML = '';
    trace.forEach((h, i) => {
        const row = document.createElement('tr');
        row.style.animation = `fadeSlideUp 0.3s ease ${i * 0.04}s both`;
        row.innerHTML = `
            <td>${h.ttl}</td>
            <td>${h.ip || '--'}</td>
            <td>${h.hostname || '--'}</td>
            <td>${h.rtt ? h.rtt + ' ms' : '--'}</td>
        `;
        traceBody.appendChild(row);
    });
}

function renderVulnerabilities(vulns) {
    if (!vulns || vulns.length === 0) { vulnsCard.style.display = 'none'; return; }
    vulnsCard.style.display = '';
    vulnsContent.innerHTML = '';
    vulns.forEach(v => {
        const d = document.createElement('div');
        d.className = `vuln-item vuln-item--${v.severity}`;
        d.innerHTML = `
            <div class="vuln-item__header">
                <span class="vuln-item__id">${v.script_id}</span>
                <span class="vuln-item__severity">${v.severity.toUpperCase()}</span>
            </div>
            <pre class="vuln-item__output">${v.output}</pre>
        `;
        vulnsContent.appendChild(d);
    });
}

function renderHydra(credentialTests, hydraCommands) {
    // EN: Render Hydra execution details and defensive-signal states.
    // ES: Mostrar resultados de Hydra y estados de senales defensivas.
    hydraBody.innerHTML = '';

    // Show Hydra commands
    if (hydraCommands && hydraCommands.length > 0) {
        hydraCmdLog.style.display = '';
        hydraCmdText.textContent = hydraCommands.map(c => `[Puerto ${c.port}/${c.service}] ${c.command}`).join('\n');
    } else {
        hydraCmdLog.style.display = 'none';
    }

    if (!credentialTests || credentialTests.length === 0) {
        hydraTable.querySelector('thead').style.display = 'none';
        hydraEmpty.style.display = 'block';
        return;
    }
    hydraTable.querySelector('thead').style.display = '';
    hydraEmpty.style.display = 'none';

    const getHydraBadge = (status) => {
        switch (status) {
            case 'credentials_found':
                return ['CREDENCIALES ENCONTRADAS', 'creds-found'];
            case 'lockout_detected':
                return ['LOCKOUT DETECTADO', 'alert'];
            case 'rate_limited':
                return ['RATE LIMIT', 'warning'];
            case 'max_duration_reached':
                return ['MAX DURACION', 'warning'];
            case 'skipped_cooldown':
                return ['COOLDOWN ACTIVO', 'paused'];
            case 'skipped_auto_stop':
                return ['AUTO-STOP', 'paused'];
            case 'skipped_service_limit':
                return ['LIMITE POR ESCANEO', 'paused'];
            case 'skipped_disabled':
                return ['HYDRA DESHABILITADO', 'paused'];
            case 'hydra_error':
                return ['ERROR HYDRA', 'error'];
            default:
                return ['SEGURO', 'no-creds'];
        }
    };

    credentialTests.forEach((ct, i) => {
        const row = document.createElement('tr');
        row.style.animation = `fadeSlideUp 0.4s ease ${i * 0.08}s both`;

        const portCell = document.createElement('td');
        portCell.textContent = ct.port;

        const svcCell = document.createElement('td');
        svcCell.textContent = ct.service || '--';

        const statusCell = document.createElement('td');
        const [label, type] = getHydraBadge(ct.status);
        statusCell.appendChild(badge(label, type));

        const riskCell = document.createElement('td');
        riskCell.appendChild(createRiskBar(ct.risk_score));

        const detailCell = document.createElement('td');
        if (ct.details) {
            detailCell.innerHTML = `<span class="cred-detail">${ct.details.user}:${ct.details.password}</span>`;
        } else if (ct.output_summary) {
            detailCell.textContent = ct.output_summary.substring(0, 80);
        } else {
            detailCell.textContent = 'Sin hallazgos';
        }

        row.appendChild(portCell);
        row.appendChild(svcCell);
        row.appendChild(statusCell);
        row.appendChild(riskCell);
        row.appendChild(detailCell);
        hydraBody.appendChild(row);
    });
}

function renderHostScripts(scripts) {
    if (!scripts || scripts.length === 0) { scriptsCard.style.display = 'none'; return; }
    scriptsCard.style.display = '';
    scriptsContent.innerHTML = '';
    scripts.forEach(s => {
        const d = document.createElement('div');
        d.className = 'script-item';
        d.innerHTML = `
            <div class="script-item__id">${s.id}</div>
            <pre class="script-item__output">${s.output}</pre>
        `;
        scriptsContent.appendChild(d);
    });
}

function renderScanResults(data) {
    // EN: Render full deep-scan response in all cards/tables.
    // ES: Renderizar la respuesta completa del escaneo profundo en tarjetas/tablas.
    // Info bar
    hostValue.textContent = data.hostname ? `${data.host} (${data.hostname})` : (data.host || '--');
    hostStatus.textContent = data.status === 'up' ? 'ACTIVO' : (data.status === 'down' ? 'INACTIVO' : data.status);
    hostStatus.className = `info-bar__value ${data.status === 'up' ? 'info-bar__value--up' : 'info-bar__value--down'}`;
    portCount.textContent = (data.ports || []).filter(p => p.state === 'open').length;
    hydraCount.textContent = (data.credential_tests || []).length;
    scanTime.textContent = data.scan_time ? `${data.scan_time}s` : '--';

    // Nmap command
    nmapCmdText.textContent = data.nmap_command || '--';

    // Render all sections
    renderNetworkInfo(data);
    renderOSDetection(data);
    renderPorts(data.ports);
    renderTraceroute(data.traceroute);
    renderVulnerabilities(data.vulnerabilities);
    renderHydra(data.credential_tests, data.hydra_commands);
    renderHostScripts(data.host_scripts);

    scanResults.classList.add('active');
}

async function launchDeepScan(target) {
    // EN: Deep-scan request lifecycle.
    // ES: Flujo de solicitud para escaneo profundo.
    showLoading('Escaneo profundo en curso...', `Analizando ${target}<br>Perfil rapido en dos fases (probe + detalle)<br>Esto puede tardar entre 20 y 90 segundos`);
    hideError();
    try {
        const res = await fetch(API_SCAN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Error del servidor (${res.status})`);
        }
        renderScanResults(await res.json());
    } catch (err) {
        showError(err.message);
    } finally {
        hideLoading();
    }
}

scanForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const target = targetInput.value.trim();
    if (!target) { targetInput.classList.add('input--error'); showError('Ingresa una IP objetivo'); setTimeout(() => targetInput.classList.remove('input--error'), 600); return; }
    if (!isValidIP(target)) { targetInput.classList.add('input--error'); showError('IP invalida. Formato: x.x.x.x'); setTimeout(() => targetInput.classList.remove('input--error'), 600); return; }
    launchDeepScan(target);
});
targetInput.addEventListener('input', () => targetInput.classList.remove('input--error'));

// ═══════════════════════════════════════
// UNIFIED PLATFORM (API V2)
// ═══════════════════════════════════════
function createUnifiedSeverityBadge(severity) {
    const level = (severity || '').toLowerCase();
    if (level === 'critical') return badge('CRITICO', 'alert');
    if (level === 'high') return badge('ALTO', 'warning');
    if (level === 'medium') return badge('MEDIO', 'paused');
    if (level === 'low') return badge('BAJO', 'no-creds');
    return badge((severity || 'N/A').toUpperCase(), 'filtered');
}

async function readJsonSafe(response) {
    return response.json().catch(() => ({}));
}

function renderUnifiedStatus(statusPayload) {
    if (!statusPayload) {
        unifiedStatusText.textContent = 'Sin escaneos en curso';
        return;
    }

    const lines = [
        `Scan ID: ${statusPayload.scan_id || '--'}`,
        `Objetivo: ${statusPayload.target || '--'}`,
        `Perfil: ${statusPayload.profile || '--'}`,
        `Estado: ${statusPayload.status || '--'}`,
        `Creado: ${statusPayload.created_at || '--'}`,
        `Inicio: ${statusPayload.started_at || '--'}`,
        `Fin: ${statusPayload.completed_at || '--'}`,
        `Error: ${statusPayload.error || 'Ninguno'}`
    ];
    unifiedStatusText.textContent = lines.join('\n');
}

function renderUnifiedRisk(payload) {
    const risk = payload?.risk || {};
    unifiedRiskValue.textContent = `${risk.score ?? 0}/100`;
    unifiedEndpointValue.textContent = risk.endpoint_score ?? 0;
    unifiedNetworkValue.textContent = risk.network_score ?? 0;
}

function renderUnifiedActionStatus(title, payload) {
    const lines = [
        title,
        typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)
    ];
    unifiedStatusText.textContent = lines.join('\n');
}

function renderUnifiedActionError(actionName, findingId, errorMessage) {
    const now = new Date().toLocaleTimeString();
    unifiedStatusText.textContent = [
        `${actionName} FALLIDO`,
        `Hora: ${now}`,
        `Finding: ${findingId || '--'}`,
        `Motivo: ${errorMessage || 'Error desconocido'}`,
        'Tip: pulsa REFRESCAR para sincronizar findings activos.'
    ].join('\n');
}

function focusUnifiedStatusLog() {
    if (!unifiedStatusLog) return;
    unifiedStatusLog.classList.remove('command-log--focus');
    // Force reflow so animation replays for repeated clicks.
    void unifiedStatusLog.offsetWidth;
    unifiedStatusLog.classList.add('command-log--focus');
    unifiedStatusLog.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function formatPreviewMessage(preview) {
    const commands = Object.entries(preview.commands || {})
        .map(([osName, cmd]) => `${osName}: ${cmd}`)
        .join('\n');

    return [
        `Tipo: ${preview.finding_type || '--'}`,
        `Auto-fix playbook: ${preview.auto_fix ? 'SI' : 'NO'}`,
        `Requiere aprobacion: ${preview.requires_approval ? 'SI' : 'NO'}`,
        `Validacion: ${preview.validation || '--'}`,
        `Acciones: ${(preview.actions || []).join(', ') || '--'}`,
        `Comandos:\n${commands || '--'}`
    ].join('\n');
}

function formatRemediationMessage(result) {
    const state = result.executed ? 'EJECUTADA' : result.queued ? 'EN COLA' : 'SIN ACCION';
    const commands = (result.commands || []).filter(Boolean).join('\n');

    return [
        `Estado: ${state}`,
        `Mensaje: ${result.message || '--'}`,
        `Acciones: ${(result.actions || []).join(', ') || '--'}`,
        `Comandos:\n${commands || '--'}`,
        result.queued ? 'Nota: AUTO_REMEDIATION=false -> requiere aprobacion manual.' : ''
    ].filter(Boolean).join('\n');
}

function renderUnifiedFindings(items) {
    unifiedFindingsBody.innerHTML = '';

    if (!items || items.length === 0) {
        unifiedFindingsTable.querySelector('thead').style.display = 'none';
        unifiedFindingsEmpty.style.display = 'block';
        unifiedFindingsCount.textContent = '0';
        return;
    }

    unifiedFindingsCount.textContent = String(items.length);
    unifiedFindingsTable.querySelector('thead').style.display = '';
    unifiedFindingsEmpty.style.display = 'none';

    items.slice(0, 40).forEach((finding, i) => {
        const row = document.createElement('tr');
        row.style.animation = `fadeSlideUp 0.35s ease ${i * 0.03}s both`;

        const severityCell = document.createElement('td');
        severityCell.appendChild(createUnifiedSeverityBadge(finding.severity));

        const actionCell = document.createElement('td');
        const actionWrap = document.createElement('div');
        actionWrap.className = 'table-actions';

        const previewBtn = document.createElement('button');
        previewBtn.className = 'btn-scan-device';
        previewBtn.type = 'button';
        previewBtn.textContent = 'PREVIEW';
        previewBtn.addEventListener('click', async () => {
            previewBtn.disabled = true;
            previewBtn.textContent = '...';
            renderUnifiedActionStatus(`PREVIEW ${finding.id}`, 'Consultando playbook...');
            focusUnifiedStatusLog();
            try {
                const res = await fetch(`${API_V2_REMEDIATION_PREVIEW}/${finding.id}`);
                const data = await readJsonSafe(res);
                if (!res.ok) {
                    throw new Error(data.detail || data.error || `Error preview (${res.status})`);
                }
                renderUnifiedActionStatus(`PREVIEW ${finding.id}`, formatPreviewMessage(data));
                focusUnifiedStatusLog();
            } catch (err) {
                renderUnifiedActionError('PREVIEW', finding.id, err.message);
                focusUnifiedStatusLog();
                if ((err.message || '').toLowerCase().includes('finding not found')) {
                    refreshUnifiedDashboard();
                }
                showError(err.message);
            } finally {
                previewBtn.disabled = false;
                previewBtn.textContent = 'PREVIEW';
            }
        });

        const remediateBtn = document.createElement('button');
        remediateBtn.className = 'btn-scan-device';
        remediateBtn.type = 'button';
        remediateBtn.textContent = 'REMEDIAR';
        remediateBtn.addEventListener('click', async () => {
            remediateBtn.disabled = true;
            remediateBtn.textContent = '...';
            renderUnifiedActionStatus(`REMEDIAR ${finding.id}`, 'Enviando solicitud de remediacion...');
            focusUnifiedStatusLog();
            try {
                const res = await fetch(`${API_V2_REMEDIATE}/${finding.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ os_name: 'linux', force: false })
                });
                const data = await readJsonSafe(res);
                if (!res.ok) {
                    throw new Error(data.detail || data.error || `Error remediar (${res.status})`);
                }
                renderUnifiedActionStatus(`REMEDIACION ${finding.id}`, formatRemediationMessage(data));
                focusUnifiedStatusLog();
                refreshUnifiedDashboard();
            } catch (err) {
                renderUnifiedActionError('REMEDIAR', finding.id, err.message);
                focusUnifiedStatusLog();
                if ((err.message || '').toLowerCase().includes('finding not found')) {
                    refreshUnifiedDashboard();
                }
                showError(err.message);
            } finally {
                remediateBtn.disabled = false;
                remediateBtn.textContent = 'REMEDIAR';
            }
        });

        actionWrap.appendChild(previewBtn);
        actionWrap.appendChild(remediateBtn);
        actionCell.appendChild(actionWrap);

        row.innerHTML = `
            <td>${finding.id ? finding.id.substring(0, 8) : '--'}</td>
            <td>${finding.source || '--'}</td>
            <td>${finding.finding_type || '--'}</td>
        `;
        row.appendChild(severityCell);

        const riskCell = document.createElement('td');
        riskCell.textContent = `${finding.risk_score ?? 0}/100`;
        row.appendChild(riskCell);
        row.appendChild(actionCell);

        unifiedFindingsBody.appendChild(row);
    });
}

function renderUnifiedCorrelations(items) {
    unifiedCorrBody.innerHTML = '';

    if (!items || items.length === 0) {
        unifiedCorrTable.querySelector('thead').style.display = 'none';
        unifiedCorrEmpty.style.display = 'block';
        unifiedCorrCount.textContent = '0';
        return;
    }

    unifiedCorrCount.textContent = String(items.length);
    unifiedCorrTable.querySelector('thead').style.display = '';
    unifiedCorrEmpty.style.display = 'none';

    items.slice(0, 20).forEach((alert, i) => {
        const row = document.createElement('tr');
        row.style.animation = `fadeSlideUp 0.35s ease ${i * 0.03}s both`;

        const severityCell = document.createElement('td');
        severityCell.appendChild(createUnifiedSeverityBadge(alert.severity));

        row.innerHTML = `
            <td>${alert.id || '--'}</td>
        `;
        row.appendChild(severityCell);

        const confidenceCell = document.createElement('td');
        confidenceCell.textContent = alert.confidence != null ? Number(alert.confidence).toFixed(2) : '--';
        row.appendChild(confidenceCell);

        const actionCell = document.createElement('td');
        actionCell.textContent = alert.action || '--';
        row.appendChild(actionCell);

        unifiedCorrBody.appendChild(row);
    });
}

function renderUnifiedExplainList(container, emptyNode, items) {
    container.innerHTML = '';
    const list = Array.isArray(items) ? items.filter(Boolean) : [];

    if (list.length === 0) {
        emptyNode.style.display = 'block';
        return;
    }

    emptyNode.style.display = 'none';
    list.slice(0, 8).forEach((text) => {
        const li = document.createElement('li');
        li.textContent = String(text);
        container.appendChild(li);
    });
}

function renderUnifiedExplanation(payload) {
    const explanation = payload?.explanation || {};
    const risk = explanation.risk || {};
    const status = explanation.status || 'LOW';
    const summary = explanation.summary || 'Sin datos suficientes para explicar el riesgo.';
    const reasons = explanation.top_reasons || [];
    const actions = explanation.suggested_actions || [];
    const activeFlags = explanation.active_flags?.count ?? 0;

    unifiedExplainSummary.textContent = summary;
    renderUnifiedExplainList(unifiedExplainReasons, unifiedExplainReasonsEmpty, reasons);
    renderUnifiedExplainList(unifiedExplainActions, unifiedExplainActionsEmpty, actions);

    const inference = payload?.inference || {};
    const mode = inference.fallback_mode ? 'Heuristico' : 'Modelo ML';
    const modelState = inference.fallback_mode ? 'Sin modelos cargados' : 'Modelos cargados';

    unifiedExplainMeta.textContent =
        `Estado: ${status} | Score: ${risk.score ?? 0}/100 | Flags activas: ${activeFlags} | Modo: ${mode} (${modelState})`;
}

async function refreshUnifiedDashboard() {
    try {
        const [riskRes, findingsRes, corrRes, explainRes] = await Promise.all([
            fetch(API_V2_RISK),
            fetch(API_V2_FINDINGS),
            fetch(API_V2_CORRELATIONS),
            fetch(API_V2_RISK_EXPLANATION)
        ]);

        const riskData = await readJsonSafe(riskRes);
        const findingsData = await readJsonSafe(findingsRes);
        const corrData = await readJsonSafe(corrRes);
        const explainData = await readJsonSafe(explainRes);

        if (!riskRes.ok || !findingsRes.ok || !corrRes.ok || !explainRes.ok) {
            throw new Error(
                riskData.detail
                || findingsData.detail
                || corrData.detail
                || explainData.detail
                || 'La API unificada no responde. Inicia FastAPI en puerto 8001.'
            );
        }

        renderUnifiedRisk(riskData);
        renderUnifiedFindings(findingsData.items || []);
        renderUnifiedCorrelations(corrData.items || []);
        renderUnifiedExplanation(explainData);
        unifiedResults.classList.add('active');
    } catch (err) {
        showError(err.message);
    }
}

async function pollUnifiedScanStatus(scanId) {
    if (!scanId) return;
    try {
        const res = await fetch(`${API_V2_SCAN_STATUS}/${scanId}`);
        const data = await readJsonSafe(res);
        if (!res.ok) {
            throw new Error(data.detail || data.error || `Error status (${res.status})`);
        }

        renderUnifiedStatus(data);

        if (['completed', 'failed'].includes(data.status)) {
            if (unifiedPollingTimer) {
                clearInterval(unifiedPollingTimer);
                unifiedPollingTimer = null;
            }
            refreshUnifiedDashboard();
        }
    } catch (err) {
        if (unifiedPollingTimer) {
            clearInterval(unifiedPollingTimer);
            unifiedPollingTimer = null;
        }
        showError(err.message);
    }
}

async function launchUnifiedScan(target, profile) {
    showLoading('Escaneo unificado en curso...', `Target: ${target}<br>Perfil: ${profile}<br>Orquestando Nmap + Hydra + correlacion`);
    hideError();

    try {
        const res = await fetch(API_V2_SCAN_NETWORK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target, profile })
        });
        const data = await readJsonSafe(res);
        if (!res.ok) {
            throw new Error(data.detail || data.error || `Error API v2 (${res.status})`);
        }

        unifiedLastScanId = data.scan_id;
        renderUnifiedStatus({
            scan_id: data.scan_id,
            target: data.target,
            profile: data.profile,
            status: data.status,
            created_at: data.requested_at
        });

        if (unifiedPollingTimer) clearInterval(unifiedPollingTimer);
        unifiedPollingTimer = setInterval(() => pollUnifiedScanStatus(unifiedLastScanId), 2000);
        pollUnifiedScanStatus(unifiedLastScanId);
    } catch (err) {
        showError(err.message);
    } finally {
        hideLoading();
    }
}

unifiedScanForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const target = unifiedTargetInput.value.trim();
    const profile = unifiedProfileInput.value;

    if (!target) {
        unifiedTargetInput.classList.add('input--error');
        showError('Ingresa una IP objetivo para el escaneo unificado');
        setTimeout(() => unifiedTargetInput.classList.remove('input--error'), 600);
        return;
    }

    if (!isValidIP(target)) {
        unifiedTargetInput.classList.add('input--error');
        showError('IP invalida para API v2. Formato: x.x.x.x');
        setTimeout(() => unifiedTargetInput.classList.remove('input--error'), 600);
        return;
    }

    launchUnifiedScan(target, profile);
});

unifiedRefreshBtn.addEventListener('click', () => {
    refreshUnifiedDashboard();
    if (unifiedLastScanId) {
        pollUnifiedScanStatus(unifiedLastScanId);
    }
});

unifiedTargetInput.addEventListener('input', () => unifiedTargetInput.classList.remove('input--error'));
