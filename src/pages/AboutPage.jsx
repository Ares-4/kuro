import React, { useEffect } from 'react';
import { Target, Users, ShieldCheck } from 'lucide-react';

const AboutPage = () => {
  useEffect(() => {
    document.title = "About Kuro Education Consultancy | Our Mission & Team";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Learn about Kuro Education Consultancy. Our mission is to guide international students through the study abroad journey with expert advice and support.";
  }, []);

  // Proven Architecture Image
  const teamImage = "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80";

  return (
    <div className="bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="py-20 text-center bg-slate-900">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Mission</h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto px-4">
          To bridge the gap between African potential and European educational excellence, providing a trusted pathway for students to realize their global ambitions.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Who We Are</h2>
              <p className="text-slate-400 leading-relaxed">
                Kuro Educational Consultancy is a premier education consulting firm headquartered in Harare, Zimbabwe. Founded with the vision of democratizing access to international education, we specialize in placing students in top universities across Poland, Cyprus, Lithuania, and other European nations.
              </p>
              <p className="text-slate-400 leading-relaxed">
                We understand the unique challenges African students face—from complex visa procedures to finding affordable tuition. Our team of experienced consultants works tirelessly to simplify this process, ensuring a seamless transition from your home country to your dream campus.
              </p>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                {/* Updated Image with proven URL */}
                <img className="w-full h-full object-cover" alt="Kuro Team" src={teamImage} />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center">
                <div className="w-16 h-16 bg-blue-900/30 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Our Vision</h3>
                <p className="text-slate-400">To become the most trusted educational bridge between Africa and Europe, known for integrity and success.</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center">
                <div className="w-16 h-16 bg-purple-900/30 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Our Values</h3>
                <p className="text-slate-400">Transparency, Integrity, and Student-Centricity are at the core of every consultation we provide.</p>
            </div>
            <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center">
                <div className="w-16 h-16 bg-green-900/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Our Community</h3>
                <p className="text-slate-400">We build lasting relationships, supporting our students well beyond their acceptance letters.</p>
            </div>
          </div>
      </div>
    </div>
  );
};

export default AboutPage;