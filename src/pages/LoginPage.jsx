import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
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
            </form>

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