import { prisma } from "../utils/prisma.js";

export default class User {
    constructor() { }

    static async getUserByEmail(email: string) {
        try {
            const user = await prisma.usuario.findUnique({
                where: { correo: email },
                include: {
                    roles: {
                        include: {
                            rol: {
                                include: {
                                    privilegios: {
                                        include: {
                                            privilegio: true
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
            throw new Error("Conexión con BD ha fallido");
        }
    }
}