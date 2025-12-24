import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL, 
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      db: {
        schema: 'cea'
      },
      cookies: {
        get(name: string) {
          const cookies = document.cookie.split(';');
          const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
          return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
        },
        set(name: string, value: string, options: any) {
          let cookieString = `${name}=${encodeURIComponent(value)}`;
          if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`;
          if (options?.path) cookieString += `; path=${options.path}`;
          if (options?.domain) cookieString += `; domain=${options.domain}`;
          if (options?.sameSite) cookieString += `; samesite=${options.sameSite}`;
          if (options?.secure) cookieString += '; secure';
          document.cookie = cookieString;
        },
        remove(name: string, options: any) {
          document.cookie = `${name}=; max-age=0; path=${options?.path || '/'}`;
        },
      },
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