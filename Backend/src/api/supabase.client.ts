import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Service for backend operations
 * 
 * This service provides access to Supabase features NOT covered by Prisma:
 * - Supabase Storage (file uploads/downloads)
 * - Supabase Realtime (subscriptions)
 * - Direct Supabase API calls if needed
 * 
 * Note: For database queries, use Prisma (via models) instead.
 * The SERVICE_ROLE_KEY bypasses RLS, giving the backend full access.
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

            // Debug: Check if env vars are loaded
            console.log('🔍 Supabase Config Check:');
            console.log('  SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
            console.log('  SERVICE_ROLE_KEY:', supabaseServiceKey ? `✅ Set (${supabaseServiceKey.substring(0, 20)}...)` : '❌ Missing');

            if (!supabaseUrl || !supabaseServiceKey) {
                throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
            }

            // IMPORTANT: We use .schema('cea') in each query to specify the schema
            // The global db.schema config doesn't work properly with PostgREST
            this.client = createClient(supabaseUrl, supabaseServiceKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            });

            console.log('✅ Supabase client initialized with SERVICE_ROLE_KEY');
            console.log('📋 Remember to use .schema("cea") in all queries!');
        }

        return this.client;
    }

    /**
     * Get Supabase client instance
     * Use this for:
     * - Storage operations: client.storage.from('bucket')
     * - Realtime subscriptions: client.channel('room')
     */
    static getSupabaseClient(): SupabaseClient {
        return this.getClient();
    }
}

export default SupabaseService;

