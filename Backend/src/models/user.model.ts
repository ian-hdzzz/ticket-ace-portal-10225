import { prisma } from "../utils/prisma.js";

export default class User {
    constructor() { }

    static async getUserByEmail(email: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { email: email },
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
    
            return user;
        } catch (error) {
            console.error(error);
            throw new Error("Conexión con BD ha fallido");
        }
    }

    static async updatePassword(userId: string, newPassword: string) {
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    password: newPassword,
                    isTemporaryPassword: false,
                }
            });

            return updatedUser;
        } catch (error) {
            console.error(error);
            throw new Error("Error al actualizar contraseña");
        }
    }
}