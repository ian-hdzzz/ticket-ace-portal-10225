import bcrypt from "bcrypt";
import User from "../models/user.model.js";

export default class AuthUseCases {
    /**
     * Find user by email
     */
    static async findUser(email: string) {
        const user = await User.getUserByEmail(email);
        return user;
    }

    /**
     * Verify password against hash
     */
    static async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
        // console.log(password, passwordHash);
        const isMatch = await bcrypt.compare(password, passwordHash);
        return isMatch;
    }
}