import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { GraduationCap, Mail, Lock, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resetPasswordForEmail, verifyOtp, updatePassword } = useAuth();

  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPasswordForEmail(email);
    setLoading(false);
    if (!error) {
      toast({ title: 'Code sent', description: `Check ${email} for a 6-digit code.` });
      setStep('verify');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return toast({ variant: 'destructive', title: 'Weak password', description: 'Password should be at least 6 characters.' });
    }
    if (password !== confirmPassword) {
      return toast({ variant: 'destructive', title: 'Passwords do not match' });
    }

    setLoading(true);
    const { error: verifyError } = await verifyOtp(email, code.trim(), 'recovery');
    if (verifyError) {
      setLoading(false);
      return;
    }

    const { error: updateError } = await updatePassword(password);
    setLoading(false);

    if (!updateError) {
      toast({ title: 'Password updated', description: 'You can now use your new password to log in.' });
      navigate('/dashboard');
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - Kuro Educational Consultancy</title>
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
              onClick={() => (step === 'verify' ? setStep('request') : navigate('/login'))}
              className="mb-6 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {step === 'verify' ? 'Back' : 'Back to Login'}
            </Button>

            <div className="flex items-center justify-center gap-2 mb-8">
              <GraduationCap className="w-10 h-10 text-blue-400" />
              <span className="text-2xl font-bold text-white">Kuro Educational</span>
            </div>

            {step === 'request' ? (
              <>
                <h1 className="text-3xl font-bold text-white text-center mb-2">Forgot Password</h1>
                <p className="text-slate-300 text-center mb-8">
                  Enter your email and we'll send you a 6-digit code.
                </p>

                <form onSubmit={handleRequestCode} className="space-y-6">
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
                </form>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-white text-center mb-2">Enter Code</h1>
                <p className="text-slate-300 text-center mb-8">
                  Enter the 6-digit code sent to <span className="text-white font-medium">{email}</span> and choose a new password.
                </p>

                <form onSubmit={handleResetPassword} className="space-y-6">
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

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
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

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </>
            )}

            <div className="mt-6 text-center">
              <p className="text-slate-300">
                Remembered your password?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
