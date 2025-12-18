import SupabaseService from "../api/supabase.client.js";

/**
 * User Model - Supabase Client Version
 * 
 * This version uses Supabase client instead of Prisma.
 * Use this if you don't have the DATABASE_URL password yet.
 * 
 * To use this version:
 * 1. Rename this file to user.model.ts
 * 2. Rename the current user.model.ts to user.model.prisma.ts (backup)
 */
export default class User {
    constructor() { }

    static async getUserByEmail(email: string) {
        try {
            const supabase = SupabaseService.getSupabaseClient();

            // Query user with roles and privileges using Supabase joins
            // Note: Using !users_roles_user_id_fkey to specify which relationship to use
            // (there are two FKs: user_id and assigned_by)
            const { data: user, error } = await supabase
                .from('users')
                .select(`
                    id,
                    full_name,
                    email,
                    password,
                    phone,
                    active,
                    is_temporary_password,
                    created_at,
                    updated_at,
                    userRoles:users_roles!users_roles_user_id_fkey(
                        id,
                        user_id,
                        role_id,
                        role:roles(
                            id,
                            name,
                            description,
                            hierarchical_level,
                            active,
                            rolePrivileges:roles_privileges(
                                id,
                                role_id,
                                privilege_id,
                                privilege:privileges(
                                    id,
                                    name,
                                    description,
                                    module
                                )
                            )
                        )
                    )
                `)
                .eq('email', email)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows returned
                    return null;
                }
                console.error('Supabase query error:', error);
                throw new Error("Error al buscar usuario");
            }

            // Transform to match Prisma format (camelCase)
            if (user) {
                return {
                    id: user.id,
                    fullName: user.full_name,
                    email: user.email,
                    password: user.password,
                    phone: user.phone,
                    active: user.active,
                    isTemporaryPassword: user.is_temporary_password,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at,
                    userRoles: (user.userRoles || []).map((ur: any) => ({
                        id: ur.id,
                        userId: ur.user_id,
                        roleId: ur.role_id,
                        role: {
                            id: ur.role.id,
                            name: ur.role.name,
                            description: ur.role.description,
                            hierarchicalLevel: ur.role.hierarchical_level,
                            active: ur.role.active,
                            rolePrivileges: (ur.role.rolePrivileges || []).map((rp: any) => ({
                                id: rp.id,
                                roleId: rp.role_id,
                                privilegeId: rp.privilege_id,
                                privilege: {
                                    id: rp.privilege.id,
                                    name: rp.privilege.name,
                                    description: rp.privilege.description,
                                    module: rp.privilege.module
                                }
                            }))
                        }
                    }))
                };
            }

            return null;
        } catch (error) {
            console.error(error);
            throw new Error("Conexión con BD ha fallido");
        }
    }

    static async updatePassword(userId: string, newPassword: string) {
        try {
            const supabase = SupabaseService.getSupabaseClient();

            const { data: updatedUser, error } = await supabase
                .from('users')
                .update({
                    password: newPassword,
                    is_temporary_password: false,
                })
                .eq('id', userId)
                .select('id, full_name, email, is_temporary_password')
                .single();

            if (error) {
                console.error('Supabase update error:', error);
                throw new Error("Error al actualizar contraseña");
            }

            // Transform to camelCase
            return {
                id: updatedUser.id,
                fullName: updatedUser.full_name,
                email: updatedUser.email,
                isTemporaryPassword: updatedUser.is_temporary_password,
            };
        } catch (error) {
            console.error(error);
            throw new Error("Error al actualizar contraseña");
        }
    }
}

