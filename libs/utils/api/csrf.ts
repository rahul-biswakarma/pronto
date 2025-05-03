"use server";

import crypto from "node:crypto";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import logger from "./logger";

// Make sure to set these environment variables
const CSRF_SECRET =
    process.env.CSRF_SECRET ||
    (process.env.NODE_ENV === "production"
        ? ""
        : "development_csrf_secret_key");

// Session configuration
const sessionOptions = {
    password: CSRF_SECRET,
    cookieName: "feno_csrf",
    ttl: 60 * 60, // 1 hour
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
    },
};

// Interface for session data
interface CSRFSession {
    csrfToken?: string;
    createdAt?: number;
}

/**
 * Generate a new CSRF token and store it in the session
 */
export async function generateCSRFToken(): Promise<string> {
    // Generate a random token
    const token = crypto.randomBytes(32).toString("hex");

    // Store in the session
    const session = await getIronSession<CSRFSession>(
        await cookies(),
        sessionOptions,
    );
    session.csrfToken = token;
    session.createdAt = Date.now();
    await session.save();

    return token;
}

/**
 * Middleware to validate CSRF tokens
 * This should be used for all state-changing operations (POST, PUT, DELETE)
 */
export async function validateCSRFToken(
    req: NextRequest | Request,
): Promise<{ valid: boolean; error?: string }> {
    // Only apply to state-changing methods
    const method = req.method.toUpperCase();
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        return { valid: true };
    }

    try {
        // Get the token from the header or body
        const headerToken = req.headers.get("x-csrf-token");

        // Early return if no token
        if (!headerToken) {
            return { valid: false, error: "CSRF token missing" };
        }

        // Get the session token
        const session = await getIronSession<CSRFSession>(
            await cookies(),
            sessionOptions,
        );
        const sessionToken = session.csrfToken;

        // Check if token exists and is not expired
        if (!sessionToken) {
            return { valid: false, error: "No CSRF token in session" };
        }

        // Check if token is expired (more than 1 hour old)
        const createdAt = session.createdAt || 0;
        if (Date.now() - createdAt > 60 * 60 * 1000) {
            // Clear expired token
            session.csrfToken = undefined;
            session.createdAt = undefined;
            await session.save();
            return { valid: false, error: "CSRF token expired" };
        }

        // Compare tokens using timing-safe comparison
        const valid = crypto.timingSafeEqual(
            Buffer.from(sessionToken),
            Buffer.from(headerToken),
        );

        return {
            valid: valid,
            error: valid ? undefined : "Invalid CSRF token",
        };
    } catch (error) {
        logger.error({ error }, "Error validating CSRF token");
        return { valid: false, error: "Error validating CSRF token" };
    }
}

/**
 * Wrapper for API handlers to validate CSRF token
 */
export async function withCSRFProtection<T extends Request | NextRequest>(
    handler: (req: T) => Promise<Response | NextResponse>,
) {
    return async (req: T) => {
        const { valid, error } = await validateCSRFToken(req);

        if (!valid) {
            logger.warn(
                {
                    error,
                    path:
                        req instanceof NextRequest
                            ? req.nextUrl.pathname
                            : req.url,
                },
                "CSRF validation failed",
            );
            return NextResponse.json(
                { error: error || "CSRF validation failed" },
                { status: 403 },
            );
        }

        return handler(req);
    };
}
