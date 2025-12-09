import type { Request, Response, NextFunction } from "express";
import JWTService from "../utils/jwt.js";

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
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
                };
            }
        }

        next();
    } catch (error) {
        // Don't fail on optional auth errors
        next();
    }
};

