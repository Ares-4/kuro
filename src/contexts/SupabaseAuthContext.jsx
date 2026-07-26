import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

/**
 * Canonical provider (keep this — your App.jsx uses <AuthProvider>)
 */
export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (currentSession) => {
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          if (
            error.message &&
            (error.message.includes('bad_jwt') ||
              error.message.includes('invalid claim'))
          ) {
            await supabase.auth.signOut();
          }
          handleSession(null);
          return;
        }

        handleSession(data?.session ?? null);
      } catch (err) {
        console.error('Unexpected error during session check:', err);
        handleSession(null);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setLoading(false);
        // NOTE: This key may not exist in newer supabase-js, but harmless:
        localStorage.removeItem('supabase.auth.token');
      } else {
        handleSession(newSession);
      }
    });

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signUp = useCallback(
    async (email, password, options = {}) => {
      const redirectTo = `${window.location.origin}/`;

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            ...options,
            emailRedirectTo: redirectTo,
          },
        });

        if (error) throw error;

        // Automatically create student profile on successful signup
        if (data?.user) {
          const fullName = options?.data?.full_name || email.split('@')[0];

          const { error: profileError } = await supabase.from('students').insert([
            {
              user_id: data.user.id,
              email,
              full_name: fullName,
              created_at: new Date().toISOString(),
            },
          ]);

          // Do not hard-fail signup if profile creation fails
          if (profileError) {
            console.error(
              'Warning: Automatic profile creation failed:',
              profileError
            );
          }
        }

        return { data, error: null };
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Sign up Failed',
          description: error?.message || 'Something went wrong',
        });
        return { data: null, error };
      }
    },
    [toast]
  );

  const signIn = useCallback(
    async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Sign in Failed',
          description: error?.message || 'Something went wrong',
        });
      }

      return { data, error };
    },
    [toast]
  );

  const resetPasswordForEmail = useCallback(
    async (email) => {
      // We only use the emailed 6-digit code (verifyOtp below), not a link,
      // so redirectTo is irrelevant here — Supabase still requires the call.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/forgot-password`,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Could not send reset email',
          description: error?.message || 'Something went wrong',
        });
      }

      return { error };
    },
    [toast]
  );

  const updatePassword = useCallback(
    async (newPassword) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Could not update password',
          description: error?.message || 'Something went wrong',
        });
      }

      return { error };
    },
    [toast]
  );

  // Verifies a 6-digit code from any of the auth emails (signup, recovery,
  // email_change). On success this establishes a session, same as clicking
  // the equivalent link would.
  const verifyOtp = useCallback(
    async (email, token, type) => {
      const { data, error } = await supabase.auth.verifyOtp({ email, token, type });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Invalid or expired code',
          description: error?.message || 'Please request a new code and try again.',
        });
      }

      return { data, error };
    },
    [toast]
  );

  // Kicks off an email change: Supabase emails a 6-digit code to the new
  // address for confirmation via verifyOtp(newEmail, code, 'email_change').
  const changeEmail = useCallback(
    async (newEmail) => {
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Could not start email change',
          description: error?.message || 'Something went wrong',
        });
      }

      return { error };
    },
    [toast]
  );

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign out Failed',
        description: error?.message || 'Something went wrong',
      });
      return { error };
    }
  }, [toast]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPasswordForEmail,
      updatePassword,
      verifyOtp,
      changeEmail,
    }),
    [
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPasswordForEmail,
      updatePassword,
      verifyOtp,
      changeEmail,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Backwards-compatible alias exports.
 * These prevent "missing export" crashes without forcing you to edit other files.
 */
export const SupabaseAuthProvider = AuthProvider;
export const SupabaseAuthContextProvider = AuthProvider;

/**
 * Hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};