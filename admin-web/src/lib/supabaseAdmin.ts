import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string;

// Create admin client with service role key for operations that need to bypass RLS
// Only create if service role key is properly configured
export const supabaseAdmin = supabaseServiceKey && supabaseServiceKey !== 'your-service-role-key-here'
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storage: undefined
        },
        db: { schema: 'public' }
    })
    : null;
