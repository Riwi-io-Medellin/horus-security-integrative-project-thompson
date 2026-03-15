/**
 * Session Service
 * 
 * Manages user sessions, authentication tokens, and expirations.
 */
import crypto from "crypto";

const SESSION_TTL_MS = Number.parseInt(process.env.AUTH_SESSION_TTL_MS || "43200000", 10) || 43200000;
const sessionStore = new Map();

function now() {
    return Date.now();
}

function cleanupExpiredSessions() {
    const current = now();

    for (const [token, session] of sessionStore.entries()) {
        if (!session?.expiresAt || session.expiresAt <= current) {
            sessionStore.delete(token);
        }
    }
}

function normalizeRoles(roles) {
    if (!Array.isArray(roles)) {
        return [];
    }

    return roles
        .map((role) => String(role || "").trim().toLowerCase())
        .filter(Boolean);
}

/**
 * Parses the bearer token from the authorization header.
 * 
 * @param {string} authorizationHeader 
 * @returns {string|null}
 */
export function parseBearerToken(authorizationHeader) {
    if (!authorizationHeader || typeof authorizationHeader !== "string") {
        return null;
    }

    const [scheme, token] = authorizationHeader.trim().split(/\s+/, 2);
    if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
        return null;
    }

    return token;
}

/**
 * Creates a new session for the given user.
 * 
 * @param {Object} user 
 * @returns {Object} The created session metadata.
 */
export function createSession(user) {
    cleanupExpiredSessions();

    const token = crypto.randomBytes(32).toString("base64url");
    const roles = normalizeRoles(user?.roles);
    const expiresAt = now() + SESSION_TTL_MS;

    const session = {
        token,
        userId: Number.parseInt(String(user?.id ?? ""), 10),
        username: String(user?.username || ""),
        isAdmin: Boolean(user?.is_admin || roles.includes("admin")),
        roles,
        createdAt: now(),
        expiresAt
    };

    sessionStore.set(token, session);

    return {
        token,
        expiresAt,
        user: {
            id: session.userId,
            username: session.username,
            is_admin: session.isAdmin,
            roles: session.roles
        }
    };
}

/**
 * Retrieves an active session by token.
 * 
 * @param {string} token 
 * @returns {Object|null}
 */
export function getSession(token) {
    cleanupExpiredSessions();

    if (!token) {
        return null;
    }

    const session = sessionStore.get(token);
    if (!session) {
        return null;
    }

    if (session.expiresAt <= now()) {
        sessionStore.delete(token);
        return null;
    }

    return {
        ...session,
        roles: [...session.roles]
    };
}

/**
 * Revokes a session given a token.
 * 
 * @param {string} token 
 */
export function revokeSession(token) {
    if (!token) {
        return;
    }

    sessionStore.delete(token);
}

/**
 * Revokes all sessions belonging to a specific user.
 * 
 * @param {number|string} userId 
 */
export function revokeAllUserSessions(userId) {
    const numericUserId = Number.parseInt(String(userId ?? ""), 10);
    if (!Number.isFinite(numericUserId) || numericUserId <= 0) {
        return;
    }

    for (const [token, session] of sessionStore.entries()) {
        if (session?.userId === numericUserId) {
            sessionStore.delete(token);
        }
    }
}
