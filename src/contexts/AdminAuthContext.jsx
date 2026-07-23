import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const AdminAuthContext = createContext(undefined);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdminAuthenticated, setIsAuthenticated] = useState(false);

  // Generate a browser fingerprint for security
  // This creates a unique signature based on the user's browser environment
  const generateFingerprint = () => {
    const { userAgent, language, platform } = window.navigator;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return btoa(`${userAgent}-${language}-${platform}-${timezone}`);
  };

  const checkAdminSession = useCallback(async () => {
    try {
      // 1. Check if Supabase session exists
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setAdminUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // 2. Check fingerprint validation in sessionStorage
      // This differentiates a "Student Session" from an "Admin Session"
      // Even if a user is logged into Supabase, they need this fingerprint match 
      // to be considered logged into the Admin Portal specifically.
      const storedFingerprint = sessionStorage.getItem('admin_fingerprint');
      const currentFingerprint = generateFingerprint();

      if (!storedFingerprint || storedFingerprint !== currentFingerprint) {
        // User might be logged in as student, but hasn't passed Admin Login
        setAdminUser(null);
        setIsAuthenticated(false);
      } else {
        // 3. Verify this account is an actual admin (matches the `admins`
        // table check used by RLS policies). The fingerprint alone only
        // proves they went through the admin login form - it does not
        // prove they're an admin, since that form accepted any valid
        // Supabase credentials.
        const { data: adminRow } = await supabase
          .from('admins')
          .select('user_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (adminRow) {
          setAdminUser(session.user);
          setIsAuthenticated(true);
        } else {
          setAdminUser(null);
          setIsAuthenticated(false);
        }
      }

    } catch (err) {
      console.error('Admin session check failed', err);
      setAdminUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAdminSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setAdminUser(null);
        setIsAuthenticated(false);
        sessionStorage.removeItem('admin_fingerprint');
        sessionStorage.removeItem('admin_token');
      } else if (event === 'SIGNED_IN') {
        checkAdminSession();
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdminSession]);

  const loginAdmin = async (email, password) => {
    try {
      setLoading(true);
      
      // 1. Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      // 2. Verify this account is actually an admin before granting access.
      // Without this check, ANY registered user (students included) who
      // entered their own valid credentials here would be treated as admin.
      const { data: adminRow, error: adminCheckError } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (adminCheckError || !adminRow) {
        await supabase.auth.signOut();
        return { success: false, error: 'This account is not authorized for admin access.' };
      }

      // 3. Set Admin Session Markers
      // Generate and store fingerprint to validate this browser session
      const fingerprint = generateFingerprint();
      sessionStorage.setItem('admin_fingerprint', fingerprint);
      sessionStorage.setItem('admin_token', data.session.access_token);

      // 4. Update State
      setAdminUser(data.user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logoutAdmin = async () => {
    try {
      setLoading(true);
      // Clear admin specific session data
      sessionStorage.removeItem('admin_fingerprint');
      sessionStorage.removeItem('admin_token');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      setAdminUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ 
      adminUser, 
      loading, 
      isAdminAuthenticated, 
      loginAdmin, 
      logoutAdmin 
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};