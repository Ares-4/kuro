import { supabase } from '@/lib/customSupabaseClient';

// Subscribe/unsubscribe an email to deadline alerts for one scholarship.
// Uses the set_scholarship_subscription RPC (validated, RLS-safe). Falls back to the
// legacy direct-table calls only if the RPC has not been deployed yet.
export const setScholarshipSubscription = async (scholarshipId, email, subscribe) => {
  const { error } = await supabase.rpc('set_scholarship_subscription', {
    p_scholarship: scholarshipId, p_email: email, p_subscribe: subscribe,
  });
  if (!error) return;
  if (error.code !== 'PGRST202') throw error; // PGRST202 = function not found
  const legacy = subscribe
    ? await supabase.from('scholarship_subscriptions').insert({ scholarship_id: scholarshipId, email, user_id: (await supabase.auth.getUser()).data.user?.id || null })
    : await supabase.from('scholarship_subscriptions').delete().eq('scholarship_id', scholarshipId).eq('email', email);
  if (legacy.error && legacy.error.code !== '23505') throw legacy.error; // 23505 = already subscribed
};
