import type { Request, Response, NextFunction } from "express";
import JWTService from "../utils/jwt.service.js";
import { prisma } from "../utils/prisma.js";

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
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Try X-User-Data header first (temp fix), fallback to JWT cookies
        const userDataHeader = req.headers['x-user-data'] as string;
        
        if (userDataHeader) {
            // Parse user data from header
            const userData = JSON.parse(userDataHeader);

            // Attach user info to request - map id to userId to match existing type
            req.user = {
                userId: userData.id,  // Map id from localStorage to userId for req.user
                email: userData.email,
                is_temporary_password: userData.is_temporary_password,
                full_name: userData.full_name,
                roles: userData.roles?.map((r: any) => r.name) || [],
                privileges: [],
            };

            return next();
        }

        // Fallback to JWT from cookies
        const accessToken = req.cookies.accessToken;

        if (accessToken) {
            // Verify the access token
            const payload = JWTService.verifyAccessToken(accessToken);

            if (payload) {
                // Attach user info to request
                req.user = {
                    userId: payload.userId,
                    email: payload.email,
                    is_temporary_password: payload.is_temporary_password,
                    full_name: payload.full_name,
                    roles: payload.roles,
                    privileges: payload.privileges,
                };

                return next();
            }
        }

        // Final fallback: userId from query parameter
        const userIdParam = req.query.userId as string;
        
        if (userIdParam) {
            // Validate userId exists in database
            const user = await prisma.user.findUnique({
                where: { id: userIdParam },
                include: {
                    userRoles: {
                        include: {
                            role: {
                                include: {
                                    rolePrivileges: {
                                        include: {
                                            privilege: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (user) {
                // Extract roles and privileges
                const roles: string[] = user.userRoles.map((userRole: any) => userRole.role.name as string);
                const allPrivileges = user.userRoles.flatMap((userRole: any) =>
                    userRole.role.rolePrivileges.map((rolePrivilege: any) => rolePrivilege.privilege.name as string)
                );
                const privileges: string[] = Array.from(new Set(allPrivileges));

                req.user = {
                    userId: user.id,
                    email: user.email,
                    is_temporary_password: user.isTemporaryPassword,
                    full_name: user.fullName,
                    roles,
                    privileges,
                };

                return next();
            }
        }

        // No valid authentication method found
        console.log("❌ No authentication provided");
        console.log("   Cookies received:", Object.keys(req.cookies));
        console.log("   Query userId:", userIdParam || 'none');
        res.status(401).json({
            success: false,
            message: "Token de acceso no proporcionado",
        });
        return;
    } catch (error) {
        console.error("Error authenticating:", error);
        res.status(401).json({
            success: false,
            message: "Error al autenticar usuario",
        });
        return;
    }
};

/**
 * Optional authentication middleware
 * Adds user to request if token exists and is valid, but doesn't reject if missing
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Try X-User-Data header first, fallback to JWT cookies
        const userDataHeader = req.headers['x-user-data'] as string;
        
        if (userDataHeader) {
            const userData = JSON.parse(userDataHeader);
            req.user = {
                userId: userData.id,  // Map id to userId
                email: userData.email,
                is_temporary_password: userData.is_temporary_password,
                full_name: userData.full_name,
                roles: userData.roles?.map((r: any) => r.name) || [],
                privileges: [],
            };
        } else {
            // Fallback to JWT from cookies
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
            } else {
                // Final fallback: userId from query parameter
                const userIdParam = req.query.userId as string;
                
                if (userIdParam) {
                    const user = await prisma.user.findUnique({
                        where: { id: userIdParam },
                        include: {
                            userRoles: {
                                include: {
                                    role: {
                                        include: {
                                            rolePrivileges: {
                                                include: {
                                                    privilege: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });

                    if (user) {
                        const roles: string[] = user.userRoles.map((userRole: any) => userRole.role.name as string);
                        const allPrivileges = user.userRoles.flatMap((userRole: any) =>
                            userRole.role.rolePrivileges.map((rolePrivilege: any) => rolePrivilege.privilege.name as string)
                        );
                        const privileges: string[] = Array.from(new Set(allPrivileges));

                        req.user = {
                            userId: user.id,
                            email: user.email,
                            is_temporary_password: user.isTemporaryPassword,
                            full_name: user.fullName,
                            roles,
                            privileges,
                        };
                    }
                }
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
// export const authenticateSSE = (req: Request, res: Response, next: NextFunction): void => {
//     try {
//         // Try query param first (for EventSource), then cookie
//         const accessToken = (req.query.token as string) || req.cookies.accessToken;

//         if (!accessToken) {
//             res.status(401).json({
//                 success: false,
//                 message: "Token de acceso no proporcionado",
//             });
//             return;
//         }

//         // Verify the access token
//         const payload = JWTService.verifyAccessToken(accessToken);

//         if (!payload) {
//             res.status(401).json({
//                 success: false,
//                 message: "Token de acceso inválido o expirado",
//             });
//             return;
//         }

//         // Attach user info to request
//         req.user = {
//             userId: payload.id,
//             email: payload.email,
//             is_temporary_password: payload.is_temporary_password,
//             full_name: payload.full_name,
//             roles: payload.roles,
//             privileges: payload.privileges,
//         };

//         next();
//     } catch (error) {
//         res.status(401).json({
//             success: false,
//             message: "Error al verificar token de acceso",
//         });
//     }
// };