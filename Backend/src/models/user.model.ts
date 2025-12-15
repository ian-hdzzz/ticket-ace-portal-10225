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
}