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
        // Set access token cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only HTTPS in production
            sameSite: "none",
            maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
        });

        // Set refresh token cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        });
    }

    /**
     * Clear authentication cookies
     */
    static clearTokenCookies(res: Response): void {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
    }
}

