import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, Mail, Lock, User, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: ''
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        variant: "destructive",
        title: "Terms Required",
        description: "Please accept the Terms of Service and Privacy Policy to continue.",
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(formData.email, formData.password, {
      data: {
        full_name: formData.fullName,
        phone: formData.phone,
        country: formData.country
      }
    });

    if (!error) {
      // Create student record
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('students').insert({
          user_id: user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country
        });
      }

      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account.",
      });
      navigate('/login');
    }

    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - Kuro Educational Consultancy</title>
        <meta name="description" content="Create your Kuro Educational Consultancy student account" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md my-8"
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

            <h1 className="text-3xl font-bold text-white text-center mb-2">Create Account</h1>
            <p className="text-slate-300 text-center mb-8">Start your journey to study abroad</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+27 123 456 789"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Country
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select your country</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Botswana">Botswana</option>
                    <option value="Namibia">Namibia</option>
                    <option value="Zimbabwe">Zimbabwe</option>
                    <option value="Zambia">Zambia</option>
                    <option value="Other">Other</option>
                  </select>
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={setTermsAccepted}
                  className="mt-1 border-slate-500"
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
                >
                  I have read and agree to the{' '}
                  <Link to="/terms-of-service" className="text-blue-400 hover:text-blue-300 underline">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">
                    Privacy Policy
                  </Link>.
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 mt-4"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-300">
                Already have an account?{' '}
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

export default SignupPage;