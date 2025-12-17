import type { Request, Response, NextFunction } from "express";

/**
 * RBAC Middleware - Requires specific privileges to access endpoints
 * Must be used after authenticateToken middleware
 */
export const requirePrivileges = (requiredPrivileges: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        // Ensure user is authenticated
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Usuario no autenticado",
            });
            return;
        }

        const userPrivileges = req.user.privileges || [];

        // Check if user has all required privileges
        const hasAllPrivileges = requiredPrivileges.every(
            (priv) => userPrivileges.includes(priv)
        );

        if (!hasAllPrivileges) {
            res.status(403).json({
                success: false,
                message: "Privilegios insuficientes",
                required: requiredPrivileges,
                user_has: userPrivileges,
            });
            return;
        }

        // User has all required privileges, proceed
        next();
    };
};

/**
 * Requires at least one of the specified privileges
 */
export const requireAnyPrivilege = (requiredPrivileges: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Usuario no autenticado",
            });
            return;
        }

        const userPrivileges = req.user.privileges || [];

        // Check if user has at least one required privilege
        const hasAnyPrivilege = requiredPrivileges.some(
            (priv) => userPrivileges.includes(priv)
        );

        if (!hasAnyPrivilege) {
            res.status(403).json({
                success: false,
                message: "Privilegios insuficientes",
                required_any_of: requiredPrivileges,
                user_has: userPrivileges,
            });
            return;
        }

        next();
    };
};

/**
 * Requires specific role(s)
 */
export const requireRoles = (requiredRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Usuario no autenticado",
            });
            return;
        }

        const userRoles = req.user.roles || [];

        // Check if user has at least one required role
        const hasRequiredRole = requiredRoles.some(
            (role) => userRoles.includes(role)
        );

        if (!hasRequiredRole) {
            res.status(403).json({
                success: false,
                message: "Rol insuficiente",
                required_roles: requiredRoles,
                user_roles: userRoles,
            });
            return;
        }

        next();
    };
};

