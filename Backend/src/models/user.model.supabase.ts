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

            console.log('🔍 Querying cea.users table with email:', email);
            
            // Simple query first - just get the user without joins
            const { data: user, error } = await supabase
                .schema('cea')
                .from('users')
                .select('id, full_name, email, password, phone, active, is_temporary_password, created_at, updated_at')
                .eq('email', email)
                .single();

            console.log('Query result:', { 
                found: !!user, 
                error: error?.message,
                userId: user?.id 
            });

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows returned
                    console.log('❌ User not found');
                    return null;
                }
                console.error('❌ Supabase query error:', error);
                throw new Error("Error al buscar usuario");
            }

            if (!user) {
                return null;
            }

            console.log('✅ User found, now fetching roles...');

            // Now get the roles and privileges separately
            const { data: userRoles, error: rolesError } = await supabase
                .schema('cea')
                .from('users_roles')
                .select(`
                    id,
                    user_id,
                    role_id,
                    role:roles(
                        id,
                        name,
                        description,
                        hierarchical_level,
                        active
                    )
                `)
                .eq('user_id', user.id);

            if (rolesError) {
                console.error('❌ Error fetching roles:', rolesError);
            }

            console.log('Roles found:', userRoles?.length || 0);

            // Get privileges for each role
            const rolesWithPrivileges = await Promise.all(
                (userRoles || []).map(async (ur: any) => {
                    const { data: privileges } = await supabase
                        .schema('cea')
                        .from('roles_privileges')
                        .select(`
                            id,
                            role_id,
                            privilege_id,
                            privilege:privileges(
                                id,
                                name,
                                description,
                                module
                            )
                        `)
                        .eq('role_id', ur.role_id);

                    return {
                        id: ur.id,
                        userId: ur.user_id,
                        roleId: ur.role_id,
                        role: {
                            ...ur.role,
                            hierarchicalLevel: ur.role.hierarchical_level,
                            rolePrivileges: privileges || []
                        }
                    };
                })
            );

            // Transform to match Prisma format (camelCase)
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
                userRoles: rolesWithPrivileges
            };
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

