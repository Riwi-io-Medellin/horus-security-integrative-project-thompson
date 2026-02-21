import express from "express";
import { runDeepScan, discoverHosts, detectLocalNetwork } from "../services/docker.service.js";
import { validateTarget, isAuthorizedTarget, validateSubnet, isPublicTarget } from "../utils/validators.js";

const router = express.Router();

function parseEnvBool(value) {
    return String(value || "").trim().toLowerCase() === "true";
}

// GET /api/simulations/network
// EN: Auto-detect local network interfaces and CIDR ranges.
// ES: Detecta interfaces locales y subredes CIDR automaticamente.
router.get("/network", (req, res) => {
    try {
        const networks = detectLocalNetwork();
        res.json({ networks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/simulations/discover
// EN: Discover active hosts in a CIDR subnet.
// ES: Descubre hosts activos dentro de una subred CIDR.
router.post("/discover", async (req, res) => {
    const { subnet } = req.body;

    if (!subnet || !validateSubnet(subnet)) {
        return res.status(400).json({ error: "Invalid subnet. Use CIDR format, e.g. 192.168.1.0/24" });
    }

    try {
        const result = await discoverHosts(subnet);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/simulations
// EN: Run deep host scan plus Hydra credential checks (policy-limited).
// ES: Ejecuta escaneo profundo del host mas verificaciones Hydra con limites de politica.
router.post("/", async (req, res) => {
    const { target } = req.body;

    if (!validateTarget(target)) {
        return res.status(400).json({ error: "Invalid target IP" });
    }

    // EN: Authorization guard can be bypassed only in controlled environments.
    // ES: El guard de autorizacion solo debe omitirse en entornos controlados.
    const skipAuth = parseEnvBool(process.env.SKIP_AUTHORIZATION);
    const allowPublicTargets = parseEnvBool(process.env.ALLOW_PUBLIC_TARGETS);

    if (isPublicTarget(target) && !allowPublicTargets) {
        return res.status(403).json({
            error: "Public WAN targets are disabled. Set ALLOW_PUBLIC_TARGETS=true and authorize target in AUTHORIZED_TARGETS."
        });
    }

    if (!skipAuth && !isAuthorizedTarget(target)) {
        return res.status(403).json({
            error: "Target not authorized. Add it to AUTHORIZED_TARGETS (CIDR or exact IP)."
        });
    }

    try {
        const result = await runDeepScan(target);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
