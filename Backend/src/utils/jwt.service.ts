import jwt from "jsonwebtoken";
import type { Response } from "express";
import type { TokenPayload } from "../types/jwtPayload.type.js";

export default class JWTService {
    private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || "your-access-secret-change-in-production";
    private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-change-in-production";
    private static readonly ACCESS_TOKEN_EXPIRY = "60m"; // 15 minutes
    private static readonly REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

    /**
     * Generate access token
     */
    static generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
            expiresIn: this.ACCESS_TOKEN_EXPIRY,
        });
    }

    /**
     * Generate refresh token
     */
    static generateRefreshToken(payload: TokenPayload): string {
        return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRY,
        });
    }

    /**
     * Verify access token
     */
    static verifyAccessToken(token: string): TokenPayload | null {
        try {
            return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as TokenPayload;
        } catch (error) {
            return null;
        }
    }

    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token: string): TokenPayload | null {
        try {
            return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as TokenPayload;
        } catch (error) {
            return null;
        }
    }

    /**
     * Set tokens as HTTP-only cookies in response
     */
    static setTokenCookies(res: Response, accessToken: string, refreshToken: string): void {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // true for HTTPS in production
            sameSite: "lax" as const,
            path: "/",
        };

        // Set access token cookie
        res.cookie("accessToken", accessToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 1000, // 60 minutes
        });

        // Set refresh token cookie
        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }

    /**
     * Clear authentication cookies
     */
    static clearTokenCookies(res: Response): void {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            path: "/",
        };
        
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
    }
}

