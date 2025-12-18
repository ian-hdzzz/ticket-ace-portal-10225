import bcrypt from "bcrypt";
// import User from "../models/user.model.js";
import User from "../models/user.model.supabase.js";

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

    /**
     * Update user password and clear temporary password flag
     */
    static async updatePassword(userId: string, newPassword: string) {
        const updatedUser = await User.updatePassword(userId, newPassword);
        return updatedUser;
    }
}