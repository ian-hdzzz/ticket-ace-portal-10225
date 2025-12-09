import type { Request, Response } from "express";
import AuthServices from "../services/auth.service.js";
import JWTService from "../utils/jwt.js";

export default class AuthController {

    /**
     * Login endpoint - authenticates user and sets JWT cookies
     */
    static async login(req: Request, res: Response) {
        try {
            // destruct body for email and password
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ success: false, message: "Correo o contraseña no proporcionado" });
            }

            // find user using credentials
            const user = await AuthServices.findUser(email);
            if (!user || !user.password) {
                return res.status(401).json({ success: false, message: "Usuario no encontrado" });
            }

            // verify password hash
            const passwordsMatch = await AuthServices.verifyPassword(password, user.password);
            if (!passwordsMatch) {
                return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
            }

            // generate access and refresh tokens
            const accessToken = JWTService.generateAccessToken({
                userId: user.id,
                email: user.email,
            });

            const refreshToken = JWTService.generateRefreshToken({
                userId: user.id,
                email: user.email,
            });

            // set tokens as HTTP-only cookies
            JWTService.setTokenCookies(res, accessToken, refreshToken);

            // return success message with user info (excluding password)
            return res.status(200).json({
                success: true,
                message: "Inicio de sesión exitoso",
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    is_temporary_password: user.is_temporary_password,
                },
            });

        } catch (err) {
            const error = err as Error;
            const errMessage = error.message || "Error de autenticación";
            return res.status(500).json({ success: false, message: errMessage });
        }
    }

    /**
     * Logout endpoint - clears JWT cookies
     */
    static async logout(req: Request, res: Response) {
        try {
            JWTService.clearTokenCookies(res);
            return res.status(200).json({
                success: true,
                message: "Sesión cerrada exitosamente",
            });
        } catch (err) {
            const error = err as Error;
            const errMessage = error.message || "Error al cerrar sesión";
            return res.status(500).json({ success: false, message: errMessage });
        }
    }

    /**
     * Refresh token endpoint - issues new access token using refresh token
     */
    static async refreshToken(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: "Token de actualización no proporcionado",
                });
            }

            // Verify refresh token
            const payload = JWTService.verifyRefreshToken(refreshToken);
            if (!payload) {
                return res.status(401).json({
                    success: false,
                    message: "Token de actualización inválido o expirado",
                });
            }

            // Generate new access token
            const newAccessToken = JWTService.generateAccessToken({
                userId: payload.userId,
                email: payload.email,
            });

            // Set new access token cookie (keep existing refresh token)
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            return res.status(200).json({
                success: true,
                message: "Token actualizado exitosamente",
            });
        } catch (err) {
            const error = err as Error;
            const errMessage = error.message || "Error al actualizar token";
            return res.status(500).json({ success: false, message: errMessage });
        }
    }

}