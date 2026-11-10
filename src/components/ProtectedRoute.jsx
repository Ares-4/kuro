import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const Loading = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
    <div className="text-white text-xl">Loading...</div>
  </div>
);

// Remembers, per signed-in user, that the profile step is done, so the check
// runs once per tab session rather than on every dashboard navigation.
const profileDoneKey = (userId) => `kuro_profile_done_${userId}`;

const ProtectedRoute = ({ children, requireProfile = false }) => {
  const { user, loading } = useAuth();
  const [profileState, setProfileState] = useState('checking'); // checking | done | missing

  useEffect(() => {
    if (!requireProfile || !user) return undefined;
    try {
      if (sessionStorage.getItem(profileDoneKey(user.id))) { setProfileState('done'); return undefined; }
    } catch { /* storage blocked */ }
    let cancelled = false;
    supabase
      .from('students')
      .select('preferences')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        // On a read error, let the student in rather than trapping them.
        const done = !!error || !!data?.preferences?.onboarded_at;
        if (done) { try { sessionStorage.setItem(profileDoneKey(user.id), '1'); } catch { /* ignore */ } }
        setProfileState(done ? 'done' : 'missing');
      });
    return () => { cancelled = true; };
  }, [requireProfile, user]);

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (requireProfile) {
    if (profileState === 'checking') return <Loading />;
    if (profileState === 'missing') return <Navigate to="/welcome" replace />;
  }
  return children;
};

export default ProtectedRoute;
