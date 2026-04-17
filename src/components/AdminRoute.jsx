import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';

const AdminRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (!session?.user?.id) {
          if (mounted) {
            setIsAllowed(false);
            setChecking(false);
          }
          return;
        }

        const userId = session.user.id;

        const { data: adminRow, error } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) throw error;

        if (mounted) {
          setIsAllowed(Boolean(adminRow));
          setChecking(false);
        }
      } catch (e) {
        console.error('AdminRoute check failed:', e);
        if (mounted) {
          setIsAllowed(false);
          setChecking(false);
        }
      }
    };

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        Checking admin access…
      </div>
    );
  }

  if (!isAllowed) return <Navigate to="/admin-login" replace />;

  return children;
};

export default AdminRoute;