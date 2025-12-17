import type { Request, Response, NextFunction } from "express";
import JWTService from "../services/jwt.service.js";
import SupabaseService from "../services/supabase.service.js";

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
                supabaseUserId?: string;
            };
        }
    }
}

/**
 * Middleware to verify JWT access token from cookies (Supabase Auth)
 * Adds user payload to req.user if valid
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log("in authentication token middleware")
        // Check for Supabase session token in cookies
        // Supabase stores tokens with specific cookie names based on the project
        const supabaseAccessToken = req.cookies['sb-access-token'] || 
                                     req.cookies['supabase-auth-token'] ||
                                     req.cookies.accessToken;

        console.log("supabaseAccessToken", supabaseAccessToken);

        if (!supabaseAccessToken) {
            res.status(401).json({
                success: false,
                message: "Token de acceso no proporcionado",
            });
            return;
        }

        // Verify the Supabase token and get user data
        const userData = await SupabaseService.verifyToken(supabaseAccessToken);

        if (!userData) {
            res.status(401).json({
                success: false,
                message: "Token de acceso inválido o expirado",
            });
            return;
        }

        // Attach user info to request
        req.user = {
            userId: userData.userId,
            email: userData.email,
            is_temporary_password: userData.is_temporary_password,
            full_name: userData.full_name,
            roles: userData.roles,
            privileges: userData.privileges,
            supabaseUserId: userData.supabaseUserId,
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
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
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const supabaseAccessToken = req.cookies['sb-access-token'] || 
                                     req.cookies['supabase-auth-token'] ||
                                     req.cookies.accessToken;

        if (supabaseAccessToken) {
            const userData = await SupabaseService.verifyToken(supabaseAccessToken);
            if (userData) {
                req.user = {
                    userId: userData.userId,
                    email: userData.email,
                    is_temporary_password: userData.is_temporary_password,
                    full_name: userData.full_name,
                    roles: userData.roles,
                    privileges: userData.privileges,
                    supabaseUserId: userData.supabaseUserId,
                };
            }
        }

        next();
    } catch (error) {
        // Don't fail on optional auth errors
        next();
    }
};

