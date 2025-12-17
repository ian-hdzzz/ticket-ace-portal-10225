import { createClient, SupabaseClient } from '@supabase/supabase-js';
import User from '../models/user.model.js';

class SupabaseService {
    private static client: SupabaseClient;

    /**
     * Initialize Supabase client with service role key
     */
    private static getClient(): SupabaseClient {
        if (!this.client) {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

            if (!supabaseUrl || !supabaseServiceKey) {
                throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
            }

            this.client = createClient(supabaseUrl, supabaseServiceKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                },
                db: {
                    schema: 'cea'
                }
            });
        }

        return this.client;
    }

    /**
     * Verify JWT token from Supabase Auth
     * @param token - JWT token from cookie
     * @returns User payload with roles and privileges, or null if invalid
     */
    static async verifyToken(token: string) {
        try {
            const client = this.getClient();

            // Verify the JWT token with Supabase
            const { data: { user }, error } = await client.auth.getUser(token);

            if (error || !user) {
                console.error('Token verification failed:', error?.message);
                return null;
            }

            // Fetch user details including roles and privileges from our database
            const userDetails = await User.getUserByEmail(user.email!);

            if (!userDetails) {
                console.error('User not found in database:', user.email);
                return null;
            }

            // Extract roles and privileges from the nested structure
            const roles: string[] = userDetails.userRoles.map((userRole: any) => userRole.role.name as string);
            const allPrivileges = userDetails.userRoles.flatMap((userRole: any) =>
                userRole.role.rolePrivileges.map((rolePrivilege: any) => rolePrivilege.privilege.name as string)
            );
            const privileges: string[] = Array.from(new Set(allPrivileges));

            return {
                userId: userDetails.id,
                email: userDetails.email,
                is_temporary_password: userDetails.isTemporaryPassword,
                full_name: userDetails.fullName,
                roles,
                privileges,
                supabaseUserId: user.id
            };
        } catch (error) {
            console.error('Error verifying token:', error);
            return null;
        }
    }

    /**
     * Get Supabase client instance (for other operations if needed)
     */
    static getSupabaseClient(): SupabaseClient {
        return this.getClient();
    }
}

export default SupabaseService;

