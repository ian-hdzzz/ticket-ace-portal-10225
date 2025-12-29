import type { Request, Response, NextFunction } from "express";
import JWTService from "../utils/jwt.service.js";

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                is_temporary_password: boolean;
                full_name: string;
                roles: string[];
                privileges: string[];
            };
        }
    }
}

/**
 * Middleware to verify JWT access token from cookies
 * Adds user payload to req.user if valid
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            console.log("❌ Token de acceso no proporcionado");
            console.log("   Cookies received:", Object.keys(req.cookies));
            console.log("   Origin:", req.headers.origin);
            console.log("   Cookie header:", req.headers.cookie);
            res.status(401).json({
                success: false,
                message: "Token de acceso no proporcionado",
            });
            return;
        }

        // Verify the access token
        const payload = JWTService.verifyAccessToken(accessToken);

        if (!payload) {
            res.status(401).json({
                success: false,
                message: "Token de acceso inválido o expirado",
            });
            return;
        }

        // Attach user info to request
        req.user = {
            userId: payload.userId,
            email: payload.email,
            is_temporary_password: payload.is_temporary_password,
            full_name: payload.full_name,
            roles: payload.roles,
            privileges: payload.privileges,
        };

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al verificar token de acceso",
        });
    }
};

/**
 * Optional authentication middleware
 * Adds user to request if token exists and is valid, but doesn't reject if missing
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const accessToken = req.cookies.accessToken;

        if (accessToken) {
            const payload = JWTService.verifyAccessToken(accessToken);
            if (payload) {
                req.user = {
                    userId: payload.userId,
                    email: payload.email,
                    is_temporary_password: payload.is_temporary_password,
                    full_name: payload.full_name,
                    roles: payload.roles,
                    privileges: payload.privileges,
                };
            }
        }

        next();
    } catch (error) {
        // Don't fail on optional auth errors
        next();
    }
};

/**
 * SSE authentication middleware
 * Accepts token from query param OR cookie (for EventSource compatibility)
 */
export const authenticateSSE = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Try query param first (for EventSource), then cookie
        const accessToken = (req.query.token as string) || req.cookies.accessToken;

        if (!accessToken) {
            res.status(401).json({
                success: false,
                message: "Token de acceso no proporcionado",
            });
            return;
        }

        // Verify the access token
        const payload = JWTService.verifyAccessToken(accessToken);

        if (!payload) {
            res.status(401).json({
                success: false,
                message: "Token de acceso inválido o expirado",
            });
            return;
        }

        // Attach user info to request
        req.user = {
            userId: payload.userId,
            email: payload.email,
            is_temporary_password: payload.is_temporary_password,
            full_name: payload.full_name,
            roles: payload.roles,
            privileges: payload.privileges,
        };

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Error al verificar token de acceso",
        });
    }
};