import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config/publicConfig';

const customSupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
