export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Check your .env file.');
}
