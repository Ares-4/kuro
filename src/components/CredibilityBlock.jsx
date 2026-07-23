import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { ShieldCheck, GraduationCap, Globe2, Users, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const CredibilityBlock = ({ className = "" }) => {
  const [metrics, setMetrics] = useState([
    { icon: 'ShieldCheck', value: '98%', label: 'Visa Success Rate' },
    { icon: 'Users', value: '500+', label: 'Students Placed' },
    { icon: 'GraduationCap', value: '35+', label: 'Partner Universities' },
    { icon: 'Globe2', value: '12', label: 'Countries Served' }
  ]);

  useEffect(() => {
    const fetchMetrics = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'credibility_metrics')
        .maybeSingle();
      
      if (data?.value) setMetrics(data.value);
    };
    fetchMetrics();
  }, []);

  const getIcon = (iconName) => {
    const icons = { ShieldCheck, Users, GraduationCap, Globe2 };
    const Icon = icons[iconName] || ShieldCheck;
    return <Icon className="w-10 h-10" />;
  };

  const getIconColor = (index) => {
    const colors = ['text-green-500', 'text-blue-500', 'text-purple-500', 'text-cyan-500'];
    return colors[index % colors.length];
  };

  return (
    <section className={`py-20 bg-slate-950 border-y border-slate-900 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Statement */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-6">
            We Don't Guess. We Deliver.
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Our expertise is built on data, regulatory knowledge, and direct partnerships. 
            We prioritize transparency over promises, ensuring you have a realistic path to Europe.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
              <div className={`flex justify-center mb-4 ${getIconColor(index)}`}>
                {getIcon(metric.icon)}
              </div>
              <div className="text-4xl font-bold text-white mb-2">{metric.value}</div>
              <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left items-center">
             <div>
                <h3 className="text-xl font-bold text-white mb-2">Certified Excellence</h3>
                <p className="text-slate-400 text-sm">Recognized by top European institutions for compliance and student support quality.</p>
             </div>
             
             <div className="md:col-span-2 flex flex-col sm:flex-row justify-center md:justify-end gap-6">
                <div className="flex items-center gap-3 bg-slate-950 px-5 py-3 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-300 font-medium">Official University Reps</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-950 px-5 py-3 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-300 font-medium">Legal Compliance Checks</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-950 px-5 py-3 rounded-lg border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-300 font-medium">Transparent Pricing</span>
                </div>
             </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CredibilityBlock;