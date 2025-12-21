import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Service for backend operations
 * 
 * ⚠️  USE THIS FOR:
 * - Supabase Storage (file uploads/downloads)
 * - Supabase Realtime (subscriptions)
 * 
 * ⚠️  DO NOT USE FOR DATABASE QUERIES
 * - Use Prisma instead (via models like user.model.ts)
 * - Prisma uses DATABASE_URL connection string (direct PostgreSQL)
 * - This client uses Supabase's PostgREST API which may have issues
 */
class SupabaseService {
    private static client: SupabaseClient;

    /**
     * Initialize Supabase client with service role key
     * Service role key bypasses Row Level Security for backend operations
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
                }
            });

            console.log('✅ Supabase client initialized for Storage/Realtime');
        }

        return this.client;
    }

    /**
     * Get Supabase client instance
     * Use this ONLY for:
     * - Storage operations: client.storage.from('bucket')
     * - Realtime subscriptions: client.channel('room')
     * 
     * For database queries, use Prisma instead!
     */
    static getSupabaseClient(): SupabaseClient {
        return this.getClient();
    }
}

export default SupabaseService;

