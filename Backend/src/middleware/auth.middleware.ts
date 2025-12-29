import type { Request, Response, NextFunction } from "express";
import JWTService from "../utils/jwt.service.js";

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
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
        // Read user data from X-User-Data header (sent by frontend from localStorage)
        const userDataHeader = req.headers['x-user-data'] as string;
        
        if (!userDataHeader) {
            console.log("❌ User data not provided in header");
            res.status(401).json({
                success: false,
                message: "Usuario no autenticado",
            });
            return;
        }

        // Parse user data from header
        const userData = JSON.parse(userDataHeader);

        // Attach user info to request (same structure as localStorage)
        req.user = {
            id: userData.id,
            email: userData.email,
            is_temporary_password: userData.is_temporary_password,
            full_name: userData.full_name,
            roles: userData.roles?.map((r: any) => r.name) || [],
            privileges: [],
        };

        next();
    } catch (error) {
        console.error("Error parsing user data:", error);
        res.status(401).json({
            success: false,
            message: "Error al autenticar usuario",
        });
    }
};

/**
 * Optional authentication middleware
 * Adds user to request if token exists and is valid, but doesn't reject if missing
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const userDataHeader = req.headers['x-user-data'] as string;
        
        if (userDataHeader) {
            const userData = JSON.parse(userDataHeader);
            req.user = {
                id: userData.id,
                email: userData.email,
                is_temporary_password: userData.is_temporary_password,
                full_name: userData.full_name,
                roles: userData.roles?.map((r: any) => r.name) || [],
                privileges: [],
            };
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