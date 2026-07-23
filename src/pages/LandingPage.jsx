import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Globe, Award, Users, CheckCircle, ArrowRight, Menu, X, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Explicitly export default to ensure lazy loading works
const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const countries = [
    { name: 'Poland', flag: '🇵🇱', programs: '500+' },
    { name: 'Latvia', flag: '🇱🇻', programs: '200+' },
    { name: 'Lithuania', flag: '🇱🇹', programs: '300+' },
    { name: 'Germany', flag: '🇩🇪', programs: '1000+' },
    { name: 'Hungary', flag: '🇭🇺', programs: '400+' }
  ];

  const features = [
    { icon: GraduationCap, title: 'Top Universities', description: 'Access to leading European institutions' },
    { icon: Globe, title: 'Multiple Countries', description: 'Study in Poland, Latvia, Lithuania, Germany & Hungary' },
    { icon: Award, title: 'Scholarship Support', description: 'Guidance on available scholarships and funding' },
    { icon: Users, title: 'Expert Guidance', description: 'Personalized counseling throughout your journey' }
  ];

  const benefits = [
    'Free initial consultation',
    'Application assistance',
    'Visa support',
    'Accommodation guidance',
    'Post-arrival support',
    'Student community access'
  ];

  return (
    <>
      <Helmet>
        <title>Kuro Educational Consultancy - Study Abroad in Europe</title>
        <meta name="description" content="Study in Europe with Kuro Educational Consultancy. Expert guidance for students from Southern Africa applying to Poland, Latvia, Lithuania, Germany, and Hungary." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-x-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <GraduationCap className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold text-white">Kuro Educational</span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-6">
                <a href="#about" className="text-slate-300 hover:text-white transition-colors">About</a>
                <a href="#countries" className="text-slate-300 hover:text-white transition-colors">Countries</a>
                <a href="#benefits" className="text-slate-300 hover:text-white transition-colors">Benefits</a>
                <Button onClick={() => navigate('/login')} variant="outline" className="text-white border-white hover:bg-white hover:text-slate-900">
                  Login
                </Button>
                <Button onClick={() => navigate('/signup')} className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-white p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden bg-slate-800 border-t border-slate-700 absolute w-full"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#about" className="block text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>About</a>
                <a href="#countries" className="block text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Countries</a>
                <a href="#benefits" className="block text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Benefits</a>
                <Button onClick={() => navigate('/login')} variant="outline" className="w-full justify-center">
                  Login
                </Button>
                <Button onClick={() => navigate('/signup')} className="w-full bg-blue-600 hover:bg-blue-700 justify-center">
                  Get Started
                </Button>
              </div>
            </motion.div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Your Gateway to <span className="text-blue-400">European Education</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-300 mb-8">
                  Transform your future with quality education in Europe. Expert guidance for students from Southern Africa.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    onClick={() => navigate('/signup')}
                    className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto"
                  >
                    Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-white hover:bg-white hover:text-slate-900 text-lg px-8 py-6 h-auto"
                  >
                    Learn More
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative mt-8 lg:mt-0"
              >
                <img alt="Students celebrating graduation in Europe" className="rounded-2xl shadow-2xl w-full h-auto object-cover aspect-[4/3]" src="https://images.unsplash.com/photo-1620459055536-b53f4b5ccb85" />
                <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 rounded-xl shadow-xl hidden sm:block">
                  <div className="text-4xl font-bold">2,500+</div>
                  <div className="text-sm">Students Placed</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="about" className="py-20 px-4 bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Kuro Educational?</h2>
              <p className="text-xl text-slate-300">Your trusted partner in international education</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-all"
                >
                  <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Countries Section */}
        <section id="countries" className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Study Destinations</h2>
              <p className="text-xl text-slate-300">Choose from top European countries</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {countries.map((country, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl text-center cursor-pointer shadow-xl"
                >
                  <div className="text-6xl mb-3">{country.flag}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{country.name}</h3>
                  <p className="text-blue-100">{country.programs} programs</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 px-4 bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">What You Get With Us</h2>
                <p className="text-xl text-slate-300 mb-8">
                  Comprehensive support throughout your study abroad journey
                </p>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                      <span className="text-lg text-slate-200">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-8 lg:mt-0">
                <img alt="Student consulting with advisor" className="rounded-2xl shadow-2xl w-full h-auto"  src="https://images.unsplash.com/photo-1562942668-ccd9a1f2ffc6" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-center shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of students who have achieved their dreams with Kuro Educational
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/signup')}
                className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-6 h-auto"
              >
                Apply Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-950 border-t border-slate-800 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-8 h-8 text-blue-400" />
                  <span className="text-xl font-bold text-white">Kuro Educational</span>
                </div>
                <p className="text-slate-400 mb-6 max-w-sm">
                  Your premier educational consultancy for studying in Europe. We bridge the gap between ambitious students and world-class universities.
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-4">Contact</h3>
                <ul className="space-y-2 text-slate-400">
                  <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> kuro.agents@kuroeduconsultancy.com</li>
                  <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +48 783042776</li>
                  <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Harare, Zimbabwe</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><Link to="/privacy-policy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms-of-service" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link to="/admin-login" className="text-slate-400 hover:text-white transition-colors">Admin Access</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-slate-800 pt-8 text-center">
              <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Kuro Educational Consultancy. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;