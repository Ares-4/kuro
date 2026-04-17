import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, Fingerprint, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AdminLogin = () => {
  // Pre-fill email for convenience as requested
  const [email, setEmail] = useState('admin@kuroeduconsultancy.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { loginAdmin, isAdminAuthenticated, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect
  useEffect(() => {
    if (isAdminAuthenticated && !authLoading) {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAdminAuthenticated, authLoading, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    const result = await loginAdmin(email, password);

    if (result.success) {
      setSuccess(true);
      // Redirect handled by useEffect or explicit navigation after delay
      setTimeout(() => {
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      }, 1000); 
    } else {
      setError(result.error || 'Invalid credentials. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row items-center justify-center p-4 relative">
      {/* Back Button */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link to="/">
          <Button variant="ghost" className="text-slate-400 hover:text-white flex items-center gap-2 pl-0 md:pl-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Back to Website</span>
            <span className="md:hidden">Back</span>
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md space-y-8 px-4 sm:px-0">
        <div className="text-center mt-12 md:mt-0">
          <div className="mx-auto h-16 w-16 bg-blue-900/20 rounded-full flex items-center justify-center mb-4 ring-2 ring-blue-500/20">
            <Lock className="h-8 w-8 text-blue-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Secure access for authorized personnel only
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-900/20 border-green-900 text-green-400 animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>Establishing secure session...</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-950 border-slate-800 focus:border-blue-500 transition-colors h-11 md:h-10"
                placeholder="name@company.com"
                autoComplete="email"
                disabled={isSubmitting || success}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-950 border-slate-800 focus:border-blue-500 transition-colors h-11 md:h-10"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isSubmitting || success}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 md:h-11 transition-all active:scale-[0.98] text-base"
              disabled={isSubmitting || success}
            >
              {isSubmitting || success ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  {success ? 'Redirecting...' : 'Authenticating...'}
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2 text-xs text-slate-500">
             <div className="flex items-center gap-2">
                <Fingerprint className="w-3 h-3" />
                <span>Session protected by browser fingerprinting</span>
             </div>
             <p className="opacity-70 text-center">IP Address and Device Info are logged for security.</p>
          </div>
        </div>
        
        <div className="text-center text-xs text-slate-600 pb-8 md:pb-0">
          <p>&copy; 2026 Kuro Educational. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;