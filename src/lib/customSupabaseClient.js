import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://akrbfwmqhnbopqlvawhw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrcmJmd21xaG5ib3BxbHZhd2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MjgwMzksImV4cCI6MjA4MTIwNDAzOX0.-rJYbnfNV-0vwCqKpFcCQKUG3sskZZgDCi7zsWuTPk8';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
