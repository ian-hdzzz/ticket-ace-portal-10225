import { createClient} from '@supabase/supabase-js'

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL, 
    import.meta.env.VITE_SUPABASE_ANON_KEY, 
    {
      db: {
        schema: 'cea'
      }
    }
)

// Test connection function
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('tickets')  // Should work with schema configured above
      .select('id')
      .limit(1);

    if (error) {
      console.error("❌ DB test failed:", error);
    } else {
      console.log("✅ DB connection OK:", data);
    }
  } catch (err) {
    console.error("❌ Connection test error:", err);
  }
};

// Run test on import
testConnection();