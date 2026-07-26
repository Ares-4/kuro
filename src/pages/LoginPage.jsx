import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, Mail, Lock, ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signInWithOtp, verifyOtp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 'password' | 'code-request' | 'code-verify'
  const [mode, setMode] = useState('password');
  const [code, setCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (!error) {
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      navigate('/dashboard');
    }

    setLoading(false);
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithOtp(email);
    setLoading(false);
    if (!error) {
      toast({ title: 'Code sent', description: `Check ${email} for a 6-digit code.` });
      setMode('code-verify');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await verifyOtp(email, code.trim(), 'email');
    setLoading(false);
    if (!error) {
      toast({ title: 'Welcome back!', description: "You've successfully logged in." });
      navigate('/dashboard');
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Kuro Educational Consultancy</title>
        <meta name="description" content="Login to your Kuro Educational Consultancy student account" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-6 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <div className="flex items-center justify-center gap-2 mb-8">
              <GraduationCap className="w-10 h-10 text-blue-400" />
              <span className="text-2xl font-bold text-white">Kuro Educational</span>
            </div>

            {mode === 'password' && (
              <>
                <h1 className="text-3xl font-bold text-white text-center mb-2">Welcome Back</h1>
                <p className="text-slate-300 text-center mb-8">Login to your student account</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-300">
                        Password
                      </label>
                      <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-center text-slate-400">
                    By logging in, you agree to our{' '}
                    <Link to="/terms-of-service" className="text-blue-400 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy-policy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setMode('code-request')}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-300"
                  >
                    Sign in with a code instead
                  </button>
                </form>
              </>
            )}

            {mode === 'code-request' && (
              <>
                <h1 className="text-3xl font-bold text-white text-center mb-2">Sign In With a Code</h1>
                <p className="text-slate-300 text-center mb-8">We'll email you a 6-digit code — no password needed.</p>

                <form onSubmit={handleSendCode} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  >
                    {loading ? 'Sending...' : 'Send Code'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setMode('password')}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-300"
                  >
                    Use password instead
                  </button>
                </form>
              </>
            )}

            {mode === 'code-verify' && (
              <>
                <h1 className="text-3xl font-bold text-white text-center mb-2">Enter Code</h1>
                <p className="text-slate-300 text-center mb-8">
                  Enter the 6-digit code sent to <span className="text-white font-medium">{email}</span>.
                </p>

                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-[0.3em] font-mono"
                        placeholder="123456"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  >
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setMode('code-request')}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-300"
                  >
                    Back
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 text-center">
              <p className="text-slate-300">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;