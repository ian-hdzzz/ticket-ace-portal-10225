import { createClient} from '@supabase/supabase-js'

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL, 
    import.meta.env.VITE_SUPABASE_ANON_KEY, {
     db: {
    schema: 'cea'
  }
})


// Ahora puedes usar directamente:
const result = await supabase.from('tickets').select();

const testConnection = async () => {
  const { data, error } = await supabase
    .from('cea.tickets')  // 👈 usa una tabla que SI existe
    .select('id')
    .limit(1);

  if (error) {
    console.error("❌ DB test failed:", error);
  } else {
    console.log("✅ DB connection OK:", data);
  }
};


testConnection();