import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import simulationRoutes from "./routes/simulation.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");

// Load environment variables from api/.env regardless of launch cwd.
// Carga variables desde api/.env sin depender del directorio de ejecucion.
dotenv.config({ path: envPath });

const app = express();

app.use(cors());
app.use(express.json());

const unifiedApiBase = process.env.UNIFIED_API_BASE || "http://127.0.0.1:8001";

// Proxy /api/v2 to the unified FastAPI backend.
// Enruta /api/v2 al backend unificado FastAPI.
app.use("/api/v2", async (req, res) => {
    try {
        const upstreamUrl = new URL(req.originalUrl, unifiedApiBase);
        const headers = {};

        if (req.headers["content-type"]) {
            headers["content-type"] = req.headers["content-type"];
        }

        const isBodyMethod = !["GET", "HEAD"].includes(req.method);
        const body = isBodyMethod ? JSON.stringify(req.body || {}) : undefined;

        const upstreamResponse = await fetch(upstreamUrl, {
            method: req.method,
            headers,
            body
        });

        const contentType = upstreamResponse.headers.get("content-type") || "";
        const textPayload = await upstreamResponse.text();

        res.status(upstreamResponse.status);
        if (contentType) {
            res.set("content-type", contentType);
        }

        if (contentType.includes("application/json")) {
            try {
                return res.json(JSON.parse(textPayload));
            } catch {
                return res.json({ raw: textPayload });
            }
        }

        return res.send(textPayload);
    } catch (error) {
        return res.status(502).json({
            error: "Unified API unavailable. Start FastAPI service on port 8001.",
            detail: error.message
        });
    }
});

// Serve static frontend files
// Servir archivos estaticos del frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Mount simulation API routes
// Montar rutas API de simulacion
app.use("/api/simulations", simulationRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    // Startup log in a single place for easier ops troubleshooting
    // Log de arranque en un solo lugar para facilitar troubleshooting
    console.log(`Server running on port ${PORT}`);
});
